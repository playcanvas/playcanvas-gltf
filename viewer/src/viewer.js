var decoderModule;

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
    camera.addComponent('camera', {
        fov: 45.8366
    });
    camera.addComponent('script');
    camera.setPosition(0, 0, 1);
    app.root.addChild(camera);

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

        if (this.cameraPosition) {
            camera.script.orbitCamera.distance = this.cameraPosition.length();
        } else if (this.gltf) {
            camera.script.orbitCamera.focusEntity = this.gltf;
        }
    }.bind(this));

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

Viewer.prototype = {
    destroyScene: function () {
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
            if (this.camera.script.orbitCamera.focusEntity) {
                this.camera.script.orbitCamera.focusEntity = null;
            }
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
    },

    initializeScene: function (model, textures, animationClips) {
        var i;

        if (!this.onlyLoadAnimations) {
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

            // Add the loaded scene to the hierarchy
            this.gltf = new pc.Entity('gltf');
            this.gltf.addComponent('model', {
                asset: asset
            });
            this.app.root.addChild(this.gltf);

            // Now that the model is created, after translateAnimation, we have to hook here
            if (animationClips) {
                for (i = 0; i < animationClips.length; i++) {
                    for(var c = 0; c < animationClips[i].animCurves.length; c++) {
                        var curve = animationClips[i].animCurves[c];
                        if (curve.animTargets[0].targetNode === "model")
                            curve.animTargets[0].targetNode = this.gltf;
                    }
                }
            }
        }

        // Load any animations
        if (animationClips && animationClips.length > 0) {
            this.animationClips = animationClips;

            // If we don't already have an animation component, create one.
            // Note that this isn't really a 'true' component like those
            // found in the engine...
            if (!this.gltf.animComponent) {
                this.gltf.animComponent = new AnimationComponent();
            }

            // Add all animations to the model's animation component
            for (i = 0; i < animationClips.length; i++) {
                animationClips[i].transferToRoot(this.gltf);
                this.gltf.animComponent.addClip(animationClips[i]);
            }
            this.gltf.animComponent.playClip(animationClips[0].name);
        }

        // Focus the camera on the newly loaded scene
        if (this.camera.script.orbitCamera) {
            if (this.cameraPosition) {
                this.camera.script.orbitCamera.distance = this.cameraPosition.length();
            } else {
                this.camera.script.orbitCamera.focusEntity = this.gltf;
            }
        }
    },

    loadGlb: function (arrayBuffer) {
        loadGlb(arrayBuffer, this.app.graphicsDevice, this.initializeScene.bind(this));
    },

    loadGltf: function (gltf, basePath, processUri) {
        loadGltf(gltf, this.app.graphicsDevice, this.initializeScene.bind(this), {
            decoderModule: decoderModule,
            basePath: basePath,
            processUri: processUri
        });
    }
};

function getParameterByName(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, '\\$&');
    var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

function loadScript(src) {
    var head = document.getElementsByTagName('head')[0];
    var script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = src;
    return new Promise(function (resolve) {
        script.onload = resolve;
        head.appendChild(script);
    });
}

function main() {
    if (true) {//typeof WebAssembly !== 'object') {
        loadScript('../draco/draco_decoder.js').then(function () {
            decoderModule = DracoDecoderModule();
        });
    } else {
        loadScript('../draco/draco_wasm_wrapper.js').then(function () {
            fetch('../draco/draco_decoder.wasm').then(function (response) {
                response.arrayBuffer().then(function (arrayBuffer) {
                    decoderModule = DracoDecoderModule({ wasmBinary: arrayBuffer });
                });
            });
        });
    }

    var viewer = new Viewer();

    var assetUrl = getParameterByName('assetUrl');
    if (assetUrl) {
        if (assetUrl.endsWith('gltf')) {
            fetch(assetUrl)
                .then(function(response) {
                    response.json().then(function(gltf) {
                        var basePath = assetUrl.substring(0, assetUrl.lastIndexOf('/')) + "/";
                        viewer.loadGltf(gltf, basePath);
                    });
                });
        } else if (assetUrl.endsWith('glb')) {
            fetch(assetUrl)
                .then(function(response) {
                    response.arrayBuffer().then(function(glb) {
                        viewer.loadGlb(glb);
                    });
                });
        }
    }

    var cameraPosition = getParameterByName('cameraPosition');
    if (cameraPosition) {
        var pos = cameraPosition.split(',').map(Number);
        if (pos.length === 3) {
            viewer.cameraPosition = new pc.Vec3(pos);
        }
    }

    // Handle dropped GLB/GLTF files
    document.addEventListener('dragover', function (event) {
        event.preventDefault();
    }, false);

    document.addEventListener('drop', function (event) {
        event.preventDefault();

        var dropzone = document.getElementById('dropzone');
        dropzone.style.display = 'none';

        viewer.onlyLoadAnimations = event.ctrlKey;

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
                    viewer.loadGlb(arrayBuffer);
                } else if (extension === 'gltf') {
                    var decoder = new TextDecoder('utf-8');
                    var json = decoder.decode(arrayBuffer);
                    var gltf = JSON.parse(json);
                    viewer.loadGltf(gltf, undefined, processUri);
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