export interface PipeComponent {
	id: string
	name: string
	type: 'pipe' | 'valve' | 'flange' | 'pump' | 'tank'
	diameter: number
	pressure: number
	material: string
	sapEquipmentId?: string
	position: [number, number, number]
	rotation: [number, number, number]
}

export interface ModelMetadata {
	name: string
	description: string
	createdAt: string
	lastModified: string
	components: PipeComponent[]
	sapProjectId?: string
}

export interface ModelState {
	currentModel: ModelMetadata | null
	selectedComponent: PipeComponent | null
	isLoading: boolean
	error: string | null
	viewMode: 'solid' | 'wireframe' | 'xray'
}
