init_overlay = function () {
    var overlay = document.getElementById("overlay");
    // give scripts the ability to determine if the event should be ignored
    overlay.onkeydown = function(event) {
        event.isOverlayEvent = true;
    };
    overlay.onmousedown = function(event) {
        event.isOverlayEvent = true;
    };
    overlay.onmousemove = function(event) {
        event.isOverlayEvent = true;
    };
    overlay.onmousewheel = function(event) {
        event.isOverlayEvent = true;
    };
    return overlay;
}

textarea_fit_text = function (textarea) {    
    var numNewlines = 1;
    var str = textarea.value;
    for (var i=0; i<str.length; i++)
        if (str[i] == "\n")
            numNewlines++;
    textarea.style.height = (numNewlines * 16) + "px";
}

textarea_enable_tab_indent = function (textarea) {    
    textarea.onkeydown = function(e) {
        if (e.keyCode == 9 || e.which == 9){
            e.preventDefault();
            var oldStart = this.selectionStart;
            var before   = this.value.substring(0, this.selectionStart);
            var selected = this.value.substring(this.selectionStart, this.selectionEnd);
            var after    = this.value.substring(this.selectionEnd);
            this.value = before + "    " + selected + after;
            this.selectionEnd = oldStart + 4;
        }
    }
}

select_add_option = function (select, option_text) {
    var option = document.createElement("option");
    option.text = option_text;
    select.add(option);
    return option;
}

select_remove_options = function (select) {
    for (var i=select.options.length-1; i>=0; i--)
        select.remove(i);
}

/**
 * @param {pc.Vec3} normal_ 
 * @param {pc.Vec3} position_ 
 * @param {pc.Quat} rotation_ 
 * @returns {pc.Entity}
 * @example
 * add_infinite_ground(new pc.Vec3(0, 1, 0), new pc.Vec3(0, 0, 0), pc.Quat.IDENTITY);
 */

function add_infinite_ground(normal_, position_, rotation_) {
    // there isn't any infinite plane in PlayCanvas (yet)
    // this just makes sure that entities arent falling into the void
    var normal        = new Ammo.btVector3   (  normal_.x,   normal_.y,   normal_.z             );
    var origin        = new Ammo.btVector3   (position_.x, position_.y, position_.z             );
    var rotation      = new Ammo.btQuaternion(rotation_.x, rotation_.y, rotation_.z, rotation_.w);
    var shape         = new Ammo.btStaticPlaneShape(normal, 0);
    var transform     = new Ammo.btTransform();
    transform.setIdentity();
    transform.setOrigin(origin);
    transform.setRotation(rotation);
    var localInertia  = new Ammo.btVector3(0, 0, 0);
    var motionState   = new Ammo.btDefaultMotionState(transform);
    var rigidBodyInfo = new Ammo.btRigidBodyConstructionInfo(0, motionState, shape, localInertia);
    var body          = new Ammo.btRigidBody(rigidBodyInfo);
    body.entity       = new pc.Entity("dummy entity for add_infinite_ground");
    app.root.addChild(body.entity);
    app.systems.rigidbody.dynamicsWorld.addRigidBody(body);
    return body;
}

/**
 * @param {pc.Entity} entity
 * @summary
 * clones a pc.Entity including the GLTF animation component
 */

function clone_gltf(entity) {
    // 1) clone entity
    var entity_clone = entity.clone();
    for (var i=0; i<entity.model.meshInstances.length; i++) {
        // visibility of meshInstances is not cloned, update manually:
        entity_clone.model.meshInstances[i].visible = entity.model.meshInstances[i].visible;
    }
    // 2) clone existing AnimationComponent, otherwise we are done
    if (!entity.animComponent)
        return entity_clone;
    // 3) assign new AnimationComponent
    entity_clone.animComponent = new AnimationComponent();
    // 4) clone animation clips
    var numClips = entity.animComponent.animClips.length;
    var animationClips = Array(numClips);
    for (var i=0; i<numClips; i++)
        animationClips[i] = entity.animComponent.animClips[i].clone();
    // 5) assign entity_clone to each clip->curve->target
    for (var i = 0; i < animationClips.length; i++) {
        var clip = animationClips[i];
        for(var c = 0; c < clip.animCurves.length; c++) {
            var curve = clip.animCurves[c];
            if (curve.animTargets[0].targetNode === "model")
                curve.animTargets[0].targetNode = entity_clone;
        }
    }
    // 6) Add all animations to the model's animation component
    for (i = 0; i < animationClips.length; i++) {
        var clip = animationClips[i];
        clip.transferToRoot(entity_clone);
        entity_clone.animComponent.addClip(clip);
    }
    return entity_clone;
}

/**
 * @param {pc.Entity} gltf
 * @param {number} x
 * @param {number} y
 * @param {number} z
 */

function gltf_clone_setpos_playclip(gltf, x, y, z) {
    var cloned = clone_gltf(gltf);
    cloned.enabled = true;
    cloned.setLocalPosition(x, y, z);
    if (gltf.animComponent) {
        var activeClipName = gltf.animComponent.curClip;
        var activeClip = cloned.animComponent.animClipsMap[activeClipName];
        activeClip.loop = true;
        activeClip.play();
    }
    return cloned;
}

clones = [];
clonesNextHeight = 0;
/**
 * @summary
 * clones the current viewer.gltf 64 times
 * 8 rows, 8 cols
 * useful for performance tracing
 */

function spawn8x8() {
    if (!viewer.gltf)
        return;
    var entity = viewer.gltf;
    var padding_x = 0;
    var padding_y = 0;
    var padding_z = 0;
    for (var i=0; i<entity.model.meshInstances.length; i++) {
        var aabb = entity.model.meshInstances[i].aabb;
        //console.log(aabb.halfExtents);
        padding_x = Math.max(padding_x, aabb.halfExtents.x * 2);
        padding_y = Math.max(padding_y, aabb.halfExtents.y * 2);
        padding_z = Math.max(padding_z, aabb.halfExtents.z * 2);
    }
    for (var i=1; i<=8; i++) {
        for (var j=1; j<=8; j++) {
            var clone = gltf_clone_setpos_playclip(
                entity,
                i * padding_x,     // x
                clonesNextHeight,  // y
                j * padding_z * -1 // z
            );
            clones.push(clone);
        }
    }
    clonesNextHeight += padding_y;
    // add all clones to scene
    for (var i=0; i<clones.length; i++) {
        var clone = clones[i];
        if (clone.parent) // only add non-parented clones to scene
            continue;
        viewer.app.root.addChild(clone);
    }
}