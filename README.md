# playcanvas-gltf
This repo extends PlayCanvas to support glTF. It contains:

* A loader script that can convert a glTF or glB file into a PlayCanvas hierarchy.
* A viewer application that supports drag and drop of glTF and glB files.

The loader script returns a hierarchy of pc.Entity structures. It can be used with the standalone Engine or in conjunction with the PlayCanvas Editor.

To see an example of using the loader with the Engine, check out the viewer app in this repo.

To use the loader with the Editor, simply add gltf-loader.js and monkey-patch.js into your project.

# API
```
loadGlb(ArrayBuffer glb, pc.GraphicsDevice device);
```
* glb - An ArrayBuffer holding the binary glb file data
* device - The graphics device

```
loadGltf(Object gltf, pc.GraphicsDevice device);
```
* gltf - The glTF root object
* device - The graphics device

# glTF Viewer
To load the glTF viewer, run a local web-server and load viewer/index.html. You can then drag a glb or gltf file onto the tab's client area to load it.
