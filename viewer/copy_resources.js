const fs = require('fs');
const path = require('path');

function copy_resource(from, to) {
	if ( ! fs.existsSync(to)) {
		fs.mkdirSync(to);
	}
	var filename = path.basename(from);
	to = path.join(to, filename);
	// create or overwrite file
	fs.copyFile(from, to, (err) => {
		if (err) {
			console.warn(`[ERROR] Copy resource from ${from} to ${to}:`);
		} else {
			console.log(`[SUCCESS] Copy resource from ${from} to ${to}`);
		}
	});
}

const dir_resources = path.join("glTF Viewer-" + process.platform + "-x64", "resources");
const dir_resources_src = path.join(dir_resources, "src");
const dir_resources_draco = path.join(dir_resources, "draco");

copy_resource(path.join("..", "src"  , "playcanvas-anim.js"   ), dir_resources_src  );
copy_resource(path.join("..", "src"  , "playcanvas-gltf.js"   ), dir_resources_src  );
copy_resource(path.join("..", "draco", "draco_decoder.js"     ), dir_resources_draco);
copy_resource(path.join("..", "draco", "draco_decoder.wasm"   ), dir_resources_draco);
copy_resource(path.join("..", "draco", "draco_wasm_wrapper.js"), dir_resources_draco);
