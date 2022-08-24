import { SceneFeature } from "../SceneFeature";
import { Collider } from "./Collider";
export declare class ColliderFeature extends SceneFeature {
    colliders: Collider[];
    constructor();
    /**
     * Add a collider component.
     * @param collider - The collider component to add
     */
    attachCollider(collider: Collider): void;
    /**
     * Remove a collider component.
     * @param collider - The collider component to remove
     */
    detachCollider(collider: Collider): void;
}
