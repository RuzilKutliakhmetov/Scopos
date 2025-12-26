import * as THREE from 'three'
declare global {
	interface WindowEventMap {
		'clear-selections': CustomEvent<void>
		'reset-camera': CustomEvent<void>
		'open-equipment-details': CustomEvent<{ code: string }>
		'focus-on-object': CustomEvent<{
			objectName: string
			instant?: boolean
			duration?: number
		}>
		'select-and-focus-object': CustomEvent<{
			// НОВОЕ
			objectName: string
		}>
		'select-object': CustomEvent<{ objectName: string }>
		'controls-ready': CustomEvent<{ controls: any }>
		'scene-ready': CustomEvent<{ scene: THREE.Scene }>
	}
}

export type GlobalEvent =
	| 'clear-selections'
	| 'reset-camera'
	| 'open-equipment-details'
	| 'select-object'
	| 'focus-on-object'
	| 'select-and-focus-object' // НОВОЕ
	| 'controls-ready'
	| 'scene-ready'
