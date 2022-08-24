import { Color } from "@oasis-engine/math";
import { Component } from "../Component";
import { Entity } from "../Entity";
/**
 * Fog.
 */
export declare class Fog extends Component {
    protected static _colorProperty: import("../shader/ShaderProperty").ShaderProperty;
    /**
     * Fog color.
     */
    get color(): Color;
    set color(value: Color);
    private _color;
    constructor(entity: Entity);
}
