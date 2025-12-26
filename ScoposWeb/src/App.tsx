import { Canvas } from '@react-three/fiber'
import { MeshoptDecoder } from 'meshoptimizer'
import {
	lazy,
	memo,
	Suspense,
	useCallback,
	useEffect,
	useMemo,
	useState,
} from 'react'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

import LoadingSpinner from './components/LoadingSpinner'
import {
	assignLayers,
	CustomOrbitControls,
	exportPipelineObjects,
	FocusController,
	LayerManager,
	Lighting,
	RenderOptimization,
	SelectionManager,
} from './components/Three'

import { DataTableProvider } from './context/DataTableContext'
import { SelectionProvider } from './context/SelectionContext'
import { emitCustomEvent, useCustomEvent } from './hooks/useCustomEvent'
import { useViewerConfig } from './hooks/useViewerConfig'
import { ErrorBoundary } from './utils/error-boundary'

// Ленивая загрузка тяжелых компонентов
const Toolbar = lazy(() => import('./components/Toolbar'))
const DataTable = lazy(() => import('./components/DataTable/DataTable'))

// Мемоизированные компоненты
const ToolbarMemo = memo(Toolbar)
const DataTableMemo = memo(DataTable)

function App() {
	const [model, setModel] = useState<THREE.Group | null>(null)
	const [loading, setLoading] = useState(true)
	const [loadProgress, setLoadProgress] = useState(0)
	const [error, setError] = useState<string | null>(null)

	const [showTable, setShowTable] = useState(false)
	const [isPipelineMode, setIsPipelineMode] = useState(false)
	const [showBackground, setShowBackground] = useState(true)
	const [selectedEquipmentCode, setSelectedEquipmentCode] = useState<string>()

	const config = useViewerConfig()

	// Мемоизированные обработчики
	const handlePipelineToggle = useCallback(() => {
		const newMode = !isPipelineMode
		setIsPipelineMode(newMode)
		if (newMode) {
			window.dispatchEvent(new Event('clear-selections'))
		}
	}, [isPipelineMode])

	const handleBackgroundToggle = useCallback(() => {
		if (isPipelineMode) return
		setShowBackground(!showBackground)
	}, [isPipelineMode, showBackground])

	const handleResetCamera = useCallback(() => {
		window.dispatchEvent(new CustomEvent('reset-camera'))
	}, [])

	const handleOpenTable = useCallback(() => {
		setSelectedEquipmentCode(undefined)
		setShowTable(true)
	}, [])

	const handleCloseTable = useCallback(() => {
		setShowTable(false)
		setSelectedEquipmentCode(undefined)
	}, [])

	// Слушаем события кликов на объекты
	useCustomEvent<{ code: string }>(
		'open-equipment-details',
		useCallback(detail => {
			setSelectedEquipmentCode(detail.code)
			setShowTable(true)
		}, [])
	)

	// Оптимизированная загрузка модели
	useEffect(() => {
		let mounted = true
		let loader: GLTFLoader | null = null

		const loadModel = async () => {
			try {
				if (!mounted) return
				console.log('🚀 Загрузка 3D модели')

				loader = new GLTFLoader()
				if (MeshoptDecoder) {
					loader.setMeshoptDecoder(MeshoptDecoder)
				}

				const gltf = await new Promise<THREE.Group>((resolve, reject) => {
					if (!loader) return reject(new Error('Loader not initialized'))

					loader.load(
						config.model.path,
						gltf => {
							if (mounted) resolve(gltf.scene)
						},
						xhr => {
							if (mounted) {
								const progress = xhr.total ? (xhr.loaded / xhr.total) * 100 : 0
								setLoadProgress(progress)
							}
						},
						reject
					)
				})

				if (!mounted) return

				assignLayers(gltf)
				setModel(gltf)

				// Экспорт для отладки
				if (import.meta.env.DEV) {
					exportPipelineObjects(gltf)
				}
			} catch (error) {
				if (mounted) {
					console.error('❌ Ошибка загрузки:', error)
					setError(
						'Не удалось загрузить модель. Пожалуйста, обновите страницу.'
					)
				}
			} finally {
				if (mounted) {
					setLoading(false)
				}
			}
		}

		loadModel()

		return () => {
			mounted = false
			// Очистка ресурсов
			if (loader) {
				// @ts-ignore - очистка внутренних кэшей
				loader.manager.itemStart = () => {}
				loader.manager.itemEnd = () => {}
				loader.manager.itemError = () => {}
			}
		}
	}, [config.model.path])

	// Настройки камеры для Canvas
	const cameraConfig = useMemo(
		() => ({
			position: config.camera.position as [number, number, number],
			fov: config.camera.fov,
			near: config.camera.near,
			far: config.camera.far,
		}),
		[config.camera]
	)

	// Мемоизированный fallback для Suspense
	// const toolbarFallback = useMemo(
	// 	() => <div className='fixed top-6 left-6 z-50'>Загрузка...</div>,
	// 	[]
	// )

	// const tableFallback = useMemo(
	// 	() => <LoadingSpinner progress={0} message='Загрузка таблицы...' />,
	// 	[]
	// )

	if (loading) {
		return <LoadingSpinner progress={loadProgress} />
	}

	if (error) {
		return (
			<div className='w-screen h-screen bg-gray-900 flex items-center justify-center'>
				<div className='text-center'>
					<div className='text-red-500 text-4xl mb-4 cursor-default'>⚠️</div>
					<h2 className='text-white text-xl mb-2 cursor-default'>{error}</h2>
					<button
						onClick={() => window.location.reload()}
						className='mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer'
					>
						Обновить страницу
					</button>
				</div>
			</div>
		)
	}

	return (
		<SelectionProvider>
			<DataTableProvider>
				<div
					className='w-screen h-screen overflow-hidden relative'
					style={{ backgroundColor: config.ui.backgroundColor }}
				>
					<Suspense
						fallback={
							<LoadingSpinner progress={0} message='Загрузка интерфейса...' />
						}
					>
						<ToolbarMemo
							onResetCamera={handleResetCamera}
							onPipelineToggle={handlePipelineToggle}
							onBackgroundToggle={handleBackgroundToggle}
							onOpenTable={handleOpenTable}
							isPipelineMode={isPipelineMode}
							showBackground={showBackground}
						/>

						<Suspense
							fallback={
								<LoadingSpinner progress={0} message='Загрузка таблицы...' />
							}
						>
							<DataTableMemo
								isOpen={showTable}
								onClose={handleCloseTable}
								selectedObjectCode={selectedEquipmentCode}
							/>
						</Suspense>
					</Suspense>

					<ErrorBoundary>
						<Canvas
							camera={cameraConfig}
							onCreated={({ camera, scene }) => {
								Object.values(config.layers).forEach(layer => {
									camera.layers.enable(layer)
								})

								camera.lookAt(...config.camera.target)
								scene.add(camera)

								console.log('🎥 Камера инициализирована')
								emitCustomEvent('scene-ready', { scene })
							}}
							gl={{
								antialias: config.rendering.antialias,
								outputColorSpace: config.rendering.outputColorSpace,
							}}
						>
							<Lighting />
							<RenderOptimization />
							<LayerManager
								isPipelineMode={isPipelineMode}
								showBackground={showBackground}
							/>
							{model && <primitive object={model} />}
							<SelectionManager />
							<CustomOrbitControls />
							<FocusController />
						</Canvas>
					</ErrorBoundary>
				</div>
			</DataTableProvider>
		</SelectionProvider>
	)
}

export default memo(App)
