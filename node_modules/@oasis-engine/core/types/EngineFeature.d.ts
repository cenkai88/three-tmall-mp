import { Engine } from "./Engine";
import { Scene } from "./Scene";
/**
 * Engine feature plug-in.
 * @deprecated
 */
export declare class EngineFeature {
    /**
     * Callback before the engine main loop runs,used to load resource.
     * @param engine - Engine
     */
    preLoad(engine: Engine): void;
    /**
     * Callback before every engine tick.
     * @param engine - Engine
     * @param currentScene - Scene
     */
    preTick(engine: Engine, currentScene: Scene): void;
    /**
     * Callback after every engine tick.
     * @param  engine - Engine
     */
    postTick(engine: Engine, currentScene: Scene): void;
    /**
     * Callback after the engine is destroyed.
     * @param engine - Engine
     */
    shutdown(engine: Engine): void;
}
