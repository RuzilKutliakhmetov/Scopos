import { useEffect } from 'react'
import type { GlobalEvent } from '../types/events'

export const useCustomEvent = <T = void>(
	eventName: GlobalEvent,
	callback: (data: T) => void,
	dependencies: any[] = []
) => {
	useEffect(() => {
		const handler = (event: Event) => {
			const customEvent = event as CustomEvent<T>
			callback(customEvent.detail)
		}

		window.addEventListener(eventName, handler)

		return () => {
			window.removeEventListener(eventName, handler)
		}
	}, [eventName, callback, ...dependencies])
}

export const emitCustomEvent = <T = void>(eventName: GlobalEvent, data?: T) => {
	const event =
		data !== undefined
			? new CustomEvent(eventName, { detail: data })
			: new CustomEvent(eventName)

	window.dispatchEvent(event)
}
