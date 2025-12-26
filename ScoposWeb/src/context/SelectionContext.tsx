import React, {
	createContext,
	useCallback,
	useContext,
	useMemo,
	useState,
} from 'react'

interface SelectionContextType {
	selected: Set<string>
	hovered: string | null
	select: (uuid: string) => void
	deselect: (uuid: string) => void
	clear: () => void
	setHovered: (uuid: string | null) => void
}

const SelectionContext = createContext<SelectionContextType | undefined>(
	undefined
)

export const SelectionProvider: React.FC<{ children: React.ReactNode }> = ({
	children,
}) => {
	const [selected, setSelected] = useState<Set<string>>(new Set())
	const [hovered, setHovered] = useState<string | null>(null)

	const select = useCallback((uuid: string) => {
		setSelected(prev => new Set(prev).add(uuid))
	}, [])

	const deselect = useCallback((uuid: string) => {
		setSelected(prev => {
			const next = new Set(prev)
			next.delete(uuid)
			return next
		})
	}, [])

	const clear = useCallback(() => {
		setSelected(new Set())
		setHovered(null)
	}, [])

	const contextValue = useMemo(
		() => ({
			selected,
			hovered,
			select,
			deselect,
			clear,
			setHovered,
		}),
		[selected, hovered, select, deselect, clear]
	)

	return (
		<SelectionContext.Provider value={contextValue}>
			{children}
		</SelectionContext.Provider>
	)
}

export const useSelection = () => {
	const context = useContext(SelectionContext)
	if (!context) {
		throw new Error('useSelection must be used within SelectionProvider')
	}
	return context
}
