init_overlay = function () {
    var overlay = document.getElementById("overlay");
    // give scripts the ability to determine if the event should be ignored
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

// add_infinite_ground(new pc.Vec3(0, 1, 0), new pc.Vec3(0, 0, 0), pc.Quat.IDENTITY);
add_infinite_ground = function (normal_, position_, rotation_) {
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

