
// extend playcanvas-typings
declare namespace pc {
	interface Vec3 {
		[prop: string]: any;
	}
	interface GraphNode {
        name: string;
		[prop: string]: any;
	}
}

declare interface AnimationKeyable {
	value: any;
	outTangent: SingleDOF;
	inTangent: SingleDOF;
	normalize(): any;
}

interface AnimationEventCallback {
	(context: any, parameter: any): void
}

declare interface AnimationTarget {
	vScale?: pc.Vec3 | number[];
	targetNode: pc.GraphNode;
	targetPath: string;
	targetProp: string;
	
}

type SingleDOF = number | pc.Vec2 | pc.Vec3 | pc.Vec4 | pc.Quat;
type BlendValue = SingleDOF | Playable;
type AnimationInput = AnimationCurve | AnimationKeyable | AnimationClip | AnimationClipSnapshot;

/*

the object subtype looks like:

{	
	...
	curve13: 106,
	curve14: 106,
	curve15: 106,
	curve16: 66,
	curve17: 105,
	curve18: 106,
	...
}

*/

type AnimationCacheKey = /*number |*/ {[curvenum: string]: number};

declare interface Playable {
	animCurvesMap: any;
	session: AnimationSession;
	bySpeed: any;
	loop: any;
	getAnimTargets(): AnimationTargetsMap;
	eval_cache(time: number, cacheKeyIdx: any, cacheValue: any): any;
}

declare class AnimationCurve implements Playable {
	name: string;
	type: AnimationCurveType;
	tension: number;
	duration: number;
	keyableType: any;
	animTargets: AnimationTarget[];
	animKeys: AnimationKeyable[];
	animCurvesMap: any;
	session: AnimationSession;
	getAnimTargets(): AnimationTargetsMap;
}

declare class AnimationClipSnapshot {
	curveKeyable: any;
	value: any;
	curveNames: string[];
	time: number;
}

// AnimationEvent is a CSS class, so I added an underscore
declare interface AnimationEvent_ {
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
	speed: any;
	blendables: any;
	_cacheBlendValues: any;
	blendWeights: any;
	animEvents: AnimationEvent_[];
	onTimer: (dt: number) => void;
	_allocatePlayableCache(): any;
}

declare interface AnimationComponent {
	animClips: any;
	animClipsMap: any;
	animSessions: any;
}

declare interface AnimationTargetsMap {
	[name: string]: AnimationTarget[];
}

declare interface AnimationCurveMap {
	[name: string]: AnimationCurve;
}
