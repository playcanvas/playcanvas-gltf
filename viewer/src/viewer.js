function Viewer() {
    var canvas = document.createElement('canvas');
    document.body.appendChild(canvas);

    var app = new pc.Application(canvas, {
        mouse: new pc.Mouse(document.body),
        keyboard: new pc.Keyboard(window)
    });
    app.start();

    // Fill the available space at full resolution
    app.setCanvasFillMode(pc.FILLMODE_FILL_WINDOW);
    app.setCanvasResolution(pc.RESOLUTION_AUTO);

    app.scene.gammaCorrection = pc.GAMMA_SRGB;
    app.scene.toneMapping = pc.TONEMAP_ACES;

    // Ensure canvas is resized when window changes size
    window.addEventListener('resize', function() {
        app.resizeCanvas();
    });

    // Create camera entity
    var camera = new pc.Entity('camera');
    camera.addComponent('camera');
    camera.addComponent('script');
    app.root.addChild(camera);
    camera.setLocalPosition(0, 0, 1);

    // Make the camera interactive
    app.assets.loadFromUrl('./src/orbit-camera.js', 'script', function (err, asset) {
        camera.script.create('orbitCamera', {
            attributes: {
                inertiaFactor: 0,
                distanceMin: 0,
                distanceMax: 0,
                pitchAngleMax: 90,
                pitchAngleMin: -90,
                frameOnStart: true
            }
        });
        camera.script.create('keyboardInput');
        camera.script.create('mouseInput', {
            attributes: {
                orbitSensitivity: 0.3,
                distanceSensitivity: 0.15
            }
        });
    });

    // Create directional light entity
    var light = new pc.Entity('light');
    light.addComponent('light');
    light.setEulerAngles(45, 0, 0);
    app.root.addChild(light);

    // Set a prefiltered cubemap as the skybox
    var cubemapAsset = new pc.Asset('helipad', 'cubemap', {
        url: "./assets/cubemap/6079289/Helipad.dds"
    }, {
        "textures": [
            "./assets/cubemap/6079292/Helipad_posx.png",
            "./assets/cubemap/6079290/Helipad_negx.png",
            "./assets/cubemap/6079293/Helipad_posy.png",
            "./assets/cubemap/6079298/Helipad_negy.png",
            "./assets/cubemap/6079294/Helipad_posz.png",
            "./assets/cubemap/6079300/Helipad_negz.png"
        ],
        "magFilter": 1,
        "minFilter": 5,
        "anisotropy": 1,
        "name": "Helipad",
        "rgbm": true,
        "prefiltered": "Helipad.dds"
    });
    app.assets.add(cubemapAsset);
    app.assets.load(cubemapAsset);
    cubemapAsset.ready(function () {
        app.scene.skyboxMip = 2;
        app.scene.setSkybox(cubemapAsset.resources);
    });

    this.app = app;
    this.camera = camera;

    // Press 'D' to delete the currently loaded model
    app.on('update', function () {
        if (this.app.keyboard.wasPressed(pc.KEY_D)) {
            this.destroyScene();
        }
    }, this);
}

Viewer.prototype.destroyScene = function () {
    if (this.textures) {
        this.textures.forEach(function (texture) {
            texture.destroy();
        });
    }

    // First destroy the glTF entity...
    if (this.gltf) {
        if (this.gltf.animComponent) {
            this.gltf.animComponent.stopClip();
        }
        this.camera.script.orbitCamera.focusEntity = null;
        this.gltf.destroy();
    }

    // ...then destroy the asset. If not done in this order,
    // the entity will be retained by the JS engine.
    if (this.asset) {
        this.app.assets.remove(this.asset);
        this.asset.unload();
    }

    // Blow away all properties holding the loaded scene
    delete this.asset;
    delete this.textures;
    delete this.animationClips;
    delete this.gltf;
};

Viewer.prototype.initializeScene = function (model, textures, animationClips) {
    // Blow away whatever is currently loaded
    this.destroyScene();

    // Wrap the model as an asset and add to the asset registry
    var asset = new pc.Asset('gltf', 'model', {
        url: ''
    });
    asset.resource = model;
    asset.loaded = true;
    this.app.assets.add(asset);

    // Store the loaded resources
    this.asset = asset;
    this.textures = textures;
    this.animationClips = animationClips;

    // Add the loaded scene to the hierarchy
    this.gltf = new pc.Entity('gltf');
    this.gltf.addComponent('model', {
        asset: asset
    });
    this.app.root.addChild(this.gltf);

    // If there are any animations, play the first one
    if (animationClips && animationClips.length > 0) {
        var animComponent = new AnimationComponent();
        animationClips[0].transferToRoot(this.gltf);
        animComponent.addClip(animationClips[0]);
        animComponent.playClip(animationClips[0].name);

        // This isn't a 'real' component. Let's just hang it off the 
        // glTF root entity.
        this.gltf.animComponent = animComponent;
    }

    // Focus the camera on the newly loaded scene
    this.camera.script.orbitCamera.focusEntity = this.gltf;
};

Viewer.prototype.loadGlb = function (arrayBuffer) {
    loadGlb(arrayBuffer, this.app.graphicsDevice, this.initializeScene.bind(this));
};

Viewer.prototype.loadGltf = function (arrayBuffer, processUri) {
    var decoder = new TextDecoder('utf-8');
    var json = decoder.decode(arrayBuffer);
    var gltf = JSON.parse(json);
    loadGltf(gltf, this.app.graphicsDevice, this.initializeScene.bind(this), {
        processUri: processUri
    });
};

