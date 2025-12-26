import React, { createContext, useContext, useReducer } from 'react'
import { emitCustomEvent } from '../hooks/useCustomEvent'
import type { EquipmentDetails, EquipmentItem } from '../types/api'

interface DataTableState {
	equipmentList: EquipmentItem[]
	selectedEquipment: EquipmentDetails | null
	loading: boolean
	error: string | null
}

type DataTableAction =
	| { type: 'SET_EQUIPMENT_LIST'; payload: EquipmentItem[] }
	| { type: 'SET_SELECTED_EQUIPMENT'; payload: EquipmentDetails | null }
	| { type: 'SET_LOADING'; payload: boolean }
	| { type: 'SET_ERROR'; payload: string | null }
	| { type: 'CLEAR_SELECTION' }

const initialState: DataTableState = {
	equipmentList: [],
	selectedEquipment: null,
	loading: true,
	error: null,
}

const dataTableReducer = (
	state: DataTableState,
	action: DataTableAction
): DataTableState => {
	switch (action.type) {
		case 'SET_EQUIPMENT_LIST':
			return { ...state, equipmentList: action.payload }
		case 'SET_SELECTED_EQUIPMENT':
			return { ...state, selectedEquipment: action.payload }
		case 'SET_LOADING':
			return { ...state, loading: action.payload }
		case 'SET_ERROR':
			return { ...state, error: action.payload }
		case 'CLEAR_SELECTION':
			emitCustomEvent('clear-selections')
			return { ...state, selectedEquipment: null }
		default:
			return state
	}
}

const DataTableContext = createContext<{
	state: DataTableState
	dispatch: React.Dispatch<DataTableAction>
} | null>(null)

export const DataTableProvider: React.FC<{ children: React.ReactNode }> = ({
	children,
}) => {
	const [state, dispatch] = useReducer(dataTableReducer, initialState)

	return (
		<DataTableContext.Provider value={{ state, dispatch }}>
			{children}
		</DataTableContext.Provider>
	)
}

export const useDataTable = () => {
	const context = useContext(DataTableContext)
	if (!context) {
		throw new Error('useDataTable must be used within DataTableProvider')
	}
	return context
}
