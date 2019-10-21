
// extend playcanvas-typings
declare namespace pc {
    interface Vec3 {
        [prop: string]: any;
    }
    interface GraphNode {
        [prop: string]: any;
    }
}

declare interface AnimationKeyable {
    value: BlendValue;
    outTangent: SingleDOF;
    inTangent: SingleDOF;
    _cacheKeyIdx: number;
    normalize(): void;
}

declare interface AnimationEventCallback {
    (context: any, parameter: any): void
}

declare interface AnimationTarget {
    vScale?: pc.Vec3 | number[];
    targetNode: pc.GraphNode;
    targetPath: string;
    targetProp: string;
}

declare type SingleDOF = number | pc.Vec2 | pc.Vec3 | pc.Vec4 | pc.Quat;
declare type BlendValue = SingleDOF | Playable;
declare type AnimationInput = AnimationCurve | AnimationKeyable | AnimationClip | AnimationClipSnapshot;

declare type Blendable = AnimationKeyable | BlendValue;

// looks like: {
//     ...
//     curve13: 106,
//     curve14: 106,
//     curve15: 106,
//     curve16: 66,
//     curve17: 105,
//     curve18: 106,
//     ...
// }
declare type MapStringToNumber = {[curvenum: string]: number};

declare interface Playable {
    animCurvesMap: AnimationCurveMap;
    session: AnimationSession;
    bySpeed: number;
    loop: boolean;
    getAnimTargets(): AnimationTargetsMap;
    eval_cache(time: number, cacheKeyIdx: any, cacheValue: any): any;
}

declare class AnimationCurve implements Playable {
    name: string;
    type: AnimationCurveType;
    tension: number;
    duration: number;
    keyableType: AnimationKeyableType;
    animTargets: AnimationTarget[];
    animKeys: AnimationKeyable[];
    animCurvesMap: AnimationCurveMap;
    session: AnimationSession;
    getAnimTargets(): AnimationTargetsMap;
}

declare class AnimationClipSnapshot {
    curveKeyable: {[curvename: string]: AnimationKeyable};
    curveNames: string[];
    time: number;
    _cacheKeyIdx: MapStringToNumber;
}

// todo: rename AnimationEvent (name collision with CSS)
declare interface AnimationEvent {
    name: string;
    triggerTime: number;
    fnCallback: AnimationEventCallback;
}

declare class AnimationClip implements Playable {
    name: string;
    duration: number;
    animCurves: AnimationCurve[];
    session: AnimationSession;
    animCurvesMap: AnimationCurveMap;
    root: pc.GraphNode;
    getAnimTargets(): AnimationTargetsMap;
}

declare interface AnimationSession {
    animTargets: AnimationTargetsMap;
    _cacheKeyIdx: number | object;
    speed: number;
    blendables: {[curveName: string]: Blendable};
    _cacheBlendValues: {[name: string]: AnimationClipSnapshot | AnimationKeyable};
    blendWeights: {[name: string]: Playable};
    animEvents: AnimationEvent[];
    onTimer: (dt: number) => void;
    _allocatePlayableCache(): Playable;
}

declare interface AnimationComponent {
    animClips: AnimationClip[];
    animClipsMap: {[clipname: string]: AnimationClip};
    animSessions: {[sessionname: string]: AnimationSession};
}

declare interface AnimationTargetsMap {
    [name: string]: AnimationTarget[];
}

declare interface AnimationCurveMap {
    [name: string]: AnimationCurve;
}
