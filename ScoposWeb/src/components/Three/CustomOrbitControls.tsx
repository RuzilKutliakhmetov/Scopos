import { OrbitControls } from '@react-three/drei'
import { useThree } from '@react-three/fiber'
import { useCallback, useEffect, useRef } from 'react'
import * as THREE from 'three'
import { VIEWER_CONFIG } from '../../config/viewerConfig'
import { emitCustomEvent } from '../../hooks/useCustomEvent'

const CustomOrbitControls = (props: any) => {
	const controlsRef = useRef<any>(null)
	const { camera, gl } = useThree()
	const zoomVector = useRef(new THREE.Vector3())

	// Уведомляем о готовности контролов
	useEffect(() => {
		if (controlsRef.current) {
			console.log('🚀 OrbitControls инициализированы')
			emitCustomEvent('controls-ready', { controls: controlsRef.current })

			// Настраиваем базовую чувствительность
			setupControlsSensitivity()
		}
	}, [controlsRef.current])

	// Настройка чувствительности контролов
	const setupControlsSensitivity = useCallback(() => {
		if (!controlsRef.current) return

		const controls = controlsRef.current

		// Базовая скорость из конфига
		controls.panSpeed = VIEWER_CONFIG.controls.panSpeed
		controls.rotateSpeed = VIEWER_CONFIG.controls.rotateSpeed

		console.log(
			`🎮 Настройка контролов: panSpeed=${controls.panSpeed}, rotateSpeed=${controls.rotateSpeed}`
		)
	}, [])

	// Обновляем чувствительность при изменении расстояния
	const updateSensitivity = useCallback(() => {
		if (!controlsRef.current) return

		const controls = controlsRef.current
		const distance = controls.getDistance()

		// Нормализуем расстояние (от 0 до 1)
		const normalizedDistance =
			(distance - VIEWER_CONFIG.controls.minDistance) /
			(VIEWER_CONFIG.controls.maxDistance - VIEWER_CONFIG.controls.minDistance)

		// Базовый коэффициент (чем ближе, тем меньше чувствительность)
		const baseCoefficient = 1.0 + normalizedDistance * 0.5

		// Применяем коэффициенты
		controls.panSpeed = VIEWER_CONFIG.controls.panSpeed * baseCoefficient
		controls.rotateSpeed = VIEWER_CONFIG.controls.rotateSpeed * baseCoefficient

		// console.log(`📐 Дистанция: ${distance.toFixed(1)}, panSpeed: ${controls.panSpeed.toFixed(2)}`)
	}, [])

	// Отслеживаем изменения для обновления чувствительности
	useEffect(() => {
		if (!controlsRef.current) return

		let lastDistance = controlsRef.current.getDistance()
		let animationFrameId: number

		const checkDistance = () => {
			if (!controlsRef.current) return

			const currentDistance = controlsRef.current.getDistance()

			// Если расстояние изменилось значительно, обновляем чувствительность
			if (Math.abs(currentDistance - lastDistance) > 0.1) {
				lastDistance = currentDistance
				updateSensitivity()
			}

			animationFrameId = requestAnimationFrame(checkDistance)
		}

		animationFrameId = requestAnimationFrame(checkDistance)

		return () => {
			if (animationFrameId) {
				cancelAnimationFrame(animationFrameId)
			}
		}
	}, [updateSensitivity])

	const handleWheel = useCallback(
		(event: WheelEvent) => {
			if (!controlsRef.current) return

			event.preventDefault()

			const rect = gl.domElement.getBoundingClientRect()
			const zoomStep = VIEWER_CONFIG.zoom.step * (event.deltaY < 0 ? 1 : -1)

			zoomVector.current
				.set(
					((event.clientX - rect.left) / rect.width) * 2 - 1,
					-((event.clientY - rect.top) / rect.height) * 2 + 1,
					0.5
				)
				.unproject(camera)
				.sub(camera.position)
				.normalize()
				.multiplyScalar(zoomStep)

			const newCameraPosition = camera.position.clone().add(zoomVector.current)
			const distanceToTarget = newCameraPosition.distanceTo(
				controlsRef.current.target
			)

			if (
				distanceToTarget >= VIEWER_CONFIG.zoom.minDistance &&
				distanceToTarget <= VIEWER_CONFIG.zoom.maxDistance
			) {
				camera.position.add(zoomVector.current)
				controlsRef.current.target.add(zoomVector.current)
				controlsRef.current.update()

				// Обновляем чувствительность после зума
				updateSensitivity()
			}
		},
		[camera, gl, updateSensitivity]
	)

	const handleResetCamera = useCallback(() => {
		if (!controlsRef.current) return

		controlsRef.current.reset()

		camera.position.set(...VIEWER_CONFIG.camera.position)
		camera.lookAt(...VIEWER_CONFIG.camera.target)
		camera.updateProjectionMatrix()

		controlsRef.current.target.set(...VIEWER_CONFIG.camera.target)
		controlsRef.current.update()

		// Обновляем чувствительность после сброса
		updateSensitivity()
	}, [camera, updateSensitivity])

	useEffect(() => {
		const canvas = gl.domElement

		canvas.addEventListener('wheel', handleWheel, { passive: false })
		window.addEventListener('reset-camera', handleResetCamera)

		return () => {
			canvas.removeEventListener('wheel', handleWheel)
			window.removeEventListener('reset-camera', handleResetCamera)
		}
	}, [gl, handleWheel, handleResetCamera])

	return (
		<OrbitControls
			ref={controlsRef}
			enablePan={VIEWER_CONFIG.controls.enablePan}
			enableZoom={VIEWER_CONFIG.controls.enableZoom}
			enableRotate={VIEWER_CONFIG.controls.enableRotate}
			enableDamping={VIEWER_CONFIG.controls.enableDamping}
			dampingFactor={VIEWER_CONFIG.controls.dampingFactor}
			maxDistance={VIEWER_CONFIG.controls.maxDistance}
			minDistance={VIEWER_CONFIG.controls.minDistance}
			target={VIEWER_CONFIG.camera.target}
			{...props}
		/>
	)
}

export default CustomOrbitControls
