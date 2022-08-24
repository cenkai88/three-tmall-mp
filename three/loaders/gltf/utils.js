import {
	ClampToEdgeWrapping,
	FrontSide,
	InterpolateDiscrete,
	InterpolateLinear,
	LinearFilter,
	LinearMipmapLinearFilter,
	LinearMipmapNearestFilter,
	MirroredRepeatWrapping,
	NearestFilter,
	NearestMipmapLinearFilter,
	NearestMipmapNearestFilter,
	RepeatWrapping,
	TriangleFanDrawMode
} from '../../constants';
import { Box3 } from '../../math/Box3';
import { Matrix4 } from '../../math/Matrix4';
import { Skeleton } from '../../objects/Skeleton';
import { Sphere } from '../../math/Sphere';
import { Vector3 } from '../../math/Vector3';
import { MeshStandardMaterial } from '../../materials/MeshStandardMaterial';

export const BINARY_EXTENSION_HEADER_MAGIC = 'glTF';
export const BINARY_EXTENSION_HEADER_LENGTH = 12;
export const BINARY_EXTENSION_CHUNK_TYPES = { JSON: 0x4E4F534A, BIN: 0x004E4942 };

export const EXTENSIONS = {
	KHR_BINARY_GLTF: 'KHR_binary_glTF',
	KHR_DRACO_MESH_COMPRESSION: 'KHR_draco_mesh_compression',
	KHR_LIGHTS_PUNCTUAL: 'KHR_lights_punctual',
	KHR_MATERIALS_CLEARCOAT: 'KHR_materials_clearcoat',
	KHR_MATERIALS_IOR: 'KHR_materials_ior',
	KHR_MATERIALS_PBR_SPECULAR_GLOSSINESS: 'KHR_materials_pbrSpecularGlossiness',
	KHR_MATERIALS_SHEEN: 'KHR_materials_sheen',
	KHR_MATERIALS_SPECULAR: 'KHR_materials_specular',
	KHR_MATERIALS_TRANSMISSION: 'KHR_materials_transmission',
	KHR_MATERIALS_UNLIT: 'KHR_materials_unlit',
	KHR_MATERIALS_VOLUME: 'KHR_materials_volume',
	KHR_TEXTURE_BASISU: 'KHR_texture_basisu',
	KHR_TEXTURE_TRANSFORM: 'KHR_texture_transform',
	KHR_MESH_QUANTIZATION: 'KHR_mesh_quantization',
	EXT_TEXTURE_WEBP: 'EXT_texture_webp',
	EXT_MESHOPT_COMPRESSION: 'EXT_meshopt_compression'
};


/* GLTFREGISTRY */

export function GLTFRegistry() {
	let objects = {};

	return {
		get: key => objects[key],
		add: (key, object) => {
			objects[key] = object
		},
		remove: (key) => delete objects[key],
		removeAll: () => {
			objects = {};
		}
	};
}


export function addUnknownExtensionsToUserData(knownExtensions, object, objectDef) {

	// Add unknown glTF extensions to an object's userData.
	for (const name in objectDef.extensions) {
		if (knownExtensions[name] === undefined) {
			object.userData.gltfExtensions = object.userData.gltfExtensions || {};
			object.userData.gltfExtensions[name] = objectDef.extensions[name];
		}

	}

}


/**
 * @param {Object3D|Material|BufferGeometry} object
 * @param {GLTF.definition} gltfDef
 */
export function assignExtrasToUserData(object, gltfDef) {

	if (gltfDef.extras !== undefined) {

		if (typeof gltfDef.extras === 'object') {

			Object.assign(object.userData, gltfDef.extras);

		} else {

			console.warn(`THREE.GLTFLoader: Ignoring primitive type .extras, ${gltfDef.extras}`);

		}

	}

}

