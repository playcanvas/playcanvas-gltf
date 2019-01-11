declare class AnimationKeyable {

}

declare class AnimationTarget {

}

type SingleDOF = number | pc.Vec3 | pc.Vec4;

type BlendValue = SingleDOF | Playable;

declare class AnimationCurve extends Playable {
	keyableType: any;
}

declare class AnimationClipSnapshot {
	curveKeyable: any;
}

declare class AnimationClip extends Playable {
	duration: number;
	animCurves: any;
	session: AnimationSession;
}

declare interface AnimationEvent_ {

}

declare class AnimationSession {
	animTargets: AnimationTargetsMap;
	_cacheKeyIdx: number | object;
	speed: any;
	blendables: any;
	_cacheBlendValues: any;
	blendWeights: any;
	_allocatePlayableCache(): any;
}

declare interface AnimationComponent {
	animClips: any;
	animClipsMap: any;
	animSessions: any;
}

declare interface Playable {
	getAnimTargets(): AnimationTargetsMap;
}

declare interface AnimationTargetsMap {
	[name: string]: AnimationTarget[];
}
