import { useThree } from '@react-three/fiber'
import { useEffect } from 'react'
import { VIEWER_CONFIG } from '../../config/viewerConfig'

interface LayerManagerProps {
	isPipelineMode: boolean
	showBackground: boolean
}

const LayerManager = ({
	isPipelineMode,
	showBackground,
}: LayerManagerProps) => {
	const { camera } = useThree()

	useEffect(() => {
		if (!camera) return

		console.log('🔄 Обновление слоев:', { isPipelineMode, showBackground })

		if (isPipelineMode) {
			// Режим только трубопроводы
			camera.layers.enable(VIEWER_CONFIG.layers.pipeline)
			camera.layers.disable(VIEWER_CONFIG.layers.background)
			camera.layers.disable(VIEWER_CONFIG.layers.others)
		} else {
			// Режим все объекты
			camera.layers.enable(VIEWER_CONFIG.layers.pipeline)
			camera.layers.enable(VIEWER_CONFIG.layers.others)

			if (showBackground) {
				camera.layers.enable(VIEWER_CONFIG.layers.background)
			} else {
				camera.layers.disable(VIEWER_CONFIG.layers.background)
			}
		}
	}, [camera, isPipelineMode, showBackground])

	return null
}

export default LayerManager
