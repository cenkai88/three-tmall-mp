import { EXTENSIONS } from "./utils";

/**
 * meshopt BufferView Compression Extension
 *
 * Specification: https://github.com/KhronosGroup/glTF/tree/master/extensions/2.0/Vendor/EXT_meshopt_compression
 */
export class GLTFMeshoptCompression {
	constructor(parser) {
		this.name = EXTENSIONS.EXT_MESHOPT_COMPRESSION;
		this.parser = parser;
	}

	loadBufferView(index) {

		const { json } = this.parser;
		const bufferView = json.bufferViews[index];

		if (bufferView.extensions && bufferView.extensions[this.name]) {

			const extensionDef = bufferView.extensions[this.name];

			const buffer = this.parser.getDependency('buffer', extensionDef.buffer);
			const decoder = this.parser.options.meshoptDecoder;

			if (!decoder || !decoder.supported) {

				if (json.extensionsRequired && json.extensionsRequired.indexOf(this.name) >= 0) {

					throw new Error('THREE.GLTFLoader: setMeshoptDecoder must be called before loading compressed files');

				} else {

					// Assumes that the extension is optional and that fallback buffer data is present
					return null;

				}

			}

			return Promise.all([buffer, decoder.ready]).then(res => {

				const byteOffset = extensionDef.byteOffset || 0;
				const byteLength = extensionDef.byteLength || 0;

				const { count } = extensionDef;
				const stride = extensionDef.byteStride;

				const result = new ArrayBuffer(count * stride);
				const source = new Uint8Array(res[0], byteOffset, byteLength);

				decoder.decodeGltfBuffer(new Uint8Array(result), count, stride, source, extensionDef.mode, extensionDef.filter);
				return result;

			});

		}
		return null;
	}
}
