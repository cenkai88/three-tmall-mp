import { Entity } from "../Entity";
import { Fog } from "./Fog";
/**
 * Linear fog, according to the distance of the camera linear difference fog density.
 */
export declare class LinearFog extends Fog {
    private static _nearProperty;
    private static _farProperty;
    /**
     * Start of fog.
     */
    get near(): number;
    set near(value: number);
    /**
     * End of fog.
     */
    get far(): number;
    set far(value: number);
    private _near;
    private _far;
    constructor(entity: Entity);
}
