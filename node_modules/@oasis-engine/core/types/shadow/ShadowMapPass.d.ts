import { Camera } from "../Camera";
import { Layer } from "../Layer";
import { Light } from "../lighting/Light";
import { Material } from "../material/Material";
import { RenderPass } from "../RenderPipeline/RenderPass";
import { RenderQueue } from "../RenderPipeline/RenderQueue";
import { RenderTarget } from "../texture/RenderTarget";
/**
 * RenderPass for rendering shadow map.
 */
export declare class ShadowMapPass extends RenderPass {
    private static _viewMatFromLightProperty;
    private static _projMatFromLightProperty;
    readonly light: Light;
    /**
     * Constructor.
     * @param light  - The light that the shadow belongs to
     */
    constructor(name: string, priority: number, renderTarget: RenderTarget, replaceMaterial: Material, mask: Layer, light: Light);
    /**
     * @override
     */
    preRender(camera: Camera, queue: RenderQueue): void;
}
