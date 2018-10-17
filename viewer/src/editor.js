function createMaterial (color) {
    var material = new pc.StandardMaterial();
    material.diffuse = color;
    // we need to call material.update when we change its properties
    material.update()
    return material;
}

collide_dynamic = function (entity) {
    if (entity) {
        entity.addComponent("rigidbody", {type: "dynamic"});
        entity.addComponent("collision", {type: "mesh", model: entity.model.model});
        entity.addComponent("script");
        entity.script.create("pulse");
    } else {
        viewer.anim_info.innerHTML = "please load a gltf/glb first";
    }
};

collide_static = function (entity) {
    if (entity) {
        entity.addComponent("rigidbody", {type: "static"});
        entity.addComponent("collision", {type: "mesh", model: entity.model.model});
        entity.addComponent("script");
        entity.script.create("pulse");
    } else {
        viewer.anim_info.innerHTML = "please load a gltf/glb first";
    }
};


Editor = function () {
    this.rainedEntities = [];
    this.initScripts();
    viewer.camera.script.create("pickerRaycast");
    // Set the gravity for our rigid bodies
    app.systems.rigidbody.setGravity(0, -9.8, 0);

    // create a few materials for our objects
    this.white = createMaterial(new pc.Color(1, 1, 1));
    this.red = createMaterial(new pc.Color(1, 0, 0));
    this.green = createMaterial(new pc.Color(0, 1, 0));
    this.blue = createMaterial(new pc.Color(0, 0, 1));
    this.yellow = createMaterial(new pc.Color(1, 1, 0));

    this.createFloor();
    this.createLights();
    this.createTemplates();
    
    // ***********    Update Function   *******************

    // initialize variables for our update function
    var timer = 0;
    var count = 40;

    // Set an update function on the application's update event
    app.on("update", function (dt) {
        // create a falling box every 0.2 seconds
        if (count > 0) {
            timer -= dt;
            if (timer <= 0) {
                count--;
                timer = 0.2;
                editor.rainEntity();
            }
        }
    });   
}

Editor.prototype.createFloor = function () {
    var floor = new pc.Entity();
    this.floor = floor;
    floor.addComponent("model", {
        type: "box"
    });

    // make the floor white
    floor.model.material = this.white;

    // scale it
    floor.setLocalScale(10, 1, 10);

    // add a rigidbody component so that other objects collide with it
    floor.addComponent("rigidbody", {
        type: "static",
        restitution: 0.5
    });

    // add a collision component
    floor.addComponent("collision", {
        type: "box",
        halfExtents: new pc.Vec3(5, 0.5, 5)
    });

    // add the floor to the hierarchy
    app.root.addChild(floor);
}

Editor.prototype.createLights = function () {
    // make our scene prettier by adding a directional light
    var light = new pc.Entity();
    light.addComponent("light", {
        type: "directional",
        color: new pc.Color(10, 11, 11),
        castShadows: true,
        shadowBias: 0.05,
        normalOffsetBias: 0.05,
        shadowResolution: 2048
    });

    // set the direction for our light
    light.setLocalEulerAngles(45, 30, 0);

    // Add the light to the hierarchy
    app.root.addChild(light);
}

Editor.prototype.createTemplates = function () {

    // Create a template for a falling box
    // It will have a model component of type 'box'...
    var boxTemplate = new pc.Entity();
    boxTemplate.addComponent("model", {
        type: "box",
        castShadows: true
    });

     // ...a rigidbody component of type 'dynamic' so that it is simulated
    // by the physics engine...
    boxTemplate.addComponent("rigidbody", {
        type: "dynamic",
        mass: 50,
        restitution: 0.5
    });

    // ... and a collision component of type 'box'
    boxTemplate.addComponent("collision", {
        type: "box",
        halfExtents: new pc.Vec3(0.5, 0.5, 0.5)
    });

    // make the box red
    boxTemplate.model.material = this.red;

    // Create other shapes too for variety...

    // A sphere...
    var sphereTemplate = new pc.Entity();
    sphereTemplate.addComponent("model", {
        type: "sphere",
        castShadows: true
    });

    sphereTemplate.addComponent("rigidbody", {
        type: "dynamic",
        mass: 50,
        restitution: 0.5
    });

    sphereTemplate.addComponent("collision", {
        type: "sphere",
        radius: 0.5
    });


    // make the sphere green
    sphereTemplate.model.material = this.green;

    // A capsule...
    var capsuleTemplate = new pc.Entity();
    capsuleTemplate.addComponent("model", {
        type: "capsule",
        castShadows: true
    });

    capsuleTemplate.addComponent("rigidbody", {
        type: "dynamic",
        mass: 50,
        restitution: 0.5
    });

    capsuleTemplate.addComponent("collision", {
        type: "capsule",
        radius: 0.5,
        height: 2
    });


    // make the capsule blue
    capsuleTemplate.model.material = this.blue;

    // A cylinder...
    var cylinderTemplate = new pc.Entity();
    cylinderTemplate.addComponent("model", {
        type: "cylinder",
        castShadows: true
    });

    cylinderTemplate.addComponent("rigidbody", {
        type: "dynamic",
        mass: 50,
        restitution: 0.5
    });

    cylinderTemplate.addComponent("collision", {
        type: "cylinder",
        radius: 0.5,
        height: 1
    });


    // make the cylinder yellow
    cylinderTemplate.model.material = this.yellow;

    // add all the templates to an array so that
    // we can randomly spawn them
    this.templates = [boxTemplate, sphereTemplate, capsuleTemplate, cylinderTemplate];

    // disable the templates because we don't want them to be visible
    // we'll just use them to clone other Entities
    this.templates.forEach(function (template) {
        template.enabled = false;
    });
}

Editor.prototype.rainEntity = function () {
    // Clone a random template and position it above the floor
    var template = this.templates[Math.floor(pc.math.random(0, this.templates.length))];
    var clone = template.clone();
    clone.enabled = true; // enable the clone because the template is disabled
    app.root.addChild(clone);
    clone.rigidbody.teleport(pc.math.random(-1, 1), 10, pc.math.random(-1, 1));
    this.rainedEntities.push(clone);
    clone.addComponent("script");
    clone.script.create("pulse");
    return clone;
}

Editor.prototype.initScripts = function () {
    var PickerRaycast = pc.createScript('pickerRaycast');
    PickerRaycast.prototype.initialize = function() {
        this.app.mouse.on(pc.EVENT_MOUSEDOWN, this.onSelect, this);
    };
    PickerRaycast.prototype.onSelect = function (e) {
        var from = this.entity.camera.screenToWorld(e.x, e.y, this.entity.camera.nearClip);
        var to = this.entity.camera.screenToWorld(e.x, e.y, this.entity.camera.farClip);

        var result = this.app.systems.rigidbody.raycastFirst(from, to);
        if (result) {
            var pickedEntity = result.entity;
            try {
                pickedEntity.script.pulse.pulse();
            } catch (ex) {
                console.log("pickedEntity", pickedEntity);
            }
        }
    };

    var Pulse = pc.createScript("pulse");
    Pulse.prototype.initialize = function() {
        this.factor = 0;
    }, Pulse.prototype.pulse = function() {
        this.factor = 1;
    }, Pulse.prototype.update = function(t) {
        if (this.factor > 0) {
            this.factor -= t;
            var e = 1 + Math.sin(10 * this.factor) * this.factor;
            this.entity.setLocalScale(e, e, e);
        }
    };
}
