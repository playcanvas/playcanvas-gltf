function main() {
    var canvas = document.createElement('canvas');
    document.body.appendChild(canvas);

    var app = new pc.Application(canvas, {
        mouse: new pc.Mouse(document.body),
        keyboard: new pc.Keyboard(window)
    });
    app.start();

    // fill the available space at full resolution
    app.setCanvasFillMode(pc.FILLMODE_FILL_WINDOW);
    app.setCanvasResolution(pc.RESOLUTION_AUTO);

    app.scene.gammaCorrection = pc.GAMMA_SRGB;
    app.scene.toneMapping = pc.TONEMAP_ACES;

    // ensure canvas is resized when window changes size
    window.addEventListener('resize', function() {
        app.resizeCanvas();
    });

    // create camera entity
    var camera = new pc.Entity('camera');
    camera.addComponent('camera');
    camera.addComponent('script');
    app.root.addChild(camera);
    camera.setLocalPosition(0, 0, 1);

    // make the camera interactive
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

    // create directional light entity
    var light = new pc.Entity('light');
    light.addComponent('light');
    light.setEulerAngles(45, 0, 0);
    app.root.addChild(light);

    // root entity for loaded gltf scenes which can have more than one root entity
    var gltfRoot = new pc.Entity('gltf');
    app.root.addChild(gltfRoot);

    // set a prefiltered cubemap as the skybox
    var cubemapAsset = new pc.Asset('helipad', 'cubemap', {
        url: "./cubemap/6079289/Helipad.dds"
    }, {
        "textures": [
            "./cubemap/6079292/Helipad_posx.png",
            "./cubemap/6079290/Helipad_negx.png",
            "./cubemap/6079293/Helipad_posy.png",
            "./cubemap/6079298/Helipad_negy.png",
            "./cubemap/6079294/Helipad_posz.png",
            "./cubemap/6079300/Helipad_negz.png"
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

    // handle dropped GLB/GLTF files
    document.addEventListener('dragover', function (event) {
        event.preventDefault();
    }, false);
    document.addEventListener('drop', function (event) {
        event.preventDefault();

        var initScene = function (roots) {
            // add the loaded scene to the hierarchy
            roots.forEach(function (root) {
                gltfRoot.addChild(root);
            });

            // focus the camera on the newly loaded scene
            camera.script.orbitCamera.focusEntity = gltfRoot;
        };

        var loadFile = function (file, availableFiles) {
            var fr = new FileReader();
            fr.onload = function() {
                var arrayBuffer = fr.result;
                var extension = file.name.split('.').pop();

                // empty the current scene
                while (gltfRoot.children.length > 0) {
                    var child = gltfRoot.children[0];
                    gltfRoot.removeChild(child);
                    child.destroy();
                }

                if (extension === 'glb') {
                    loadGlb(arrayBuffer, app.graphicsDevice, function (roots) {
                        initScene(roots);
                    });
                } else if (extension === 'gltf') {
                    var decoder = new TextDecoder('utf-8');
                    var json = decoder.decode(arrayBuffer);
                    var gltf = JSON.parse(json);
                    loadGltf(gltf, app.graphicsDevice, null, availableFiles, function (roots) {
                        initScene(roots);
                    });
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