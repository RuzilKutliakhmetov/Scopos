export const LAYERS = {
	PIPELINE: 0,
	BACKGROUND: 1,
	OTHERS: 2,
} as const

export type Layer = (typeof LAYERS)[keyof typeof LAYERS]
