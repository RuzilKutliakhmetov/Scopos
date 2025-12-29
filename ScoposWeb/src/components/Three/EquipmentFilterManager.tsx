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

	// Материал для выделенных объектов
	const highlightMaterial = useMemo(() => {
		return new THREE.MeshBasicMaterial({
			color: filterMode === 'overdue' ? 0xff0000 : 0xffa500, // Красный для просроченных, оранжевый для дефектных
			transparent: true,
			opacity: 0.7,
			depthWrite: true,
		})
	}, [filterMode])

	// Материал для невыделенных объектов
	const dimmedMaterial = useMemo(() => {
		return new THREE.MeshBasicMaterial({
			color: 0x888888,
			transparent: true,
			opacity: 0.1, // 90% прозрачности
			depthWrite: true,
		})
	}, [])

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

		// Подсчет найденных объектов
		let highlightedCount = 0
		let dimmedCount = 0

		// Проходим по всем объектам сцены
		scene.traverse((object: THREE.Object3D) => {
			if (!object.name || !(object instanceof THREE.Mesh)) {
				return
			}

			const mesh = object as THREE.Mesh
			let shouldHighlight = false

			// Проверяем, соответствует ли объект фильтру
			for (const code of filterCodes) {
				const foundObject = smartFindObject(code)
				if (foundObject && foundObject.uuid === mesh.uuid) {
					shouldHighlight = true
					break
				}
			}

			if (shouldHighlight) {
				// Объект соответствует фильтру - выделяем цветом
				if (!originalMaterials.has(mesh.uuid)) {
					originalMaterials.set(mesh.uuid, mesh.material)
				}
				mesh.material = highlightMaterial
				highlightedCount++
			} else {
				// Объект не соответствует фильтру - затемняем
				if (!originalMaterials.has(mesh.uuid)) {
					originalMaterials.set(mesh.uuid, mesh.material)
				}
				mesh.material = dimmedMaterial
				dimmedCount++
			}
		})

		console.log(
			`✅ Применен фильтр: ${highlightedCount} выделено, ${dimmedCount} затемнено`
		)

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
		highlightMaterial,
		dimmedMaterial,
		originalMaterials,
	])

	return null
}

export default EquipmentFilterManager
