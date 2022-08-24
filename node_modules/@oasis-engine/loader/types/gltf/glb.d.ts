/**
 * Parse the glb format.
 * @param glb - Binary data
 * @returns GlTF information and bin information in Object glb.
 * @private
 */
export declare function parseGLB(glb: any): {
    gltf: any;
    buffers: any[];
};