// Incrementally add animations to loaded characters
Viewer.prototype.addAnimation = function(roots) {
    if(this.gltfRoot.children.length === 0)
        return;

    // Check newly loaded animation
    var animRoot = null;
    if(roots && roots.length > 0)
        animRoot = roots[0];
    var animComponent = null;
    if(animRoot && animRoot.script && animRoot.script.anim && animRoot.script.anim.animComponent.clipCount() > 0) 
        animComponent = animRoot.script.anim.animComponent;
    else 
        return; 

    // Add to character's animation component
    var characterRoot = this.gltfRoot.children[0];
    if(!characterRoot.script)
        characterRoot.addComponent('script'); 
    if (!characterRoot.script.anim) 
    {
        characterRoot.script.create('anim');
        characterRoot.script.anim.animComponent = new AnimationComponent();  
    }
    var characterAnimComponent = characterRoot.script.anim.animComponent; 
    characterAnimComponent.stopClip();

    var clipNames = Object.keys(animComponent.animClips);
    for(var i = 0; i < clipNames.length; i ++)
    {
        var cname = clipNames[i];
        var clip = animComponent.animClips[cname];
        // Transfer the animation clip to character's root
        clip.transferToRoot(characterRoot);
        characterAnimComponent.addClip(clip); 
        characterAnimComponent.curClip = clip.name;
    } 
    if(characterAnimComponent.getCurrentClip()){
        //characterAnimComponent.getCurrentClip().resetSession();
        characterAnimComponent.getCurrentClip().loop = true;  
        characterAnimComponent.getCurrentClip().play();
    }
};

Viewer.prototype.addGltf = function(arrayBuffer, processUri) {
    var decoder = new TextDecoder('utf-8');
    var json = decoder.decode(arrayBuffer);
    var gltf = JSON.parse(json);
    var onSuccess = function (roots) { this.addAnimation(roots); }.bind(this);
    loadGltf(gltf, this.app.graphicsDevice, onSuccess, {processUri: processUri});  
};

Viewer.prototype.addGlb = function (arrayBuffer) {  
    var onSuccess = function (roots) { this.addAnimation(roots); }.bind(this);
    loadGlb(arrayBuffer, this.app.graphicsDevice,  onSuccess);
};

function main() {
    var viewer;

    // Handle dropped GLB/GLTF files
    document.addEventListener('dragover', function (event) {
        event.preventDefault();
    }, false); 

    var bAddAnimation = false;
    document.addEventListener('dblclick', function(event) { bAddAnimation = !bAddAnimation; }, false);

    document.addEventListener('drop', function (event) {
        event.preventDefault(); 
 
        var dropzone = document.getElementById('dropzone');
        dropzone.style.display = 'none';

        if (!viewer)
            viewer = new Viewer();
        
        var bAddMode = bAddAnimation; // event.ctrlKey;
        var loadFile = function (file, availableFiles) {
            var processUri = function (uri, success) {
                for (filename in availableFiles) {
                    if (filename.endsWith(uri)) {
                        if (uri.endsWith('.bin')) {
                            var fr = new FileReader();
                            fr.onload = function() {
                                success(fr.result);
                            };
                            fr.readAsArrayBuffer(availableFiles[filename]);
                        } else { // ...it's an image
                            var url = URL.createObjectURL(availableFiles[filename]);
                            success(url);
                        }
                    }
                }
            };

            var fr = new FileReader();
            fr.onload = function() {
                var arrayBuffer = fr.result;
                var extension = file.name.split('.').pop();

                if (extension === 'glb') {
                    if(bAddAnimation) viewer.addGlb(arrayBuffer);
                    else viewer.loadGlb(arrayBuffer);
                } else if (extension === 'gltf') {
                    if(bAddAnimation) viewer.addGltf(arrayBuffer, processUri);
                    else viewer.loadGltf(arrayBuffer, processUri);
                }
            };
            fr.readAsArrayBuffer(file);
        };

        var getFiles = function (success) {
            var foldersRequested = 0;
            var foldersCompleted = 0;
            var filesRequested = 0;
            var filesCompleted = 0;

            var files = {};

            var loadEntries = function (entries) {
                var entry = entries.pop();
                if (entry.isFile) {
                    filesRequested++;
                    entry.file(function (file) {
                        files[entry.fullPath] = file;
                        filesCompleted++;
                        if ((foldersRequested === foldersCompleted) && (filesRequested === filesCompleted)) {
                            success(files);
                        }
                    });
                    if (entries.length > 0) {
                        loadEntries(entries);
                    }
                } else if (entry.isDirectory) {
                    foldersRequested++;
                    var reader = entry.createReader();
                    reader.readEntries(function (entries) {
                        loadEntries(entries);
                        foldersCompleted++;
                        if ((foldersRequested === foldersCompleted) && (filesRequested === filesCompleted)) {
                            success(files);
                        }
                    });
                }
            };

            var i;
            var items = event.dataTransfer.items;
            if (items) {
                var entries = [];
                for (i = 0; i < items.length; i++) {
                    entries[i] = items[i].webkitGetAsEntry();
                }
                loadEntries(entries);
            }
        };

        getFiles(function (files) {
            for (var filename in files) {
                if (filename.endsWith('.gltf') || filename.endsWith('.glb')) {
                    loadFile(files[filename], files);
                }
            };
        }); 

    }, false);
}