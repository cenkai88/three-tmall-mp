import { Color } from "@oasis-engine/math";
import { Entity } from "../Entity";
import { TextureCubeMap } from "../texture";
import { Light } from "./Light";
/**
 * Environment light.
 */
export declare class EnvironmentMapLight extends Light {
    private static _diffuseMacro;
    private static _specularMacro;
    private static _diffuseTextureProperty;
    private static _specularTextureProperty;
    private static _mipLevelProperty;
    private static _diffuseColorProperty;
    private static _specularColorProperty;
    private static _diffuseIntensityProperty;
    private static _specularIntensityProperty;
    private static _transformMatrixProperty;
    /**
     * Diffuse cube texture.
     */
    get diffuseTexture(): TextureCubeMap;
    set diffuseTexture(value: TextureCubeMap);
    /**
     * Specular cube texture.
     */
    get specularTexture(): TextureCubeMap;
    set specularTexture(value: TextureCubeMap);
    /**
     * Diffuse color.
     */
    get diffuseColor(): Color;
    set diffuseColor(value: Color);
    /**
     * Specular color.
     */
    get specularColor(): Color;
    set specularColor(value: Color);
    /**
     * Diffuse intensity.
     */
    get diffuseIntensity(): number;
    set diffuseIntensity(value: number);
    /**
     * Specular intensity.
     */
    get specularIntensity(): number;
    set specularIntensity(value: number);
    private _diffuseTexture;
    private _specularTexture;
    private _diffuseColor;
    private _specularColor;
    private _diffuseIntensity;
    private _specularIntensity;
    constructor(entity: Entity);
}
