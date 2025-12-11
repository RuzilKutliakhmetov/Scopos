import { create } from 'zustand'
import type { ModelState, PipeComponent } from '../types/model'

interface ModelStore extends ModelState {
	setCurrentModel: (model: ModelState['currentModel']) => void
	selectComponent: (component: PipeComponent | null) => void
	setLoading: (loading: boolean) => void
	setViewMode: (mode: ModelState['viewMode']) => void
	reset: () => void
}

export const useModelStore = create<ModelStore>(set => ({
	currentModel: null,
	selectedComponent: null,
	isLoading: false,
	error: null,
	viewMode: 'solid',

	setCurrentModel: model => set({ currentModel: model }),

	selectComponent: component =>
		set({
			selectedComponent: component,
		}),

	setLoading: loading => set({ isLoading: loading }),

	setViewMode: mode => set({ viewMode: mode }),

	reset: () =>
		set({
			currentModel: null,
			selectedComponent: null,
			isLoading: false,
			error: null,
			viewMode: 'solid',
		}),
}))
