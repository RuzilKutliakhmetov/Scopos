import { useThree } from '@react-three/fiber'
import { useCallback, useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { VIEWER_CONFIG } from '../../config/viewerConfig'
import { useSelection } from '../../context/SelectionContext'
import { emitCustomEvent, useCustomEvent } from '../../hooks/useCustomEvent'
import { createSmartObjectFinder } from '../../utils/scene-utils'

const SelectionManager: React.FC = () => {
	const { camera, gl, scene } = useThree()
	const { selected, select, deselect, clear, setHovered } = useSelection()

	const raycaster = useRef(new THREE.Raycaster())
	const mouse = useRef(new THREE.Vector2())
	const hoverTimeout = useRef<number | undefined>(undefined)
	const startPos = useRef({ x: 0, y: 0 })

	// Мапы для хранения оригинальных материалов
	const selectionMap = useRef(
		new Map<
			string,
			{
				object: THREE.Object3D
				originalMaterial: THREE.Material | THREE.Material[]
			}
		>()
	)
	const hoverMap = useRef(
		new Map<
			string,
			{
				object: THREE.Object3D
				originalMaterial: THREE.Material | THREE.Material[]
			}
		>()
	)

	// Создаем умный поиск с кэшированием
	const smartFindObject = useMemo(() => {
		return createSmartObjectFinder(scene)
	}, [scene])

	// Мемоизированная функция для получения объекта под курсором с debounce
	const getHitObject = useMemo(() => {
		let lastCheckTime = 0
		const CHECK_INTERVAL = 16 // ~60 FPS

		return (event: MouseEvent): THREE.Object3D | null => {
			const now = performance.now()
			if (now - lastCheckTime < CHECK_INTERVAL) {
				return null
			}
			lastCheckTime = now

			const rect = gl.domElement.getBoundingClientRect()

			mouse.current.set(
				((event.clientX - rect.left) / rect.width) * 2 - 1,
				-((event.clientY - rect.top) / rect.height) * 2 + 1
			)

			raycaster.current.setFromCamera(mouse.current, camera)

			const intersects = raycaster.current.intersectObjects(
				scene.children,
				true
			)

			for (const intersect of intersects) {
				const object = intersect.object
				let current: THREE.Object3D | null = object

				// Ищем первый родительский объект с именем
				while (current && !current.name) {
					current = current.parent
				}

				if (
					current &&
					current.layers.isEnabled(VIEWER_CONFIG.layers.pipeline)
				) {
					return current
				}
			}

			return null
		}
	}, [camera, gl, scene])

	// Мемоизированная функция для установки цвета объекту
	const setObjectColor = useMemo(() => {
		return (
			object: THREE.Object3D,
			color: number,
			map: Map<
				string,
				{
					object: THREE.Object3D
					originalMaterial: THREE.Material | THREE.Material[]
				}
			>
		) => {
			if (!object || map.has(object.uuid) || !(object as THREE.Mesh).material)
				return

			const mesh = object as THREE.Mesh

			map.set(object.uuid, {
				object,
				originalMaterial: mesh.material,
			})

			const createHighlightMaterial = (
				original: THREE.Material
			): THREE.Material => {
				if (original instanceof THREE.MeshBasicMaterial) {
					const material = original.clone()
					material.color.setHex(color)
					return material
				} else if (original instanceof THREE.MeshStandardMaterial) {
					const material = original.clone()
					material.color.setHex(color)
					material.emissive.setHex(color).multiplyScalar(0.3)
					material.emissiveIntensity = 0.3
					return material
				} else {
					// Для других типов материалов создаем простой материал
					return new THREE.MeshBasicMaterial({
						color: color,
						transparent: true,
						opacity: 0.7,
					})
				}
			}

			if (Array.isArray(mesh.material)) {
				mesh.material = mesh.material.map(createHighlightMaterial)
			} else {
				mesh.material = createHighlightMaterial(mesh.material as THREE.Material)
			}
		}
	}, [])

	// Мемоизированная функция для сброса цвета объекта
	const resetObjectColor = useMemo(() => {
		return (
			object: THREE.Object3D,
			map: Map<
				string,
				{
					object: THREE.Object3D
					originalMaterial: THREE.Material | THREE.Material[]
				}
			>
		) => {
			const stored = map.get(object.uuid)
			if (!stored) return

			const mesh = object as THREE.Mesh
			const currentMaterial = mesh.material

			mesh.material = stored.originalMaterial
			map.delete(object.uuid)

			// Очищаем клонированные материалы
			const disposeMaterial = (material: THREE.Material) => {
				if (material !== stored.originalMaterial) {
					material.dispose?.()
				}
			}

			if (Array.isArray(currentMaterial)) {
				const currentMaterials = currentMaterial as THREE.Material[]

				if (Array.isArray(stored.originalMaterial)) {
					// Сравниваем и удаляем только те, которые отличаются
					const originalMaterials = stored.originalMaterial as THREE.Material[]
					currentMaterials.forEach((material, index) => {
						if (
							index < originalMaterials.length &&
							material !== originalMaterials[index]
						) {
							disposeMaterial(material)
						} else if (index >= originalMaterials.length) {
							disposeMaterial(material)
						}
					})
				} else {
					// Если оригинальный материал не массив, а текущий - массив
					currentMaterials.forEach(disposeMaterial)
				}
			} else if (
				currentMaterial &&
				currentMaterial !== stored.originalMaterial
			) {
				// Если текущий материал не массив
				if (!Array.isArray(stored.originalMaterial)) {
					disposeMaterial(currentMaterial as THREE.Material)
				} else {
					// Если оригинальный материал - массив, а текущий - нет
					disposeMaterial(currentMaterial as THREE.Material)
				}
			}
		}
	}, [])

	const handleMouseMove = useCallback(
		(event: MouseEvent) => {
			if (hoverTimeout.current !== undefined) {
				clearTimeout(hoverTimeout.current)
				hoverTimeout.current = undefined
			}

			const hit = getHitObject(event)

			// Сбрасываем предыдущий hover
			hoverMap.current.forEach((stored, uuid) => {
				if (selectionMap.current.has(uuid)) return
				resetObjectColor(stored.object, hoverMap.current)
			})
			hoverMap.current.clear()

			setHovered(null)

			if (hit && !selectionMap.current.has(hit.uuid)) {
				hoverTimeout.current = window.setTimeout(() => {
					setObjectColor(
						hit,
						VIEWER_CONFIG.selection.hoverColor,
						hoverMap.current
					)
					setHovered(hit.uuid)
				}, VIEWER_CONFIG.selection.hoverDelay)
			}

			gl.domElement.style.cursor = hit ? 'pointer' : 'default'
		},
		[getHitObject, resetObjectColor, setObjectColor, setHovered, gl]
	)

	// Функция выделения объекта по имени
	const selectObjectByName = useCallback(
		(objectName: string) => {
			console.log(`🎯 Выделение объекта по имени: ${objectName}`)

			const foundObject = smartFindObject(objectName)

			if (!foundObject) {
				console.warn(`❌ Объект "${objectName}" не найден для выделения`)
				return false
			}

			const hitUuid = foundObject.uuid

			// Снимаем все предыдущие выделения
			selectionMap.current.forEach((stored, uuid) => {
				resetObjectColor(stored.object, selectionMap.current)
				deselect(uuid)
			})
			selectionMap.current.clear()

			// Добавляем новое выделение
			setObjectColor(
				foundObject,
				VIEWER_CONFIG.selection.selectColor,
				selectionMap.current
			)
			select(hitUuid)

			console.log(`✅ Объект выделен: ${foundObject.name}`)
			return true
		},
		[smartFindObject, resetObjectColor, setObjectColor, select, deselect]
	)

	// Обработчик события выделения из таблицы
	useCustomEvent<{ objectName: string }>(
		'select-object',
		useCallback(
			detail => {
				console.log(`📡 Получено событие выделения: ${detail.objectName}`)
				selectObjectByName(detail.objectName)
			},
			[selectObjectByName]
		)
	)

	// Обработчик клика на объект в сцене
	const handleMouseUp = useCallback(
		(event: MouseEvent) => {
			const moveDistance = Math.hypot(
				event.clientX - startPos.current.x,
				event.clientY - startPos.current.y
			)

			if (moveDistance > VIEWER_CONFIG.selection.moveThreshold) return

			const hit = getHitObject(event)
			const isMultiSelect = event.ctrlKey || event.metaKey

			if (hit) {
				const hitUuid = hit.uuid

				// Сбрасываем hover
				if (hoverMap.current.has(hitUuid)) {
					resetObjectColor(hit, hoverMap.current)
					hoverMap.current.delete(hitUuid)
				}
				setHovered(null)

				if (selectionMap.current.has(hitUuid)) {
					// Снимаем выделение
					resetObjectColor(hit, selectionMap.current)
					selectionMap.current.delete(hitUuid)
					deselect(hitUuid)
				} else {
					// Добавляем выделение
					if (!isMultiSelect) {
						selectionMap.current.forEach((stored, uuid) => {
							resetObjectColor(stored.object, selectionMap.current)
							deselect(uuid)
						})
						selectionMap.current.clear()
					}

					setObjectColor(
						hit,
						VIEWER_CONFIG.selection.selectColor,
						selectionMap.current
					)
					select(hitUuid)

					// Открываем таблицу с детальной информацией
					if (hit.name) {
						console.log(`🎯 Клик на объект модели: ${hit.name}`)
						emitCustomEvent('open-equipment-details', { code: hit.name })

						// Фокусируемся на объекте
						emitCustomEvent('focus-on-object', {
							objectName: hit.name,
							instant: false,
						})
					}
				}
			} else {
				// Клик на пустое место
				hoverMap.current.forEach(stored => {
					resetObjectColor(stored.object, hoverMap.current)
				})
				hoverMap.current.clear()
				setHovered(null)

				if (!isMultiSelect && selectionMap.current.size > 0) {
					selectionMap.current.forEach((stored, uuid) => {
						resetObjectColor(stored.object, selectionMap.current)
						deselect(uuid)
					})
					selectionMap.current.clear()
				}
			}
		},
		[
			getHitObject,
			resetObjectColor,
			setObjectColor,
			select,
			deselect,
			setHovered,
		]
	)

	const handleMouseDown = useCallback((event: MouseEvent) => {
		startPos.current = { x: event.clientX, y: event.clientY }
	}, [])

	// Очистка всех выделений
	const clearAllSelections = useCallback(() => {
		selectionMap.current.forEach(stored => {
			resetObjectColor(stored.object, selectionMap.current)
		})
		hoverMap.current.forEach(stored => {
			resetObjectColor(stored.object, hoverMap.current)
		})

		selectionMap.current.clear()
		hoverMap.current.clear()
		clear()

		if (hoverTimeout.current !== undefined) {
			clearTimeout(hoverTimeout.current)
			hoverTimeout.current = undefined
		}

		gl.domElement.style.cursor = 'default'
	}, [resetObjectColor, clear, gl])

	useEffect(() => {
		const canvas = gl.domElement

		canvas.addEventListener('mousemove', handleMouseMove)
		canvas.addEventListener('mousedown', handleMouseDown)
		canvas.addEventListener('mouseup', handleMouseUp)

		const handleResetCamera = () => clearAllSelections()
		const handleClearSelections = () => clearAllSelections()

		window.addEventListener('reset-camera', handleResetCamera)
		window.addEventListener('clear-selections', handleClearSelections)

		return () => {
			canvas.removeEventListener('mousemove', handleMouseMove)
			canvas.removeEventListener('mousedown', handleMouseDown)
			canvas.removeEventListener('mouseup', handleMouseUp)

			window.removeEventListener('reset-camera', handleResetCamera)
			window.removeEventListener('clear-selections', handleClearSelections)

			clearAllSelections()
		}
	}, [gl, handleMouseMove, handleMouseDown, handleMouseUp, clearAllSelections])

	// Синхронизация с контекстом при изменении selected
	useEffect(() => {
		// Удаляем выделения, которых нет в контексте
		selectionMap.current.forEach((stored, uuid) => {
			if (!selected.has(uuid)) {
				resetObjectColor(stored.object, selectionMap.current)
				selectionMap.current.delete(uuid)
			}
		})
	}, [selected, resetObjectColor])

	return null
}

export default SelectionManager
