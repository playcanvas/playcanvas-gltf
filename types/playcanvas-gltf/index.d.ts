declare interface Playable {
	getAnimTargets(): AnimationTargetsMap;
}

declare interface AnimationTargetsMap {
	[name: string]: AnimationTarget;
}

declare class AnimationTarget {

}

declare class AnimationCurve extends Playable {

}

declare class AnimationClip {
	duration: number;
}

declare class AnimationSession {
	animTargets: AnimationTargetsMap;

}
