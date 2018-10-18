FirstPersonMovement = pc.createScript('firstPersonMovement');

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
    this.camera     = null;
    this.isGrounded = false;
    this.force      = new pc.Vec3();
    this.eulers     = new pc.Vec3();
    this.groundRay  = new pc.Vec3();

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
};

// update code called every frame
FirstPersonMovement.prototype.update = function(dt) {
    var force = this.force;
    var app = this.app;

    // Get camera directions to determine movement directions
    var forward = this.camera.forward;
    var right = this.camera.right;
       

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

    // todo: figure out a sane system, like collision callbacks or box tracing
    var pos = this.entity.getPosition();
    this.groundRay.copy(pos);
    this.groundRay.y -= 1.0;
    this.isGrounded = false;
    pc.app.systems.rigidbody.raycastFirst(pos, this.groundRay, function (result) {
        this.isGrounded = true;
    }.bind(this));
    if (this.isGrounded && app.keyboard.isPressed(pc.KEY_SPACE)) {
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