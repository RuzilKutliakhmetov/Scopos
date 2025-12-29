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
			opacity: 0.1,
			depthWrite: true,
		})
	}, [])

	// Материал для заблокированных объектов (еще более прозрачный)
	const blockedMaterial = useMemo(() => {
		return new THREE.MeshBasicMaterial({
			color: 0x444444,
			transparent: true,
			opacity: 0.3,
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
		let blockedCount = 0

		// Функция для проверки соответствия объекта фильтру
		const checkObjectAgainstFilter = (objectName: string): boolean => {
			// Ищем объект по имени и проверяем его коды
			const foundObject = smartFindObject(objectName)
			if (!foundObject) return false

			// Проверяем все коды объекта (если их несколько в имени)
			const objectCodes = objectName.split(/[^0-9a-zA-Z-]/).filter(Boolean)

			for (const code of objectCodes) {
				if (filterCodes.has(code)) {
					return true
				}
			}

			// Также проверяем полное имя
			if (filterCodes.has(objectName)) {
				return true
			}

			return false
		}

		// Проходим по всем объектам сцены
		scene.traverse((object: THREE.Object3D) => {
			if (!object.name || !(object instanceof THREE.Mesh)) {
				return
			}

			const mesh = object as THREE.Mesh

			// Сохраняем оригинальный материал
			if (!originalMaterials.has(mesh.uuid)) {
				originalMaterials.set(mesh.uuid, mesh.material)
			}

			const matchesFilter = checkObjectAgainstFilter(object.name)

			if (matchesFilter) {
				// Объект соответствует фильтру - выделяем цветом
				mesh.material = highlightMaterial
				highlightedCount++
			} else {
				// Объект не соответствует фильтру - блокируем (делаем почти невидимым)
				mesh.material = blockedMaterial
				blockedCount++
			}
		})

		console.log(
			`✅ Применен фильтр: ${highlightedCount} выделено, ${blockedCount} заблокировано`
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
		blockedMaterial,
		originalMaterials,
	])

	return null
}

export default EquipmentFilterManager
