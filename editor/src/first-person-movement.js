var FirstPersonMovement = pc.createScript('firstPersonMovement');

// optional, assign a camera entity, otherwise one is created
FirstPersonMovement.attributes.add('camera', {
    type: 'entity'
});

FirstPersonMovement.attributes.add('power', {
    type: 'number',
    default: 2500
});

FirstPersonMovement.attributes.add('lookSpeed', {
    type: 'number',
    default: 360 / screen.width // move cursor from left to right on your screen == 1 rotation ingame
});

// initialize code called once per entity
FirstPersonMovement.prototype.initialize = function() {
    this.camera       = null;
    this.force        = new pc.Vec3();
    this.eulers       = new pc.Vec3();
    this.groundRay    = new pc.Vec3();
    this.lastGroundCollision = 0;
    this.newJumpAllowedAt    = 0;
    var app = this.app;

    // Listen for mouse move events
    app.mouse.on("mousemove", this._onMouseMove, this);

    // when the mouse is clicked hide the cursor
    app.mouse.on("mousedown", function (e) {
        if (e.event.isOverlayEvent === true)
            return;
        app.mouse.enablePointerLock();
    }, this);            

    // Check for required components
    if (!this.entity.collision) {
        console.error("First Person Movement script needs to have a 'collision' component");
    }

    if (!this.entity.rigidbody || this.entity.rigidbody.type !== pc.BODYTYPE_DYNAMIC) {
        console.error("First Person Movement script needs to have a DYNAMIC 'rigidbody' component");
    }
    
    // If a camera isn't assigned from the Editor, create one
    if ( ! this.camera) {
        this._createCamera();
    }
    
    this.entity.collision.on("contact", this.onContact, this);
};

/*
Example result for standing on rigidbody floor:
    contactResult.contacts[0]
    [ContactPoint]
    localPoint     : Vec3 {x: -0.002215355634689331    , y: -0.9999810457229614, z:  0.0017574280500411987   }
    localPointOther: Vec3 {x:  0.16426098346710205     , y:  0.5               , z: -0.125589519739151       }
    normal         : Vec3 {x: -0.0000018488642581360182, y: -1                 , z:  0.0000068243434725445695}
    point          : Vec3 {x:  0.16426098346710205     , y:  0.500004768371582 , z: -0.125589519739151       }
    pointOther     : Vec3 {x:  0.16426098346710205     , y:  0.5               , z: -0.125589519739151       }
*/

FirstPersonMovement.prototype.onContact = function(contactResult) {
    var contacts = contactResult.contacts;
    var n = contacts.length;
    var foundGroundCollision = false;
    for (var i = 0; i < n; i++) {
        var contact = contacts[i];
        // special case for the infinite plane
        // the contact.normal will be [0,1,0]
        // however, standing on the ridigbody floor will be [0,-1,0]'ish
        // and to make it even more complex, a gltf physics model "floor" is [0,1,0]'ish
        // trying to allow a certain slope only for jumping is kinda hard with these conditions...
        // so currently i just do: if there is a contact, allow jumping
        if (contact.normal.equals(pc.Vec3.UP)) {
            foundGroundCollision = true;
            break;
        }
        //viewer.anim_info.innerHTML = contact.normal.dot( pc.Vec3.DOWN );
        //viewer.anim_info.innerHTML = contact.normal;
        // always true for `n > 0`
        // until the collision normals are fixed for a dot()>slope check
        foundGroundCollision = true;
    }
    if (foundGroundCollision) {
        this.lastGroundCollision = pc.now();
    }
    //console.log(arguments);
}

// update code called every frame
FirstPersonMovement.prototype.update = function(dt) {
    var force = this.force;
    var app = this.app;

    // Get camera directions to determine movement directions
    var forward = this.camera.forward;
    var right = this.camera.right;
       
    //viewer.anim_info.innerHTML = pc.now() - this.lastGroundCollision + "ms";
       
    // allow jump if touched a ground in last 100ms
    if (pc.now() - this.lastGroundCollision < 100) {
        this.isGrounded = true;
    } else {
        this.isGrounded = false;
    }
    
    // movement
    var x = 0;
    var z = 0;

    // Use W-A-S-D keys to move player
    // Check for key presses
    if (app.keyboard.isPressed(pc.KEY_A) || app.keyboard.isPressed(pc.KEY_Q)) {
        x -= right.x;
        z -= right.z;
    }

    if (app.keyboard.isPressed(pc.KEY_D)) {
        x += right.x;
        z += right.z;
    }

    if (app.keyboard.isPressed(pc.KEY_W)) {
        x += forward.x;
        z += forward.z;
    }

    if (app.keyboard.isPressed(pc.KEY_S)) {
        x -= forward.x;
        z -= forward.z;
    }

    // use direction from keypresses to apply a force to the character
    if (x !== 0 && z !== 0) {
        force.set(x, 0, z).normalize();
        force.scale(this.power);
        var speed = this.entity.rigidbody.linearVelocity.length();
        //viewer.anim_info.innerHTML = speed;
        if (speed < 10)
            this.entity.rigidbody.applyForce(force);
        //this.entity.rigidbody.applyImpulse(force);
        //this.entity.rigidbody.linearVelocity = force;
    }

    // max 1 jump per 500ms
    var canJump = pc.now() - this.newJumpAllowedAt > 500;
    
    if (canJump && this.isGrounded && app.keyboard.isPressed(pc.KEY_SPACE)) {
        this.lastGroundCollision = 0; // reset timer
        this.newJumpAllowedAt = pc.now() + 500;
        force.set(0, 400, 0);
        this.entity.rigidbody.applyImpulse(force);
    }
    
    // update camera angle from mouse events
    this.camera.setLocalEulerAngles(this.eulers.y, this.eulers.x, 0);
};

FirstPersonMovement.prototype._onMouseMove = function (e) {
    if (e.event.isOverlayEvent === true)
        return;
    // If pointer is disabled
    // If the left mouse button is down update the camera from mouse movement
    if (pc.Mouse.isPointerLocked() || e.buttons[0]) {
        this.eulers.x -= this.lookSpeed * e.dx;
        this.eulers.y -= this.lookSpeed * e.dy;
        this.eulers.y = pc.math.clamp(this.eulers.y, -90, 90);
    }            
};

FirstPersonMovement.prototype._createCamera = function () {
    // If user hasn't assigned a camera, create a new one
    this.camera = new pc.Entity();
    this.camera.setName("First Person Camera");
    this.camera.addComponent("camera", {
        fov: 100
    });
    this.entity.addChild(this.camera);
    this.camera.translateLocal(0, 0.5, 0);
};