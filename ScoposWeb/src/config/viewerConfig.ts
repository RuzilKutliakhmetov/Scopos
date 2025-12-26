import * as THREE from 'three'
import type {
	AmbientLightConfig,
	CameraConfig,
	ControlsConfig,
	DirectionalLightConfig,
	LayersConfig,
	LightingConfig,
	ModelConfig,
	RenderingConfig,
	SelectionConfig,
	UIConfig,
	ViewerConfig,
	ZoomConfig,
} from '../types/three'
import { LAYERS } from './layers'

const modelConfig: ModelConfig = {
	name: 'KS-17_optimized.glb',
	path: '/models/KS-17_optimized.glb',
}

const cameraConfig: CameraConfig = {
	position: [11, 40, -33],
	target: [36, 14, 0.2],
	fov: 70,
	near: 0.01,
	far: 1000,
}

const ambientLightConfig: AmbientLightConfig = {
	color: '#ffffff',
	intensity: 0.5,
}

const directionalLightConfig: DirectionalLightConfig = {
	position: [0, 0, 1],
	target: [0, 0, -1],
	intensity: 1.4,
}

const lightingConfig: LightingConfig = {
	ambient: ambientLightConfig,
	directional: directionalLightConfig,
}

const controlsConfig: ControlsConfig = {
	enablePan: true,
	enableZoom: true,
	enableRotate: true,
	enableDamping: true,
	dampingFactor: 0.25,
	maxDistance: 200,
	minDistance: 1,
	panSpeed: 1.0, // НОВОЕ: скорость панорамирования
	rotateSpeed: 1.0, // НОВОЕ: скорость вращения
}

const zoomConfig: ZoomConfig = {
	step: 3,
	minDistance: 0.5,
	maxDistance: 500,
}

const selectionConfig: SelectionConfig = {
	hoverColor: 0xff6000,
	selectColor: 0xff0000,
	moveThreshold: 5,
	hoverDelay: 100,
}

const renderingConfig: RenderingConfig = {
	antialias: true,
	outputColorSpace: THREE.SRGBColorSpace,
	maxPixelRatio: 2,
}

const uiConfig: UIConfig = {
	toolbarHeight: 60,
	backgroundColor: '#65adf1ff',
	loadingBgColor: '#65adf1ff',
	toolbarBgColor: 'rgba(15, 23, 42, 0.9)',
	showGrid: true,
}

const layersConfig: LayersConfig = {
	pipeline: LAYERS.PIPELINE,
	background: LAYERS.BACKGROUND,
	others: LAYERS.OTHERS,
}

export const VIEWER_CONFIG: ViewerConfig = {
	model: modelConfig,
	camera: cameraConfig,
	lights: lightingConfig,
	controls: controlsConfig,
	zoom: zoomConfig,
	selection: selectionConfig,
	rendering: renderingConfig,
	ui: uiConfig,
	layers: layersConfig,
} as const
