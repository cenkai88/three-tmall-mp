import { Component } from "./Component";
import { Entity } from "./Entity";
declare type ComponentConstructor = new (entity: Entity) => Component;
/**
 * Used for component dependency registration.
 */
export declare class ComponentsDependencies {
    private static _invDependenciesMap;
    /**
     * Register component dependencies.
     * @param currentComponent - The component you want to be register.
     * @param dependentComponent - The component's dependencies.
     */
    static register(currentComponent: ComponentConstructor, dependentComponent: ComponentConstructor): void;
    private static _addDependency;
    private constructor();
}
export declare function dependencies(...abilityClass: ComponentConstructor[]): <T extends ComponentConstructor>(target: T) => void;
export {};
