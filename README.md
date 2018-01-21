# playcanvas-gltf
![gtTF viewer](/images/playcanvas-gltf-viewer.jpg?raw=true "glTF Viewer")

This repo extends PlayCanvas to support glTF. It contains:

* A loader script that can convert a glTF or glB file into a PlayCanvas hierarchy.
* A viewer application that supports drag and drop of glTF and glB files.

The loader script returns a hierarchy of pc.Entity structures. It can be used with the standalone Engine or in conjunction with the PlayCanvas Editor.

To see an example of using the loader with the Engine, check out the viewer app in this repo.

To use the loader with the Editor, simply add gltf-loader.js into your project and call the following API:

# API
```
loadGlb(ArrayBuffer glb, pc.GraphicsDevice device, Function success);
```
* glb - An ArrayBuffer holding the binary glb file data.
* device - The graphics device.
* success - Function called when the glb has successfully loaded. Called with an array of entities representing the root nodes of the glTF scene.
```
loadGltf(Object gltf, pc.GraphicsDevice device, ArrayBuffer buffers, File[] files, Function success);
```
* gltf - The glTF root object.
* device - The graphics device.
* buffers - Optionally preloaded ArrayBuffer objects holding glTF buffers.
* files - A hash map of filenames to File objects containing images/buffers referenced by the glTF files.
* success - Function called when the gltf has successfully loaded. Called with an array of entities representing the root nodes of the glTF scene.

# glTF Viewer
To load the glTF viewer, run a local web-server and load viewer/index.html. You can then drag a glb or gltf file onto the tab's client area to load it. For non-embedded glTF files (with external buffer and image files), you need to drag the containing folder of the glTF file onto the viewer's client area.
