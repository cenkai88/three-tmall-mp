import { Camera } from "../Camera";
import { RenderQueue } from "../RenderPipeline/RenderQueue";
import { Scene } from "../Scene";
import { SceneFeature } from "../SceneFeature";
import { ShadowMapPass } from "./ShadowMapPass";
/**
 * Shadow plug-in.
 */
export declare class ShadowFeature extends SceneFeature {
    private _shadowPass;
    private _shadowMapMaterial;
    /**
     * @override
     */
    preRender(scene: Scene, camera: Camera): void;
    /**
     * Add RenderPass for rendering shadows.
     * @param camera - The camera for rendering
     */
    addShadowPass(camera: Camera): void;
    /**
     * Add RenderPass for rendering shadow map.
     * @param camera - The camera for rendering
     * @param light - The light that the shadow belongs to
     */
    addShadowMapPass(camera: Camera, light: any): ShadowMapPass;
    /**
     * Update the renderPassFlag state of renderers in the scene.
     * @param renderQueue - Render queue
     */
    updatePassRenderFlag(renderQueue: RenderQueue): void;
}
