declare class AnimationKeyable {
	value: any;
	normalize(): any;
}

declare class AnimationTarget {

}

type idk = any; // not figured out yet / todo
type SingleDOF = number | pc.Vec2 | pc.Vec3 | pc.Vec4 | pc.Quat;
type BlendValue = SingleDOF | Playable;
type AnimationInput = AnimationCurve | AnimationKeyable | AnimationClip | AnimationClipSnapshot;

declare class AnimationCurve extends Playable {
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

declare class AnimationClip extends Playable {
	duration: number;
	animCurves: any;
	session: AnimationSession;
	animCurvesMap: any;
}

// AnimationEvent is a CSS class, so I added an underscore
declare interface AnimationEvent_ {

}

declare class AnimationSession {
	animTargets: AnimationTargetsMap;
	_cacheKeyIdx: number | object;
	speed: any;
	blendables: any;
	_cacheBlendValues: any;
	blendWeights: any;
	animEvents: AnimationEvent_[];
	_allocatePlayableCache(): any;
}

declare interface AnimationComponent {
	animClips: any;
	animClipsMap: any;
	animSessions: any;
}

declare interface Playable {
	animCurvesMap: any;
	session: AnimationSession;
	bySpeed: any;
	loop: any;
	getAnimTargets(): AnimationTargetsMap;
	eval_cache(time: number, cacheKeyIdx: any, cacheValue: any): any;
}

declare interface AnimationTargetsMap {
	[name: string]: AnimationTarget[];
}
