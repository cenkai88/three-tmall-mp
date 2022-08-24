import { IndexFormat, VertexElement, VertexElementFormat } from "@oasis-engine/core";
/**
 * Parse binary text for glb loader.
 * @param array
 * @returns String
 * @private
 */
export declare function decodeText(array: any): string;
/**
 * Find uniform object according to paramters[name] in glTF.
 * @param obj
 * @param key
 * @param value
 * @returns {object}
 * @private
 */
export declare function findByKeyValue(obj: any, key: any, value: any): any;
/** Get the number of bytes occupied by accessor type.
 * @return {number}
 * @param {string} accessorType
 * @private
 */
export declare function getAccessorTypeSize(accessorType: any): any;
/** Get the TypedArray corresponding to the component type.
 * @return {function}
 * @param {string} componentType
 */
export declare function getComponentType(componentType: any): any;
/**
 * Get accessor data.
 * @param gltf
 * @param accessor
 * @param buffers
 * @private
 */
export declare function getAccessorData(gltf: any, accessor: any, buffers: any): any;
/**
 * Get buffer data
 * @param bufferView
 * @param buffers
 * @returns {Blob|ArrayBuffer|Array.<T>|string}
 * @private
 */
export declare function getBufferData(bufferView: any, buffers: any): any;
export declare function getVertexStride(accessor: any): number;
export declare function createVertexElement(gltf: any, semantic: any, accessor: any, index: number): VertexElement;
export declare function getIndexFormat(type: number): IndexFormat;
export declare function getElementFormat(type: number, size: number): VertexElementFormat;
/**
 * Load image buffer
 * @param imageBuffer
 * @param type
 * @param callback
 */
export declare function loadImageBuffer(imageBuffer: ArrayBuffer, type: string): Promise<HTMLImageElement>;
export declare function parseRelativeUrl(baseUrl: string, relativeUrl: string): string;
