import { useMemo } from 'react'
import { VIEWER_CONFIG } from '../config/viewerConfig'

export const useViewerConfig = () => {
	return useMemo(() => {
		// Загружать все настройки localStorage за один раз
		const storedShowGrid = localStorage.getItem('viewer-show-grid')

		return {
			...VIEWER_CONFIG,
			ui: {
				...VIEWER_CONFIG.ui,
				showGrid: storedShowGrid
					? storedShowGrid === 'true'
					: VIEWER_CONFIG.ui.showGrid,
			},
		}
	}, [])
}
