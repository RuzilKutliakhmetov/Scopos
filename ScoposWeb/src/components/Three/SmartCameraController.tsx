import { useThree } from '@react-three/fiber'
import { useCallback, useEffect, useRef } from 'react'
import * as THREE from 'three'
import { VIEWER_CONFIG } from '../../config/viewerConfig'
import { useCustomEvent } from '../../hooks/useCustomEvent'

interface FocusEventDetail {
	objectName: string
	instant?: boolean
	duration?: number
}

const SmartCameraController: React.FC = () => {
	const { camera, scene } = useThree()
	const controlsRef = useRef<any>(null)

	useEffect(() => {
		const handleControlsReady = (event: any) => {
			controlsRef.current = event.detail?.controls
		}

		window.addEventListener('controls-ready', handleControlsReady)

		return () => {
			window.removeEventListener('controls-ready', handleControlsReady)
		}
	}, [])

	// Умный поиск объектов
	const smartFindObject = useCallback(
		(searchName: string): THREE.Object3D | null => {
			let foundObject: THREE.Object3D | null = null
			const searchLower = searchName.toLowerCase()

			// Сначала ищем точное совпадение
			scene.traverse((object: THREE.Object3D) => {
				if (object.name === searchName) {
					foundObject = object
					return
				}
			})

			if (foundObject) return foundObject

			// Ищем частичное совпадение
			const matches: THREE.Object3D[] = []
			scene.traverse((object: THREE.Object3D) => {
				if (
					object.name.toLowerCase().includes(searchLower) ||
					searchLower.includes(object.name.toLowerCase())
				) {
					matches.push(object)
				}
			})

			if (matches.length > 0) {
				// Возвращаем первый объект с наилучшим совпадением
				return matches[0]
			}

			// Пытаемся найти по числовой части
			const numericMatch = searchName.match(/\d+/)
			if (numericMatch) {
				const number = numericMatch[0]
				scene.traverse((object: THREE.Object3D) => {
					if (object.name.includes(number)) {
						matches.push(object)
					}
				})

				if (matches.length > 0) {
					return matches[0]
				}
			}

			return null
		},
		[scene]
	)

	// Анимация камеры к объекту
	const animateToObject = useCallback(
		(
			targetObject: THREE.Object3D,
			instant: boolean = false,
			duration: number = 800
		) => {
			if (!targetObject || !controlsRef.current) {
				console.warn(
					'Не удалось начать анимацию: объект или контролы не найдены'
				)
				return
			}

			const currentPosition = camera.position.clone()
			const currentTarget = controlsRef.current.target.clone()

			// Получаем центр объекта
			const box = new THREE.Box3().setFromObject(targetObject)
			const center = new THREE.Vector3()
			box.getCenter(center)

			// Рассчитываем размер объекта
			const size = new THREE.Vector3()
			box.getSize(size)
			const maxDim = Math.max(size.x, size.y, size.z)

			// Сохраняем текущее направление от объекта к камере
			const currentDirection = currentPosition.clone().sub(center).normalize()

			// Если камера слишком близко к объекту, используем направление на цель
			let direction = currentDirection
			if (currentDirection.length() < 0.01) {
				direction = currentTarget
					.clone()
					.sub(currentPosition)
					.normalize()
					.multiplyScalar(-1)
			}

			// Рассчитываем новое расстояние на основе размера объекта
			const baseDistance = maxDim * 2.5
			const minDistance = VIEWER_CONFIG.controls.minDistance
			const maxDistance = VIEWER_CONFIG.controls.maxDistance
			const finalDistance = Math.max(
				minDistance,
				Math.min(baseDistance, maxDistance)
			)

			// Новая позиция камеры
			const newPosition = center
				.clone()
				.add(direction.multiplyScalar(finalDistance))

			if (instant) {
				camera.position.copy(newPosition)
				controlsRef.current.target.copy(center)
				controlsRef.current.update()
			} else {
				const startTime = performance.now()

				const animate = (currentTime: number) => {
					const elapsed = currentTime - startTime
					const progress = Math.min(elapsed / duration, 1)

					const easeProgress =
						progress < 0.5
							? 2 * progress * progress
							: 1 - Math.pow(-2 * progress + 2, 2) / 2

					camera.position.lerpVectors(
						currentPosition,
						newPosition,
						easeProgress
					)
					controlsRef.current.target.lerpVectors(
						currentTarget,
						center,
						easeProgress
					)
					controlsRef.current.update()

					if (progress < 1) {
						requestAnimationFrame(animate)
					}
				}

				requestAnimationFrame(animate)
			}
		},
		[camera]
	)

	// Главная функция фокусировки
	const focusOnObject = useCallback(
		(objectName: string, instant: boolean = false) => {
			console.log(`🔍 Поиск объекта: ${objectName}`)

			const targetObject = smartFindObject(objectName)

			if (!targetObject) {
				console.warn(`❌ Объект "${objectName}" не найден в сцене`)

				// Даже если объект не найден, можно добавить уведомление для пользователя
				// emitCustomEvent('show-notification', {
				// 	message: `Объект ${objectName} не найден в модели`,
				// 	type: 'warning'
				// })

				return
			}

			console.log(`✅ Найден объект: ${targetObject.name}`)
			animateToObject(targetObject, instant)
		},
		[smartFindObject, animateToObject]
	)

	// Подписка на события
	useCustomEvent<FocusEventDetail>(
		'focus-on-object',
		useCallback(
			detail => {
				focusOnObject(detail.objectName, detail.instant)
			},
			[focusOnObject]
		)
	)

	useCustomEvent(
		'reset-camera',
		useCallback(() => {
			if (!controlsRef.current) return

			const resetPosition = new THREE.Vector3(...VIEWER_CONFIG.camera.position)
			const resetTarget = new THREE.Vector3(...VIEWER_CONFIG.camera.target)
			const currentPosition = camera.position.clone()
			const currentTarget = controlsRef.current.target.clone()

			const startTime = performance.now()
			const duration = 800

			const animate = (currentTime: number) => {
				const elapsed = currentTime - startTime
				const progress = Math.min(elapsed / duration, 1)

				const easeProgress =
					progress < 0.5
						? 2 * progress * progress
						: 1 - Math.pow(-2 * progress + 2, 2) / 2

				camera.position.lerpVectors(
					currentPosition,
					resetPosition,
					easeProgress
				)
				controlsRef.current.target.lerpVectors(
					currentTarget,
					resetTarget,
					easeProgress
				)
				controlsRef.current.update()

				if (progress < 1) {
					requestAnimationFrame(animate)
				}
			}

			requestAnimationFrame(animate)
		}, [camera])
	)

	return null
}

export default SmartCameraController
