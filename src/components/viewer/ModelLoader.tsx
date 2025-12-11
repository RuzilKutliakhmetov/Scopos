import { MeshReflectorMaterial, useGLTF } from '@react-three/drei'
import { useEffect } from 'react'
import * as THREE from 'three'
import modelUrl from '../../assets/model/KS17.glb?url'
import { useModelStore } from '../../hooks/useModelStore'
// import modelUrl from ' ./assets/models/KS17.glb?url'
export default function ModelLoader() {
	const { currentModel, selectComponent, viewMode } = useModelStore()

	// Загрузка модели (путь указывайте относительно public/ или импортируйте)
	const { scene, nodes, materials } = useGLTF(modelUrl)

	// Функция для обработки клика по объекту
	const handleClick = (event: any) => {
		event.stopPropagation()

		// Получаем имя объекта
		const objectName = event.object.name

		// Ищем компонент в данных (мок или из SAP)
		const mockComponents = [
			{
				id: 'pipe_1',
				name: 'Труба DN300',
				type: 'pipe' as const,
				diameter: 300,
				pressure: 40,
				material: 'Сталь',
			},
			{
				id: 'valve_1',
				name: 'Задвижка 300мм',
				type: 'valve' as const,
				diameter: 300,
				pressure: 40,
				material: 'Чугун',
			},
		]

		const component = mockComponents.find(comp => comp.id === objectName)
		if (component) {
			selectComponent(component)
		}
	}

	// Применяем режим отображения
	useEffect(() => {
		const applyViewMode = () => {
			scene.traverse(child => {
				if (child instanceof THREE.Mesh) {
					switch (viewMode) {
						case 'wireframe':
							child.material.wireframe = true
							child.material.opacity = 1
							child.material.transparent = false
							break
						case 'xray':
							child.material.wireframe = false
							child.material.opacity = 0.3
							child.material.transparent = true
							break
						default: // solid
							child.material.wireframe = false
							child.material.opacity = 1
							child.material.transparent = false
					}
				}
			})
		}

		applyViewMode()
	}, [viewMode, scene])

	// Оптимизация: предварительная обработка модели
	useEffect(() => {
		scene.traverse(child => {
			if (child instanceof THREE.Mesh) {
				// Включаем тени
				child.castShadow = true
				child.receiveShadow = true

				// Добавляем имя если его нет
				if (!child.name) {
					child.name = `mesh_${child.uuid.slice(0, 8)}`
				}
			}
		})
	}, [scene])

	return (
		<group onClick={handleClick}>
			<primitive
				object={scene}
				scale={1}
				position={[0, 0, 0]}
				rotation={[0, 0, 0]}
			/>

			{/* Отражающая поверхность (пол) */}
			<mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1, 0]} receiveShadow>
				<planeGeometry args={[100, 100]} />
				<MeshReflectorMaterial
					blur={[300, 100]}
					resolution={1024}
					mixBlur={1}
					mixStrength={40}
					depthScale={1}
					minDepthThreshold={0.85}
					color='#202020'
					metalness={0.8}
					roughness={1}
					mirror={0.5}
				/>
			</mesh>
		</group>
	)
}

// Предзагрузка модели для оптимизации
useGLTF.preload('/models/pipeline.glb')
