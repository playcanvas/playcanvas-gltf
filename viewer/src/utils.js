init_overlay = function () {
    var overlay = document.getElementById("overlay");
    // give scripts the ability to determine if the event should be ignored
    overlay.onmousedown = function(event) {
        event.isOverlayEvent = true;
    };
    overlay.onmousemove = function(event) {
        event.isOverlayEvent = true;
    };
    return overlay;
}

// add_infinite_ground(new pc.Vec3(0, 1, 0), new pc.Vec3(0, 0, 0))
add_infinite_ground = function (normal_, origin_) {
    // there isn't any infinite plane in PlayCanvas (yet)
    // this just makes sure that entities arent falling into the void
    var normal        = new Ammo.btVector3(normal_.x, normal_.y, normal_.z);
    var origin        = new Ammo.btVector3(origin_.x, origin_.y, origin_.z);
    var shape         = new Ammo.btStaticPlaneShape(normal, 0);
    var transform     = new Ammo.btTransform();
    transform.setIdentity();
    transform.setOrigin(origin);
    var localInertia  = new Ammo.btVector3(0, 0, 0);
    var motionState   = new Ammo.btDefaultMotionState(transform);
    var rigidBodyInfo = new Ammo.btRigidBodyConstructionInfo(0, motionState, shape, localInertia);
    var body          = new Ammo.btRigidBody(rigidBodyInfo);
    app.systems.rigidbody.dynamicsWorld.addRigidBody(body);
}

