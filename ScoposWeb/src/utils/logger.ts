export const logger = {
	info: (...args: any[]) => {
		if (import.meta.env.DEV) console.log(...args)
	},

	warn: (...args: any[]) => {
		if (import.meta.env.DEV) console.warn(...args)
	},

	error: (...args: any[]) => {
		console.error(...args) // Ошибки всегда логируем
	},

	debug: (...args: any[]) => {
		if (import.meta.env.DEV && import.meta.env.VITE_DEBUG === 'true') {
			console.debug(...args)
		}
	},
}
