import { Camera } from "../Camera";
import { RenderPass } from "../RenderPipeline/RenderPass";
import { RenderQueue } from "../RenderPipeline/RenderQueue";
/**
 * RenderPass for rendering shadow.
 */
export declare class ShadowPass extends RenderPass {
    constructor(...args: any[]);
    /**
     * @override
     */
    preRender(camera: Camera, queue: RenderQueue): void;
}
