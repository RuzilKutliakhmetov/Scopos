// components/Three/RenderOptimization.tsx
import { useFrame, useThree } from '@react-three/fiber'
import { useEffect, useRef } from 'react'
import * as THREE from 'three'

const RenderOptimization = () => {
	const { gl, scene, camera } = useThree()
	const needsRender = useRef(false)
	const frameId = useRef<number>(0)

	// Флаг для отладки производительности
	const isDev = useRef(false) // Заменили process.env.NODE_ENV на useRef
	const stats = useRef({
		frames: 0,
		lastTime: 0,
		fps: 0,
	})

	// Оптимизированный рендеринг только при необходимости
	useFrame(() => {
		if (needsRender.current) {
			gl.render(scene, camera)
			needsRender.current = false
		}

		// Сбор статистики в dev-режиме
		if (isDev.current) {
			stats.current.frames++
			const now = performance.now()
			if (now - stats.current.lastTime >= 1000) {
				stats.current.fps = Math.round(
					(stats.current.frames * 1000) / (now - stats.current.lastTime)
				)
				stats.current.frames = 0
				stats.current.lastTime = now

				if (stats.current.fps < 55) {
					console.warn(`Low FPS: ${stats.current.fps}`)
				}
			}
		}
	})

	// Отслеживаем изменения сцены
	useEffect(() => {
		const onSceneChange = () => {
			needsRender.current = true
		}

		// Подписываемся на изменения в сцене
		const traverseAndAddListeners = () => {
			scene.traverse(obj => {
				obj.addEventListener('added', onSceneChange)
				obj.addEventListener('removed', onSceneChange)
			})
		}

		traverseAndAddListeners()

		// Также отслеживаем добавление новых объектов
		const onObjectAdded = (event: THREE.Event) => {
			const obj = event.target as THREE.Object3D
			obj.addEventListener('added', onSceneChange)
			obj.addEventListener('removed', onSceneChange)
		}

		scene.addEventListener('added', onObjectAdded)

		return () => {
			// Очистка слушателей
			scene.traverse(obj => {
				obj.removeEventListener('added', onSceneChange)
				obj.removeEventListener('removed', onSceneChange)
			})

			scene.removeEventListener('added', onObjectAdded)

			if (frameId.current) {
				cancelAnimationFrame(frameId.current)
			}
		}
	}, [scene])

	return null
}

export default RenderOptimization
