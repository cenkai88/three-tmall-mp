import { Component } from "@oasis-engine/core";
import { Oasis } from "./Oasis";
import { Plugin } from "./plugins/Plugin";
import { Options } from "./types";
export declare class Parser {
    private pluginManager;
    /**
     * Parse a scene config.
     * @param options - Options of scene
     */
    parse(options: Options): Promise<Oasis>;
    register(plugin: Plugin): void;
    resetPlugins(): void;
    private constructor();
    static create(): Parser;
    /** @internal */
    static _components: {
        [namespace: string]: {
            [compName: string]: Component;
        };
    };
    /**
     * Register parsing component
     * @param namespace - Namespace
     * @param components - Components
     */
    static registerComponents(namespace: string, components: {
        [key: string]: any;
    }): void;
}
export declare const parser: Parser;
