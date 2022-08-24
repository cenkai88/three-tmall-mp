import { EventDispatcher } from "../base/EventDispatcher";
import { Entity } from "../Entity";
import { AnimationClip } from "./AnimationClip";
import { WrapMode } from "./AnimationConst";
import { AnimationOptions, IChannelTarget } from "./types";
/**
 * AnimationClip playback.
 * @extends EventDispatcher
 * @see class AnimationClip
 * @private
 */
export declare class AnimationLayer extends EventDispatcher {
    /**
     * @return Whether the AnimationClip is playing.
     */
    get isPlaying(): boolean;
    layerWeight: number;
    mixTagetLayer: AnimationLayer;
    isFading: number;
    fadeDeltaTime: number;
    crossFadeDuration: number;
    fadeDuration: number;
    crossFadeDeltaTime: number;
    isMixLayer: boolean;
    hasMixLayer: boolean;
    mixEntity: Entity;
    private _activedEvents;
    private _animClip;
    private _isPlaying;
    private _wrapMode;
    private _channelStates;
    private _animClipLength;
    private _frameEvents;
    /**
     * @constructor
     */
    constructor();
    /**
     * @param nextAnimClip - anim clip to playback next.
     * @param rootEntity - The root entity of the skeleton animation.
     * @return Whether can mix with current AnimationClip.
     */
    canMix(nextAnimClip: AnimationClip, rootEntity: Entity): boolean;
    /**
     * Mix animClip with target animationLayer.
     * @param animClip - AnimationClip to be mixed.
     * @param targetLayer - Target animationLayer.
     * @param rootEntity - The root entity of the skeleton animation.
     * @param mixEntity - The entiity to be mixed.
     * @param options - The play options when playing AnimationClip.
     */
    mix(animClip: AnimationClip, targetLayer: AnimationLayer, rootEntity: Entity, mixEntity: Entity, options?: {
        wrapMode?: WrapMode;
    }): boolean;
    removeMixWeight(): void;
    /**
     * Play the specify AnimationClip.
     * @param animClip - The AnimationClip to be played.
     * @param rootEntity - The root entity of the skeleton animation.
     * @param options - The play options when playing AnimationClip.
     */
    play(animClip: AnimationClip, rootEntity: Entity, options?: AnimationOptions): false | IChannelTarget[];
    /**
     * Stop play AnimationClip.
     * @param rightnow - Stop it immediately, or it will stop at the end of the clip.
     */
    stop(rightnow: boolean): void;
    /**
     * Update animation states only.
     * @param deltaTime - The deltaTime when the animation update.
     */
    updateState(deltaTime: number): void;
    /**
     * Get the weight of the Animation Layer.
     * @return Channel layer weight.
     * @param channelIndex - The channel's index in AnimationClip's channels property.
     */
    getChannelLayerWeight(channelIndex: number): number;
    /**
     * @return Channel value.
     * @param channelIndexchannelIndex - The channel's index in AnimationClip's channels property.
     */
    getChannelValue(channelIndex: number): import("./types").Value;
    /**
     * Trigger the animation events.
     */
    triggerEvents(): void;
    /**
     * Jump to a frame of the AnimationClip, take effect immediately.
     * @param frameTime - The time which the animation will jump to.
     */
    jumpToFrame(frameTime: number): void;
    /**
     * Update state and value of channel.
     * @param deltaTime - The deltaTime when the animation update.
     * @param channelIndex - The channel's index in AnimationClip's channels property.
     * @private
     */
    _updateChannelState(deltaTime: any, channelIndex: any): boolean;
    /**
     * @param options - The AnimationEvent's option.
     * @private
     */
    private _addEvents;
    /**
     * Activate the AnimationEvent.
     * @param deltaTime - The deltaTime when the animation update.
     * @private
     */
    private _activeEvents;
    /**
     * Find the target the channel belongs to.
     * @param rootNode - The root entity of the skeleton animation.
     * @param target - The target to be finded.
     * @private
     */
    private _findChannelTarget;
    /**
     * @return Current and next key id, current alpha.
     * @param channel - The channle which the key and alpha in.
     * @param time - The frame time.
     * @private
     */
    private _getKeyAndAlpha;
}
