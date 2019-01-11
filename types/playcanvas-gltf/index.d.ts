declare interface AnimationKeyable {
	value: any;
	outTangent: SingleDOF;
	inTangent: SingleDOF;
	normalize(): any;
}

declare interface AnimationTarget {
	vScale?: pc.Vec3 | number[];
}

type idk = any; // not figured out yet / todo
type SingleDOF = number | pc.Vec2 | pc.Vec3 | pc.Vec4 | pc.Quat;
type BlendValue = SingleDOF | Playable;
type AnimationInput = AnimationCurve | AnimationKeyable | AnimationClip | AnimationClipSnapshot;

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
	fnCallback: any;
}

declare class AnimationClip implements Playable {
	duration: number;
	animCurves: any;
	session: AnimationSession;
	animCurvesMap: any;
	root: any;
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
	onTimer: any;
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
