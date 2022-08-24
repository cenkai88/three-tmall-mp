import { Entity } from "../Entity";
import { Fog } from "./Fog";
/**
 * Exponential fog.
 */
export declare class EXP2Fog extends Fog {
    private static _densityProperty;
    /**
     * Density of fog.
     */
    get density(): number;
    set density(value: number);
    private _density;
    constructor(entity: Entity);
}