export const WEBGL_CONSTANTS = {
	FLOAT: 5126,
	// FLOAT_MAT2: 35674,
	FLOAT_MAT3: 35675,
	FLOAT_MAT4: 35676,
	FLOAT_VEC2: 35664,
	FLOAT_VEC3: 35665,
	FLOAT_VEC4: 35666,
	LINEAR: 9729,
	REPEAT: 10497,
	SAMPLER_2D: 35678,
	POINTS: 0,
	LINES: 1,
	LINE_LOOP: 2,
	LINE_STRIP: 3,
	TRIANGLES: 4,
	TRIANGLE_STRIP: 5,
	TRIANGLE_FAN: 6,
	UNSIGNED_BYTE: 5121,
	UNSIGNED_SHORT: 5123
};

export const WEBGL_COMPONENT_TYPES = {
	5120: Int8Array,
	5121: Uint8Array,
	5122: Int16Array,
	5123: Uint16Array,
	5125: Uint32Array,
	5126: Float32Array
};

export const WEBGL_FILTERS = {
	9728: NearestFilter,
	9729: LinearFilter,
	9984: NearestMipmapNearestFilter,
	9985: LinearMipmapNearestFilter,
	9986: NearestMipmapLinearFilter,
	9987: LinearMipmapLinearFilter
};

export const WEBGL_WRAPPINGS = {
	33071: ClampToEdgeWrapping,
	33648: MirroredRepeatWrapping,
	10497: RepeatWrapping
};

export const WEBGL_TYPE_SIZES = {
	'SCALAR': 1,
	'VEC2': 2,
	'VEC3': 3,
	'VEC4': 4,
	'MAT2': 4,
	'MAT3': 9,
	'MAT4': 16
};

export const ATTRIBUTES = {
	POSITION: 'position',
	NORMAL: 'normal',
	TANGENT: 'tangent',
	TEXCOORD_0: 'uv',
	TEXCOORD_1: 'uv2',
	COLOR_0: 'color',
	WEIGHTS_0: 'skinWeight',
	JOINTS_0: 'skinIndex'
};

export const PATH_PROPERTIES = {
	scale: 'scale',
	translation: 'position',
	rotation: 'quaternion',
	weights: 'morphTargetInfluences'
};

export const INTERPOLATION = {
	CUBICSPLINE: undefined, // We use a custom interpolant (GLTFCubicSplineInterpolation) for CUBICSPLINE tracks. Each
	// keyframe track will be initialized with a default interpolation type, then modified.
	LINEAR: InterpolateLinear,
	STEP: InterpolateDiscrete
};

export const ALPHA_MODES = {
	OPAQUE: 'OPAQUE',
	MASK: 'MASK',
	BLEND: 'BLEND'
};

/**
 * Specification: https://github.com/KhronosGroup/glTF/blob/master/specification/2.0/README.md#default-material
 */
export function createDefaultMaterial(cache) {

	if (cache.DefaultMaterial === undefined) {

		cache.DefaultMaterial = new MeshStandardMaterial({
			color: 0xFFFFFF,
			emissive: 0x000000,
			metalness: 1,
			roughness: 1,
			transparent: false,
			depthTest: true,
			side: FrontSide
		});

	}

	return cache.DefaultMaterial;

}



/**
 * Specification: https://github.com/KhronosGroup/glTF/blob/master/specification/2.0/README.md#morph-targets
 *
 * @param {BufferGeometry} geometry
 * @param {Array<GLTF.Target>} targets
 * @param {GLTFParser} parser
 * @return {Promise<BufferGeometry>}
 */
