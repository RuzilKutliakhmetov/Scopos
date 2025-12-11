import { Environment, Grid, OrbitControls } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'
import { Suspense } from 'react'
import { useModelStore } from '../../hooks/useModelStore'
import ModelLoader from './ModelLoader'

export default function Scene() {
	const viewMode = useModelStore(state => state.viewMode)

	return (
		<Canvas
			camera={{
				position: [10, 10, 10],
				fov: 50,
				near: 0.1,
				far: 1000,
			}}
			shadows
			style={{
				width: '100%',
				height: '100vh',
				background: 'linear-gradient(#1a1a2e, #16213e)',
			}}
		>
			{/* Фоновое освещение и окружение */}
			<ambientLight intensity={0.5} />
			<directionalLight
				position={[10, 10, 5]}
				intensity={1}
				castShadow
				shadow-mapSize={[1024, 1024]}
			/>

			{/* Среда (можно поменять на industrial) */}
			<Environment preset='city' />

			{/* Сетка для масштаба */}
			<Grid
				args={[100, 100]}
				cellSize={1}
				cellThickness={0.5}
				cellColor='#444'
				sectionSize={5}
				sectionThickness={1}
				sectionColor='#666'
				fadeDistance={80}
				fadeStrength={1}
			/>

			{/* Загрузчик модели с обработкой ошибок */}
			<Suspense fallback={null}>
				<ModelLoader />
			</Suspense>

			{/* Управление камерой */}
			<OrbitControls
				enablePan={true}
				enableZoom={true}
				enableRotate={true}
				maxDistance={100}
				minDistance={2}
				maxPolarAngle={Math.PI / 2} // Не даем зайти под землю
			/>
		</Canvas>
	)
}
