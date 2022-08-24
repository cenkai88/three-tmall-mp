import { Entity } from "@oasis-engine/core";
import { Oasis } from "./Oasis";
import { NodeConfig } from "./types";
export declare class NodeManager {
    private oasis;
    private nodeMap;
    private readonly root;
    constructor(oasis: Oasis);
    addRootEntity(): void;
    add(nodeConfig: NodeConfig): Entity;
    update(id: string, key: string, value: any): {
        id: string;
        key: string;
        value: any;
    };
    get(id: string): Entity;
    reset(): void;
    delete(id: string): void;
    private create;
    private append;
}