export function addMorphTargets(geometry, targets, parser) {

	let hasMorphPosition = false;
	let hasMorphNormal = false;

	for (let i = 0, il = targets.length; i < il; i++) {

		const target = targets[i];

		if (target.POSITION !== undefined) hasMorphPosition = true;
		if (target.NORMAL !== undefined) hasMorphNormal = true;

		if (hasMorphPosition && hasMorphNormal) break;

	}

	if (!hasMorphPosition && !hasMorphNormal) return Promise.resolve(geometry);

	const pendingPositionAccessors = [];
	const pendingNormalAccessors = [];

	for (let i = 0, il = targets.length; i < il; i++) {

		const target = targets[i];

		if (hasMorphPosition) {

			const pendingAccessor = target.POSITION !== undefined
				? parser.getDependency('accessor', target.POSITION)
				: geometry.attributes.position;

			pendingPositionAccessors.push(pendingAccessor);

		}

		if (hasMorphNormal) {

			const pendingAccessor = target.NORMAL !== undefined
				? parser.getDependency('accessor', target.NORMAL)
				: geometry.attributes.normal;

			pendingNormalAccessors.push(pendingAccessor);

		}

	}

	return Promise.all([
		Promise.all(pendingPositionAccessors),
		Promise.all(pendingNormalAccessors)
	]).then(accessors => {

		const morphPositions = accessors[0];
		const morphNormals = accessors[1];

		if (hasMorphPosition) geometry.morphAttributes.position = morphPositions;
		if (hasMorphNormal) geometry.morphAttributes.normal = morphNormals;
		geometry.morphTargetsRelative = true;

		return geometry;

	});

}

/**
 * @param {Mesh} mesh
 * @param {GLTF.Mesh} meshDef
 */
export function updateMorphTargets(mesh, meshDef) {

	mesh.updateMorphTargets();

	if (meshDef.weights !== undefined) {

		for (let i = 0, il = meshDef.weights.length; i < il; i++) {
			mesh.morphTargetInfluences[i] = meshDef.weights[i];
		}

	}

	// .extras has user-defined data, so check that .extras.targetNames is an array.
	if (meshDef.extras && Array.isArray(meshDef.extras.targetNames)) {

		const { targetNames } = meshDef.extras;

		if (mesh.morphTargetInfluences.length === targetNames.length) {

			mesh.morphTargetDictionary = {};

			for (let i = 0, il = targetNames.length; i < il; i++) {
				mesh.morphTargetDictionary[targetNames[i]] = i;
			}

		} else {

			console.warn('THREE.GLTFLoader: Invalid extras.targetNames length. Ignoring names.');

		}
	}
}

export function createAttributesKey(attributes) {
	let attributesKey = '';

	const keys = Object.keys(attributes).sort();

	for (let i = 0, il = keys.length; i < il; i++) {
		attributesKey += `${keys[i]}:${attributes[keys[i]]};`;
	}

	return attributesKey;
}

export function createPrimitiveKey(primitiveDef) {
	const dracoExtension = primitiveDef.extensions && primitiveDef.extensions[EXTENSIONS.KHR_DRACO_MESH_COMPRESSION];
	let geometryKey;

	if (dracoExtension) {
		geometryKey = `draco:${dracoExtension.bufferView}:${dracoExtension.indices}:${createAttributesKey(dracoExtension.attributes)}`;
	} else {
		geometryKey = `${primitiveDef.indices}:${createAttributesKey(primitiveDef.attributes)}:${primitiveDef.mode}`;
	}

	return geometryKey;
}


export function getNormalizedComponentScale(constructor) {

	// Reference:
	// https://github.com/KhronosGroup/glTF/tree/master/extensions/2.0/Khronos/KHR_mesh_quantization#encoding-quantized-data

	switch (constructor) {

		case Int8Array:
			return 1 / 127;

		case Uint8Array:
			return 1 / 255;

		case Int16Array:
			return 1 / 32767;

		case Uint16Array:
			return 1 / 65535;

		default:
			throw new Error('THREE.GLTFLoader: Unsupported normalized accessor component type.');

	}

}


