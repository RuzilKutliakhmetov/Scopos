import * as THREE from 'three'

export type GlobalEventMap = {
	'clear-selections': void
	'reset-camera': void
	'open-equipment-details': { code: string }
	'focus-on-object': {
		objectName: string
		instant?: boolean
		duration?: number
	}
	'select-and-focus-object': {
		objectName: string
	}
	'select-object': { objectName: string }
	'controls-ready': { controls: any }
	'scene-ready': { scene: THREE.Scene }
}

export type GlobalEvent = keyof GlobalEventMap

declare global {
	interface WindowEventMap {
		'clear-selections': CustomEvent<GlobalEventMap['clear-selections']>
		'reset-camera': CustomEvent<GlobalEventMap['reset-camera']>
		'open-equipment-details': CustomEvent<
			GlobalEventMap['open-equipment-details']
		>
		'focus-on-object': CustomEvent<GlobalEventMap['focus-on-object']>
		'select-and-focus-object': CustomEvent<
			GlobalEventMap['select-and-focus-object']
		>
		'select-object': CustomEvent<GlobalEventMap['select-object']>
		'controls-ready': CustomEvent<GlobalEventMap['controls-ready']>
		'scene-ready': CustomEvent<GlobalEventMap['scene-ready']>
	}
}
