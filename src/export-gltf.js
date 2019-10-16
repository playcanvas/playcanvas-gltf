Object.assign(window, function () {

    function writeAsset(gltf, root) {
        gltf.asset = {
            version: "2.0",
            generator: "PlayCanvas"
        };
    }

    function writeNodes(gltf, root) {
        var nodes = [];
        root.forEach(function (entity) {
            nodes.push(entity);
        });
        
        if (nodes.length > 0) {
            gltf.nodes = [];
            nodes.forEach(function (entity) {
                var node = {};
                if (entity.name !== "") {
                    node.name = entity.name;
                }

                var r = entity.getLocalRotation();
                var t = entity.getLocalPosition();
                var s = entity.getLocalScale();
                if (!r.equals(pc.Quat.IDENTITY)) {
                    node.rotation = [ r.x, r.y, r.z, r.w ];
                }
                if (!s.equals(pc.Vec3.ONE)) {
                    node.scale = [ s.x, s.y, s.z ];
                }
                if (!t.equals(pc.Vec3.ZERO)) {
                    node.translation = [ t.x, t.y, t.z ];
                }

                if (entity.children.length > 0) {
                    node.children = [];
                    entity.children.forEach(function (child) {
                        node.children.push(nodes.indexOf(child));
                    });
                }
                gltf.nodes.push(node);
            });
        }
    }

    function download(buffers) {
        var element = document.createElement('a');
        var blob = new Blob(buffers, { type: "octet/stream" });
        element.href = URL.createObjectURL(blob);
        element.download = 'scene.glb';
        element.style.display = 'none';
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
    }

    function saveGlb(root) {
        var gltf = {};
        writeAsset(gltf, root);
        writeNodes(gltf, root);

        var gltfText = JSON.stringify(gltf);
        var gltfBuffer = new TextEncoder().encode(gltfText).buffer;

        // GLB header
        var headerBuffer = new ArrayBuffer(12);
        var headerView = new DataView(headerBuffer);
        headerView.setUint32(0, 0x46546C67, true);
        headerView.setUint32(4, 2, true);
        headerView.setUint32(8, 12 + 8 + gltfBuffer.byteLength, true);

        // JSON chunk header
        var jsonChunkBuffer = new ArrayBuffer(8);
        var jsonChunkView = new DataView(jsonChunkBuffer);
        jsonChunkView.setUint32( 0, gltfBuffer.byteLength, true );
        jsonChunkView.setUint32( 4, 0x4E4F534A, true );    

        var buffers = [ headerBuffer, jsonChunkBuffer, gltfBuffer ];
        download(buffers);
    };

    return {
        saveGlb: saveGlb
    };
}());
