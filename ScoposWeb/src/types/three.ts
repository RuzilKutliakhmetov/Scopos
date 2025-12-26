import * as THREE from 'three'

export interface CameraConfig {
	position: [number, number, number]
	fov: number
	near: number
	far: number
	target: [number, number, number]
}

export interface AmbientLightConfig {
	color: string
	intensity: number
}

export interface DirectionalLightConfig {
	position: [number, number, number]
	target: [number, number, number]
	intensity: number
}

export interface LightingConfig {
	ambient: AmbientLightConfig
	directional: DirectionalLightConfig
}

export interface SelectionConfig {
	hoverColor: number
	selectColor: number
	moveThreshold: number
	hoverDelay: number
}

export interface ZoomConfig {
	step: number
	minDistance: number
	maxDistance: number
}

export interface ModelConfig {
	name: string
	path: string
}

export interface ControlsConfig {
	enablePan: boolean
	enableZoom: boolean
	enableRotate: boolean
	enableDamping: boolean
	dampingFactor: number
	maxDistance: number
	minDistance: number
	panSpeed: number // НОВОЕ: скорость панорамирования
	rotateSpeed: number // НОВОЕ: скорость вращения
}

export interface RenderingConfig {
	antialias: boolean
	outputColorSpace: THREE.ColorSpace
	maxPixelRatio: number
}

export interface UIConfig {
	toolbarHeight: number
	backgroundColor: string
	loadingBgColor: string
	toolbarBgColor: string
	showGrid: boolean
}

export interface LayersConfig {
	pipeline: number
	background: number
	others: number
}

export interface ViewerConfig {
	model: ModelConfig
	camera: CameraConfig
	lights: LightingConfig
	controls: ControlsConfig
	zoom: ZoomConfig
	selection: SelectionConfig
	rendering: RenderingConfig
	ui: UIConfig
	layers: LayersConfig
}