export function buildNodeHierarchy(nodeId, parentObject, json, parser) {

	const nodeDef = json.nodes[nodeId];

	return parser.getDependency('node', nodeId).then(node => {

		if (nodeDef.skin === undefined) return node;

		// build skeleton here as well

		let skinEntry;

		return parser.getDependency('skin', nodeDef.skin).then(skin => {
			skinEntry = skin;
			const pendingJoints = [];

			for (let i = 0, il = skinEntry.joints.length; i < il; i++) {
				pendingJoints.push(parser.getDependency('node', skinEntry.joints[i]));
			}
			return Promise.all(pendingJoints);

		}).then(jointNodes => {

			node.traverse(mesh => {
				if (!mesh.isMesh) return;

				const bones = [];
				const boneInverses = [];

				for (let j = 0, jl = jointNodes.length; j < jl; j++) {
					const jointNode = jointNodes[j];
					if (jointNode) {
						bones.push(jointNode);
						const mat = new Matrix4();
						if (skinEntry.inverseBindMatrices !== undefined) {
							mat.fromArray(skinEntry.inverseBindMatrices.array, j * 16);
						}

						boneInverses.push(mat);
					} else {
						console.warn('THREE.GLTFLoader: Joint "%s" could not be found.', skinEntry.joints[j]);
					}

				}

				mesh.bind(new Skeleton(bones, boneInverses), mesh.matrixWorld);
			});

			return node;
		});

	}).then(node => {

		// build node hierachy

		parentObject.add(node);
		const pending = [];

		if (nodeDef.children) {
			const { children } = nodeDef;

			for (let i = 0, il = children.length; i < il; i++) {
				const child = children[i];
				pending.push(buildNodeHierarchy(child, node, json, parser));
			}

		}
		return Promise.all(pending);
	});

}

/**
 * @param {BufferGeometry} geometry
 * @param {GLTF.Primitive} primitiveDef
 * @param {GLTFParser} parser
 */
export function computeBounds(geometry, primitiveDef, parser) {

	const { attributes } = primitiveDef;

	const box = new Box3();

	if (attributes.POSITION !== undefined) {
		const accessor = parser.json.accessors[attributes.POSITION];
		const { min, max } = accessor;

		// glTF requires 'min' and 'max', but VRM (which extends glTF) currently ignores that requirement.

		if (min !== undefined && max !== undefined) {
			box.set(
				new Vector3(min[0], min[1], min[2]),
				new Vector3(max[0], max[1], max[2])
			);
			if (accessor.normalized) {
				const boxScale = getNormalizedComponentScale(WEBGL_COMPONENT_TYPES[accessor.componentType]);
				box.min.multiplyScalar(boxScale);
				box.max.multiplyScalar(boxScale);
			}

		} else {
			console.warn('THREE.GLTFLoader: Missing min/max properties for accessor POSITION.');
			return;
		}

	} else {
		return;
	}

	const { targets } = primitiveDef;

	if (targets !== undefined) {

		const maxDisplacement = new Vector3();
		const vector = new Vector3();

		for (let i = 0, il = targets.length; i < il; i++) {

			const target = targets[i];

			if (target.POSITION !== undefined) {
				const accessor = parser.json.accessors[target.POSITION];
				const { min, max } = accessor;
				// glTF requires 'min' and 'max', but VRM (which extends glTF) currently ignores that requirement.

				if (min !== undefined && max !== undefined) {
					// we need to get max of absolute components because target weight is [-1,1]
					vector.setX(Math.max(Math.abs(min[0]), Math.abs(max[0])));
					vector.setY(Math.max(Math.abs(min[1]), Math.abs(max[1])));
					vector.setZ(Math.max(Math.abs(min[2]), Math.abs(max[2])));

					if (accessor.normalized) {
						const boxScale = getNormalizedComponentScale(WEBGL_COMPONENT_TYPES[accessor.componentType]);
						vector.multiplyScalar(boxScale);
					}

					// Note: this assumes that the sum of all weights is at most 1. This isn't quite correct - it's more conservative
					// to assume that each target can have a max weight of 1. However, for some use cases - notably, when morph targets
					// are used to implement key-frame animations and as such only two are active at a time - this results in very large
					// boxes. So for now we make a box that's sometimes a touch too small but is hopefully mostly of reasonable size.
					maxDisplacement.max(vector);

				} else {
					console.warn('THREE.GLTFLoader: Missing min/max properties for accessor POSITION.');
				}

			}

		}

		// As per comment above this box isn't conservative, but has a reasonable size for a very large number of morph targets.
		box.expandByVector(maxDisplacement);
	}

	geometry.boundingBox = box;

	const sphere = new Sphere();

	box.getCenter(sphere.center);
	sphere.radius = box.min.distanceTo(box.max) / 2;

	geometry.boundingSphere = sphere;
}

