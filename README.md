# playcanvas-gltf
![gtTF viewer](/images/playcanvas-gltf-viewer.jpg?raw=true "glTF Viewer")

This repo extends PlayCanvas to support glTF. It contains:

* A loader script that can convert a glTF or glB file into a PlayCanvas hierarchy.
* A viewer application that supports drag and drop of glTF and glB files.

The loader script returns a pc.Model structure. It can be used with the standalone Engine or in conjunction with the PlayCanvas Editor.

To see an example of using the loader with the Engine, check out the viewer app in this repo.

To use the loader with the Editor, simply add [playcanvas-gltf.js](https://github.com/playcanvas/playcanvas-gltf/blob/master/src/playcanvas-gltf.js) and [playcanvas-anim.js](https://github.com/playcanvas/playcanvas-gltf/blob/master/src/playcanvas-anim.js) into your project (ensuring they are first in your loading order) and call the following API:

# API

## loadGlb
Parses an [ArrayBuffer](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer) holding a binary-encoded glTF scene.
```
loadGlb(glb, device, success);
```
* glb - An [ArrayBuffer](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer) holding the binary glb file data.
* device - A [pc.GraphicsDevice](https://developer.playcanvas.com/en/api/pc.GraphicsDevice.html).
* done - A [Function](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function) called when the glb has loaded (either successfully or with an error). Called with a [pc.Model](https://developer.playcanvas.com/en/api/pc.Model.html) object representing the glTF scene, an array of [pc.Texture](https://developer.playcanvas.com/en/api/pc.Texture.html) objects and an array of AnimationClip objects.

### Example
```javascript
app.assets.loadFromUrl('assets/monkey/monkey.glb', 'binary', function (err, asset) {
    var glb = asset.resource;
    loadGlb(glb, app.graphicsDevice, function (err, res) {
        // Wrap the model as an asset and add to the asset registry
        var asset = new pc.Asset('gltf', 'model', {
            url: ''
        });
        asset.resource = res.model;
        asset.loaded = true;
        app.assets.add(asset);

        // Add the loaded scene to the hierarchy
        var gltf = new pc.Entity('gltf');
        gltf.addComponent('model', {
            asset: asset
        });
        app.root.addChild(gltf);
    });
});
```

## loadGltf
Parses an in-memory Object hierarchy holding a glTF scene.
```
loadGltf(gltf, device, success, options);
```
* gltf - An [Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object) representing the root of the glTF scene.
* device - A [pc.GraphicsDevice](https://developer.playcanvas.com/en/api/pc.GraphicsDevice.html).
* done - A [Function](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function) called when the glb has loaded (either successfully or with an error). Called with a [pc.Model](https://developer.playcanvas.com/en/api/pc.Model.html) object representing the glTF scene, an array of [pc.Texture](https://developer.playcanvas.com/en/api/pc.Texture.html) objects and an array of AnimationClip objects.
* options - An [Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object) specifying optional parameters for the function.
* options.buffers - An [Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array) of preloaded [ArrayBuffer](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer) objects holding the glTF file's buffer data.
* options.basePath - A [String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String) set to the relative path of the glTF file.
* options.processUri - A [Function](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function) that provides custom loading behavior for URIs encountered during the loading process.

### Example
```javascript
app.assets.loadFromUrl('assets/monkey/monkey.gltf', 'json', function (err, asset) {
    var json = asset.resource;
    var gltf = JSON.parse(json);
    loadGltf(gltf, app.graphicsDevice, function (err, res) {
        // Wrap the model as an asset and add to the asset registry
        var asset = new pc.Asset('gltf', 'model', {
            url: ''
        });
        asset.resource = res.model;
        asset.loaded = true;
        app.assets.add(asset);

        // Add the loaded scene to the hierarchy
        var gltf = new pc.Entity('gltf');
        gltf.addComponent('model', {
            asset: asset
        });
        app.root.addChild(gltf);
    }, {
        basePath: 'assets/monkey/'
    });
});
```

# glTF Viewer
To load the glTF viewer, run a local web-server and load viewer/index.html. You can then drag a glb or gltf file onto the tab's client area to load it. For non-embedded glTF files (with external buffer and image files), you need to drag the containing folder of the glTF file onto the viewer's client area. Binaries for the viewer can be found [here](https://github.com/playcanvas/playcanvas-gltf/releases).
