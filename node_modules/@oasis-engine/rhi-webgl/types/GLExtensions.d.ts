import { WebGLRenderer } from "./WebGLRenderer";
import { GLCapabilityType } from "@oasis-engine/core";
/**
 * GLContext extension.
 */
export declare class GLExtensions {
    private rhi;
    private _requireResult;
    constructor(rhi: WebGLRenderer);
    /**
     * Require an extension.
     */
    requireExtension(ext: GLCapabilityType): any;
}
