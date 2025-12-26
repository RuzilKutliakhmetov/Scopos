import { useThree } from '@react-three/fiber'
import { useCallback, useEffect, useRef } from 'react'
import * as THREE from 'three'
import { VIEWER_CONFIG } from '../../config/viewerConfig'
import { useCustomEvent } from '../../hooks/useCustomEvent'

interface FocusEventDetail {
	objectName: string
	instant?: boolean
}

const FocusController: React.FC = () => {
	const { camera, scene } = useThree()
	const controlsRef = useRef<any>(null)
	const isAnimating = useRef(false)

	// Инициализация контролов
	useEffect(() => {
		const handleControlsReady = (event: any) => {
			controlsRef.current = event.detail?.controls
			console.log('🎮 Контролы камеры готовы для FocusController')
		}

		window.addEventListener('controls-ready', handleControlsReady)

		return () => {
			window.removeEventListener('controls-ready', handleControlsReady)
		}
	}, [])

	// Поиск объекта в сцене
	const findObjectInScene = useCallback(
		(searchName: string): THREE.Object3D | null => {
			console.log(`🔍 Поиск объекта: "${searchName}"`)

			let foundObject: THREE.Object3D | null = null

			// 1. Точное совпадение
			scene.traverse((object: THREE.Object3D) => {
				if (object.name && object.name === searchName) {
					foundObject = object
				}
			})
			if (foundObject) {
				return foundObject
			}
			// 2. Частичное совпадение (поисковая строка содержится в имени объекта)
			scene.traverse((object: THREE.Object3D) => {
				if (object.name && object.name.includes(searchName)) {
					foundObject = object
					console.log(`✅ Найдено частичное совпадение: "${object.name}"`)
				}
			})

			if (foundObject) return foundObject

			// 3. Поиск по числам
			const numbersInSearch = searchName.match(/\d+/g)
			if (numbersInSearch) {
				for (const number of numbersInSearch) {
					scene.traverse((object: THREE.Object3D) => {
						if (object.name && object.name.includes(number) && !foundObject) {
							foundObject = object
							console.log(`✅ Найдено по числу ${number}: ${object.name}`)
						}
					})
					if (foundObject) break
				}
			}

			if (!foundObject) {
				console.log(`⚠️ Объект "${searchName}" не найден в сцене`)
			}

			return foundObject
		},
		[scene]
	)

	// Плавная анимация камеры
	const animateCamera = useCallback(
		(
			startPos: THREE.Vector3,
			endPos: THREE.Vector3,
			startTarget: THREE.Vector3,
			endTarget: THREE.Vector3,
			duration: number = 800
		) => {
			if (isAnimating.current || !controlsRef.current) return

			isAnimating.current = true
			const startTime = performance.now()

			const animate = (currentTime: number) => {
				const elapsed = currentTime - startTime
				const progress = Math.min(elapsed / duration, 1)

				// Плавная интерполяция
				const easeProgress =
					progress < 0.5
						? 2 * progress * progress
						: 1 - Math.pow(-2 * progress + 2, 2) / 2

				// Интерполируем позицию камеры
				camera.position.lerpVectors(startPos, endPos, easeProgress)

				// Интерполируем точку взгляда
				controlsRef.current.target.lerpVectors(
					startTarget,
					endTarget,
					easeProgress
				)
				controlsRef.current.update()

				if (progress < 1) {
					requestAnimationFrame(animate)
				} else {
					isAnimating.current = false
				}
			}

			requestAnimationFrame(animate)
		},
		[camera]
	)

	// Главная функция фокусировки
	const focusOnObject = useCallback(
		(objectName: string, instant: boolean = false) => {
			console.log(`🎯 Запрос фокусировки на: "${objectName}"`)

			if (!controlsRef.current) {
				console.warn('❌ Контролы камеры не инициализированы')
				return
			}

			const targetObject = findObjectInScene(objectName)

			if (!targetObject) {
				console.log(
					`ℹ️ Объект "${objectName}" не найден, фокусировка не выполняется`
				)
				return
			}

			console.log(
				`✅ Объект найден: ${targetObject.name}, начинаем анимацию...`
			)

			// Получаем текущие параметры камеры
			const currentPosition = camera.position.clone()
			const currentTarget = controlsRef.current.target.clone()

			// Получаем центр объекта
			const box = new THREE.Box3().setFromObject(targetObject)
			const center = new THREE.Vector3()
			box.getCenter(center)

			// Получаем размер объекта
			const size = new THREE.Vector3()
			box.getSize(size)
			const maxDim = Math.max(size.x, size.y, size.z)

			// Сохраняем текущее направление от объекта к камере
			const directionToCamera = currentPosition.clone().sub(center).normalize()

			// Если направление почти нулевое, используем направление на цель
			let direction = directionToCamera
			if (direction.length() < 0.1) {
				direction = new THREE.Vector3(0, 0.3, 1).normalize()
			}

			// Рассчитываем расстояние до объекта
			const desiredDistance = Math.max(
				maxDim * 2.5,
				VIEWER_CONFIG.controls.minDistance
			)
			const finalDistance = Math.min(
				desiredDistance,
				VIEWER_CONFIG.controls.maxDistance
			)

			// Рассчитываем новую позицию камеры
			const newPosition = center
				.clone()
				.add(direction.multiplyScalar(finalDistance))

			if (instant) {
				// Мгновенное перемещение
				camera.position.copy(newPosition)
				controlsRef.current.target.copy(center)
				controlsRef.current.update()
				console.log('⚡ Мгновенная фокусировка выполнена')
			} else {
				// Плавная анимация
				animateCamera(currentPosition, newPosition, currentTarget, center)
				console.log('🎬 Начата плавная анимация фокусировки')
			}
		},
		[camera, findObjectInScene, animateCamera]
	)

	// Подписка на события фокусировки
	useCustomEvent<FocusEventDetail>(
		'focus-on-object',
		useCallback(
			detail => {
				console.log(`📡 Получено событие фокусировки: ${detail.objectName}`)
				focusOnObject(detail.objectName, detail.instant)
			},
			[focusOnObject]
		)
	)

	return null
}

export default FocusController
