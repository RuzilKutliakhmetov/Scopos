import { useThree } from '@react-three/fiber'
import { useEffect } from 'react'
import * as THREE from 'three'
import { VIEWER_CONFIG } from '../../config/viewerConfig'

const Lighting = () => {
	const { camera, scene } = useThree()

	useEffect(() => {
		console.log('💡 Инициализация освещения')

		// AmbientLight
		const ambientLight = new THREE.AmbientLight(
			VIEWER_CONFIG.lights.ambient.color,
			VIEWER_CONFIG.lights.ambient.intensity
		)
		scene.add(ambientLight)

		// DirectionalLight
		const directionalLight = new THREE.DirectionalLight(
			0xffffff,
			VIEWER_CONFIG.lights.directional.intensity
		)

		directionalLight.position.set(...VIEWER_CONFIG.lights.directional.position)
		directionalLight.target.position.set(
			...VIEWER_CONFIG.lights.directional.target
		)

		camera.add(directionalLight)
		camera.add(directionalLight.target)
		scene.add(camera)

		console.log('✅ Освещение настроено')

		return () => {
			scene.remove(ambientLight)
			camera.remove(directionalLight)
			camera.remove(directionalLight.target)
		}
	}, [camera, scene])

	return null
}

export default Lighting