/**
 * @param {BufferGeometry} geometry
 * @param {GLTF.Primitive} primitiveDef
 * @param {GLTFParser} parser
 * @return {Promise<BufferGeometry>}
 */
export function addPrimitiveAttributes(geometry, primitiveDef, parser) {

	const { attributes } = primitiveDef;

	const pending = [];
	function assignAttributeAccessor(accessorIndex, attributeName) {

		return parser.getDependency('accessor', accessorIndex)
			.then(accessor => {
				geometry.setAttribute(attributeName, accessor);
			});
	}

	for (const gltfAttributeName in attributes) {
		const threeAttributeName = ATTRIBUTES[gltfAttributeName] || gltfAttributeName.toLowerCase();
		// Skip attributes already provided by e.g. Draco extension.
		if (threeAttributeName in geometry.attributes) continue;
		pending.push(assignAttributeAccessor(attributes[gltfAttributeName], threeAttributeName));
	}

	if (primitiveDef.indices !== undefined && !geometry.index) {
		const accessor = parser.getDependency('accessor', primitiveDef.indices).then(accessor => {
			geometry.setIndex(accessor);
		});

		pending.push(accessor);
	}

	assignExtrasToUserData(geometry, primitiveDef);

	computeBounds(geometry, primitiveDef, parser);

	return Promise.all(pending).then(() =>
		primitiveDef.targets !== undefined
			? addMorphTargets(geometry, primitiveDef.targets, parser)
			: geometry
	);
}

/**
 * @param {BufferGeometry} geometry
 * @param {Number} drawMode
 * @return {BufferGeometry}
 */
export function toTrianglesDrawMode(geometry, drawMode) {
	let index = geometry.getIndex();

	// generate index if not present
	if (index === null) {
		const indices = [];
		const position = geometry.getAttribute('position');
		if (position !== undefined) {
			for (let i = 0; i < position.count; i++) {
				indices.push(i);
			}
			geometry.setIndex(indices);
			index = geometry.getIndex();
		} else {
			console.error('THREE.GLTFLoader.toTrianglesDrawMode(): Undefined position attribute. Processing not possible.');
			return geometry;
		}
	}

	//

	const numberOfTriangles = index.count - 2;
	const newIndices = [];

	if (drawMode === TriangleFanDrawMode) {
		// gl.TRIANGLE_FAN
		for (let i = 1; i <= numberOfTriangles; i++) {
			newIndices.push(index.getX(0));
			newIndices.push(index.getX(i));
			newIndices.push(index.getX(i + 1));
		}
	} else {
		// gl.TRIANGLE_STRIP
		for (let i = 0; i < numberOfTriangles; i++) {
			if (i % 2 === 0) {
				newIndices.push(index.getX(i));
				newIndices.push(index.getX(i + 1));
				newIndices.push(index.getX(i + 2));
			} else {
				newIndices.push(index.getX(i + 2));
				newIndices.push(index.getX(i + 1));
				newIndices.push(index.getX(i));
			}
		}
	}

	if ((newIndices.length / 3) !== numberOfTriangles) {
		console.error('THREE.GLTFLoader.toTrianglesDrawMode(): Unable to generate correct amount of triangles.');
	}

	// build final geometry

	const newGeometry = geometry.clone();
	newGeometry.setIndex(newIndices);

	return newGeometry;
}