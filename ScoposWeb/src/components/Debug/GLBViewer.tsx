import { Grid, OrbitControls, useGLTF } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'
import React, { Suspense, useEffect, useRef, useState } from 'react'
import { Group } from 'three'

interface GLBViewerProps {
	modelName: string
	initialCameraPosition: [number, number, number]
}

interface ModelProps {
	url: string
	onLoad?: () => void
}

// Модель с обработкой загрузки
const Model: React.FC<ModelProps> = ({ url, onLoad }) => {
	console.log(url)
	const { scene } = useGLTF(url)
	const modelRef = useRef<Group>(null)

	useEffect(() => {
		if (scene && onLoad) {
			scene.traverse(object => {
				if (object.type === 'Mesh') {
					object.castShadow = true
					object.receiveShadow = true
				}
			})
			onLoad()
		}
	}, [scene, onLoad])

	return <primitive ref={modelRef} object={scene} />
}

const GLBViewer: React.FC<GLBViewerProps> = ({
	modelName,
	initialCameraPosition,
}) => {
	const [isModelLoaded, setIsModelLoaded] = useState(false)
	const [showGrid, setShowGrid] = useState(true)
	const [showAxes, setShowAxes] = useState(true)
	const controlsRef = useRef<any>(null)

	// Формируем путь к модели (предполагаем, что модель лежит в public/models/)
	const modelPath = `/models/${modelName}`

	const resetCamera = () => {
		if (controlsRef.current) {
			controlsRef.current.reset()
		}
	}

	const handleModelLoad = () => {
		setIsModelLoaded(true)
	}

	// Если модель еще не загружена, показываем индикатор
	if (!isModelLoaded) {
		return (
			<div className='w-full h-full flex items-center justify-center bg-gray-900'>
				<div className='flex flex-col items-center justify-center space-y-6'>
					<div className='relative'>
						<div className='w-24 h-24 border-4 border-gray-700 rounded-full'>
							<div className='w-full h-full rounded-full border-4 border-transparent border-t-blue-500 animate-spin'></div>
						</div>
						<div className='absolute inset-0 flex items-center justify-center'>
							<div className='w-16 h-16 bg-blue-500/20 rounded-full animate-pulse'></div>
						</div>
					</div>
					<div className='text-center space-y-2'>
						<h3 className='text-2xl font-semibold text-gray-300'>
							Загрузка модели...
						</h3>
						<p className='text-gray-400'>Файл: {modelName}</p>
						<div className='w-64 h-2 bg-gray-700 rounded-full overflow-hidden mt-4'>
							<div className='h-full bg-gradient-to-r from-blue-500 to-blue-700 animate-pulse'></div>
						</div>
					</div>
				</div>
			</div>
		)
	}

	return (
		<div className='relative w-full h-full bg-gray-900'>
			{/* Панель управления */}
			<div className='absolute top-4 left-4 z-10'>
				<div className='bg-gray-800/80 backdrop-blur-sm rounded-xl p-4 shadow-xl'>
					<div className='space-y-4'>
						{/* Кнопка сброса камеры */}
						<button
							onClick={resetCamera}
							className='w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-medium hover:from-blue-700 hover:to-blue-800 transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg hover:shadow-blue-500/20'
						>
							<svg
								className='w-5 h-5'
								fill='none'
								stroke='currentColor'
								viewBox='0 0 24 24'
							>
								<path
									strokeLinecap='round'
									strokeLinejoin='round'
									strokeWidth={2}
									d='M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15'
								/>
							</svg>
							<span>Сброс камеры</span>
						</button>

						{/* Переключатель сетки */}
						<div className='flex items-center justify-between'>
							<span className='text-gray-300'>Сетка</span>
							<button
								onClick={() => setShowGrid(!showGrid)}
								className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${
									showGrid ? 'bg-blue-600' : 'bg-gray-700'
								}`}
							>
								<span
									className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
										showGrid ? 'translate-x-6' : 'translate-x-1'
									}`}
								/>
							</button>
						</div>

						{/* Переключатель осей */}
						<div className='flex items-center justify-between'>
							<span className='text-gray-300'>Оси координат</span>
							<button
								onClick={() => setShowAxes(!showAxes)}
								className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${
									showAxes ? 'bg-green-600' : 'bg-gray-700'
								}`}
							>
								<span
									className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
										showAxes ? 'translate-x-6' : 'translate-x-1'
									}`}
								/>
							</button>
						</div>

						{/* Информация о модели */}
						<div className='pt-4 border-t border-gray-700'>
							<p className='text-sm text-gray-400'>Модель загружена:</p>
							<p className='text-white font-medium truncate'>{modelName}</p>
						</div>
					</div>
				</div>
			</div>

			{/* Индикатор загрузки (скрывается после загрузки) */}
			<div
				className={`absolute top-4 right-4 z-10 transition-opacity duration-500 ${
					!isModelLoaded ? 'opacity-100' : 'opacity-0 pointer-events-none'
				}`}
			>
				<div className='bg-blue-500/20 backdrop-blur-sm rounded-full px-4 py-2 flex items-center space-x-2'>
					<div className='w-2 h-2 bg-blue-500 rounded-full animate-pulse'></div>
					<span className='text-blue-300 text-sm'>Загрузка...</span>
				</div>
			</div>

			{/* 3D Canvas */}
			<Canvas
				camera={{
					position: initialCameraPosition,
					fov: 45,
					near: 0.1,
					far: 1000,
				}}
				className='w-full h-full'
			>
				{/* Освещение */}
				<ambientLight intensity={0.5} />
				<directionalLight
					position={[10, 10, 5]}
					intensity={1.2}
					castShadow
					shadow-mapSize-width={2048}
					shadow-mapSize-height={2048}
				/>
				<pointLight position={[-10, 10, -5]} intensity={0.5} color='#4f46e5' />
				<pointLight position={[5, -5, 2]} intensity={0.3} color='#ec4899' />

				{/* Модель */}
				<Suspense fallback={null}>
					<Model url={modelPath} onLoad={handleModelLoad} />
				</Suspense>

				{/* Управление камерой */}
				<OrbitControls
					ref={controlsRef}
					enablePan={true}
					enableZoom={true}
					enableRotate={true}
					maxDistance={100}
					minDistance={5}
					target={[0, 0, 0]}
				/>

				{/* Визуальные помощники */}
				{showGrid && (
					<Grid args={[20, 20]} cellColor='#4b5563' sectionColor='#374151' />
				)}
				{showAxes && <axesHelper args={[5]} />}
			</Canvas>

			{/* Инструкции по управлению (только после загрузки) */}
			{isModelLoaded && (
				<div className='absolute bottom-4 left-4 z-10'>
					<div className='bg-gray-800/80 backdrop-blur-sm text-gray-300 text-sm p-4 rounded-xl shadow-xl max-w-xs'>
						<h4 className='font-medium text-white mb-2'>Управление камерой:</h4>
						<ul className='space-y-1'>
							<li className='flex items-center space-x-2'>
								<div className='w-2 h-2 bg-blue-500 rounded-full'></div>
								<span>ЛКМ + перемещение: Вращение</span>
							</li>
							<li className='flex items-center space-x-2'>
								<div className='w-2 h-2 bg-green-500 rounded-full'></div>
								<span>ПКМ + перемещение: Панорамирование</span>
							</li>
							<li className='flex items-center space-x-2'>
								<div className='w-2 h-2 bg-yellow-500 rounded-full'></div>
								<span>Колесико: Приближение/отдаление</span>
							</li>
						</ul>
					</div>
				</div>
			)}

			{/* Текущая позиция камеры (отладка) */}
			<div className='absolute bottom-4 right-4 z-10'>
				<div className='bg-gray-800/60 backdrop-blur-sm text-gray-400 text-xs p-3 rounded-lg'>
					<div>
						Камера: [{initialCameraPosition.map(n => n.toFixed(1)).join(', ')}]
					</div>
					<div className='text-green-400 mt-1'>✓ Модель загружена</div>
				</div>
			</div>
		</div>
	)
}

export default GLBViewer
