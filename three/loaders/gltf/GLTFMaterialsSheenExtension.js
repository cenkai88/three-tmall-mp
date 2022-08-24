import { EXTENSIONS } from "./utils";
import { Color } from '../../math/Color';
import { MeshPhysicalMaterial } from "../../materials/MeshPhysicalMaterial";

/**
 * Sheen Materials Extension
 *
 * Specification: https://github.com/KhronosGroup/glTF/tree/main/extensions/2.0/Khronos/KHR_materials_sheen
 */
export class GLTFMaterialsSheenExtension {

	constructor(parser) {

		this.parser = parser;
		this.name = EXTENSIONS.KHR_MATERIALS_SHEEN;

	}

	getMaterialType(materialIndex) {

		const { parser } = this;
		const materialDef = parser.json.materials[materialIndex];

		if (!materialDef.extensions || !materialDef.extensions[this.name]) return null;

		return MeshPhysicalMaterial;

	}

	extendMaterialParams(materialIndex, materialParams) {

		const { parser } = this;
		const materialDef = parser.json.materials[materialIndex];

		if (!materialDef.extensions || !materialDef.extensions[this.name]) {

			return Promise.resolve();

		}

		const pending = [];

		materialParams.sheenColor = new Color(0, 0, 0);
		materialParams.sheenRoughness = 0;
		materialParams.sheen = 1;

		const extension = materialDef.extensions[this.name];

		if (extension.sheenColorFactor !== undefined) {

			materialParams.sheenColor.fromArray(extension.sheenColorFactor);

		}

		if (extension.sheenRoughnessFactor !== undefined) {

			materialParams.sheenRoughness = extension.sheenRoughnessFactor;

		}

		if (extension.sheenColorTexture !== undefined) {

			pending.push(parser.assignTexture(materialParams, 'sheenColorMap', extension.sheenColorTexture));

		}

		if (extension.sheenRoughnessTexture !== undefined) {

			pending.push(parser.assignTexture(materialParams, 'sheenRoughnessMap', extension.sheenRoughnessTexture));

		}

		return Promise.all(pending);

	}
}