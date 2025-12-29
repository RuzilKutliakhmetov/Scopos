import { useThree } from '@react-three/fiber'
import { useEffect, useMemo } from 'react'
import * as THREE from 'three'
import { useEquipmentFilter } from '../../context/EquipmentFilterContext'
import { createSmartObjectFinder } from '../../utils/scene-utils'

const EquipmentFilterManager: React.FC = () => {
	const { scene } = useThree()
	const { filterMode, filterCodes } = useEquipmentFilter()

	// Создаем умный поиск объектов
	const smartFindObject = useMemo(() => {
		return createSmartObjectFinder(scene)
	}, [scene])

	// Материал для полупрозрачных объектов
	const transparentMaterial = useMemo(() => {
		return new THREE.MeshBasicMaterial({
			color: 0x888888,
			transparent: true,
			opacity: 0.1, // 90% прозрачности
			depthWrite: true,
		})
	}, [])

	// // Материал для обычных объектов
	// const normalMaterial = useMemo(() => {
	// 	return new THREE.MeshStandardMaterial({
	// 		color: 0xffffff,
	// 		metalness: 0.5,
	// 		roughness: 0.5,
	// 	})
	// }, [])

	// Карта для хранения оригинальных материалов
	const originalMaterials = useMemo(() => {
		return new Map<string, THREE.Material | THREE.Material[]>()
	}, [])

	// Применяем фильтрацию к объектам сцены
	useEffect(() => {
		if (filterMode === null || filterCodes.size === 0) {
			// Сбрасываем все изменения
			originalMaterials.forEach((material, uuid) => {
				const obj = scene.getObjectByProperty('uuid', uuid) as THREE.Mesh
				if (obj && obj.material) {
					obj.material = material
				}
			})
			originalMaterials.clear()
			return
		}

		console.log(
			`🎯 Применение фильтра ${filterMode} для ${filterCodes.size} кодов`
		)

		// Сначала сбрасываем предыдущие изменения
		originalMaterials.forEach((material, uuid) => {
			const obj = scene.getObjectByProperty('uuid', uuid) as THREE.Mesh
			if (obj && obj.material) {
				obj.material = material
			}
		})
		originalMaterials.clear()

		// Проходим по всем объектам сцены
		scene.traverse((object: THREE.Object3D) => {
			if (!object.name || !(object instanceof THREE.Mesh)) {
				return
			}

			// Проверяем, соответствует ли объект фильтру
			let shouldHighlight = false

			for (const code of filterCodes) {
				const foundObject = smartFindObject(code)
				if (foundObject && foundObject.uuid === object.uuid) {
					shouldHighlight = true
					break
				}
			}

			const mesh = object as THREE.Mesh

			if (shouldHighlight) {
				// Объект соответствует фильтру - оставляем нормальным
				if (!originalMaterials.has(mesh.uuid)) {
					originalMaterials.set(mesh.uuid, mesh.material)
				}
				// Можно добавить подсветку, если нужно
				// mesh.material = highlightMaterial
			} else {
				// Объект не соответствует фильтру - делаем полупрозрачным
				if (!originalMaterials.has(mesh.uuid)) {
					originalMaterials.set(mesh.uuid, mesh.material)
				}
				mesh.material = transparentMaterial
			}
		})

		console.log(`✅ Применен фильтр к ${originalMaterials.size} объектам`)

		// Очистка при размонтировании
		return () => {
			originalMaterials.forEach((material, uuid) => {
				const obj = scene.getObjectByProperty('uuid', uuid) as THREE.Mesh
				if (obj && obj.material) {
					obj.material = material
				}
			})
			originalMaterials.clear()
		}
	}, [
		filterMode,
		filterCodes,
		scene,
		smartFindObject,
		transparentMaterial,
		originalMaterials,
	])

	return null
}

export default EquipmentFilterManager
