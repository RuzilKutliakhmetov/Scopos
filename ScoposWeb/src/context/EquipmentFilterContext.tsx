import React, {
	createContext,
	useCallback,
	useContext,
	useMemo,
	useState,
} from 'react'

export type EquipmentFilterMode = 'overdue' | 'defective' | null

interface EquipmentFilterContextType {
	filterMode: EquipmentFilterMode
	filterCodes: Set<string>
	isLoading: boolean
	error: string | null
	setFilterMode: (mode: EquipmentFilterMode) => Promise<void>
	clearFilter: () => void
	// Добавляем коллбэки для уведомления о смене фильтра
	onFilterChange?: (mode: EquipmentFilterMode) => void
}

const EquipmentFilterContext = createContext<
	EquipmentFilterContextType | undefined
>(undefined)

export const EquipmentFilterProvider: React.FC<{
	children: React.ReactNode
	onFilterChange?: (mode: EquipmentFilterMode) => void
}> = ({ children, onFilterChange }) => {
	const [filterMode, setFilterModeState] = useState<EquipmentFilterMode>(null)
	const [filterCodes, setFilterCodes] = useState<Set<string>>(new Set())
	const [isLoading, setIsLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)

	const setFilterMode = useCallback(
		async (mode: EquipmentFilterMode) => {
			if (mode === filterMode) {
				// Если нажимаем на активную кнопку - сбрасываем фильтр
				setFilterModeState(null)
				setFilterCodes(new Set())
				setError(null)

				// Уведомляем о сбросе фильтра
				if (onFilterChange) {
					onFilterChange(null)
				}
				return
			}

			setFilterModeState(mode)
			setError(null)
			setIsLoading(true)

			try {
				const { apiService } = await import('../services/api')
				let codes: string[] = []

				if (mode === 'overdue') {
					codes = await apiService.getOverdueEquipment()
				} else if (mode === 'defective') {
					codes = await apiService.getDefectiveEquipment()
				}
				setFilterCodes(new Set(codes))
				console.log(`✅ Загружены коды для режима ${mode}:`, codes)

				// Уведомляем о применении фильтра
				if (onFilterChange) {
					onFilterChange(mode)
				}
			} catch (err) {
				setError(`Не удалось загрузить данные для режима ${mode}`)
				console.error(`Error loading ${mode} equipment:`, err)
				setFilterModeState(null)
				setFilterCodes(new Set())

				// Уведомляем об ошибке
				if (onFilterChange) {
					onFilterChange(null)
				}
			} finally {
				setIsLoading(false)
			}
		},
		[filterMode, onFilterChange]
	)

	const clearFilter = useCallback(() => {
		setFilterModeState(null)
		setFilterCodes(new Set())
		setError(null)

		// Уведомляем о сбросе фильтра
		if (onFilterChange) {
			onFilterChange(null)
		}
	}, [onFilterChange])

	const contextValue = useMemo(
		() => ({
			filterMode,
			filterCodes,
			isLoading,
			error,
			setFilterMode,
			clearFilter,
		}),
		[filterMode, filterCodes, isLoading, error, setFilterMode, clearFilter]
	)

	return (
		<EquipmentFilterContext.Provider value={contextValue}>
			{children}
		</EquipmentFilterContext.Provider>
	)
}

export const useEquipmentFilter = () => {
	const context = useContext(EquipmentFilterContext)
	if (!context) {
		throw new Error(
			'useEquipmentFilter must be used within EquipmentFilterProvider'
		)
	}
	return context
}
