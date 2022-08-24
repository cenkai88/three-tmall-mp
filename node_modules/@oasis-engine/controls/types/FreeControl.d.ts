import { Entity, Script, Vector3 } from "oasis-engine";
/**
 * The camera's roaming controller, can move up and down, left and right, and rotate the viewing angle.
 */
export declare class FreeControl extends Script {
    _forward: Vector3;
    _right: Vector3;
    camera: Entity;
    mainElement: any;
    domElement: any;
    /**
     * Movement distance per second, the unit is the unit before MVP conversion.
     */
    movementSpeed: number;
    /**
     * Rotate speed.
     */
    rotateSpeed: number;
    /**
     * Simulate a ground.
     */
    floorMock: boolean;
    /**
     * Simulated ground height.
     */
    floorY: number;
    /**
     * Only rotate when press=true
     */
    press: boolean;
    keysForward: Array<string | number>;
    keysBackward: Array<string | number>;
    keysLeft: Array<string | number>;
    keysRight: Array<string | number>;
    /**
     * Radian of spherical.theta.
     */
    private _theta;
    /**
     * Radian of spherical.phi.
     */
    private _phi;
    private _moveForward;
    private _moveBackward;
    private _moveLeft;
    private _moveRight;
    private _v3Cache;
    private _spherical;
    private _rotateOri;
    private _events;
    constructor(entity: Entity);
    /**
     * Browser right click event.
     */
    onContextMenu(event: any): void;
    /**
     * Keyboard press event.
     */
    onKeyDown(event: any): void;
    /**
     * Keyboard up event.
     */
    onKeyUp(event: any): void;
    /**
     * Mouse press event.
     */
    onMouseDown(event: any): void;
    /**
     * Mouse up event.
     */
    onMouseUp(event: any): void;
    /**
     * Mouse movement event.
     */
    onMouseMove(event: any): void;
    /**
     * The angle of rotation around the y axis and the x axis respectively.
     * @param alpha - Radian to rotate around the y axis
     * @param beta - Radian to rotate around the x axis
     */
    rotate(alpha?: number, beta?: number): void;
    onUpdate(delta: number): void;
    /**
     * Register browser events.
     */
    initEvents(): void;
    onDestroy(): void;
    /**
     * must updateSpherical after quaternion has been changed
     * @example
     * Entity#lookAt([0,1,0],[0,1,0]);
     * AFreeControls#updateSpherical();
     */
    updateSpherical(): void;
}
