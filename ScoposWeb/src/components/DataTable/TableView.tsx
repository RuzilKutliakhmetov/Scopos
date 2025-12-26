import {
	getCoreRowModel,
	getFilteredRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	useReactTable,
	type ColumnFiltersState,
	type SortingState,
} from '@tanstack/react-table'
import React, { memo, useCallback, useMemo, useState } from 'react'
import { emitCustomEvent } from '../../hooks/useCustomEvent'
import type { EquipmentItem } from '../../types/api'
import FixedGridTable from './FixedGridTable'
import TableControls from './TableControls'
import TablePagination from './TablePagination'

interface TableViewProps {
	equipmentList: EquipmentItem[]
	loading: boolean
	error: string | null
	onSelectEquipment: (modelCode: string) => void
	onRefresh: () => void
}

const TableViewComponent: React.FC<TableViewProps> = ({
	equipmentList,
	loading,
	error,
	onSelectEquipment,
	onRefresh,
}) => {
	const [sorting, setSorting] = useState<SortingState>([])
	const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
	const [globalFilter, setGlobalFilter] = useState('')

	// ПРОСТОЙ обработчик выбора оборудования
	const handleSelectEquipment = useCallback(
		(modelCode: string) => {
			console.log(`🖱️ Клик на строку таблицы: ${modelCode}`)

			// 1. Отправляем ДВА события
			emitCustomEvent('focus-on-object', {
				objectName: modelCode,
				instant: false,
			})

			emitCustomEvent('select-object', {
				objectName: modelCode,
			})

			// 2. Загружаем детали
			onSelectEquipment(modelCode)
		},
		[onSelectEquipment]
	)

	// Определяем колонки для таблицы
	const columns = useMemo(
		() => [
			{
				id: 'code',
				accessorKey: 'code',
				header: 'Код',
				cell: (info: any) => (
					<div className='truncate font-mono'>{info.getValue()}</div>
				),
			},
			{
				id: 'name',
				accessorKey: 'name',
				header: 'Наименование',
				cell: (info: any) => <div className='truncate'>{info.getValue()}</div>,
			},
			{
				id: 'className',
				accessorKey: 'className',
				header: 'Класс',
				cell: (info: any) => <div className='truncate'>{info.getValue()}</div>,
			},
			{
				id: 'manufacturer',
				accessorKey: 'manufacturer',
				header: 'Производитель',
				cell: (info: any) => <div className='truncate'>{info.getValue()}</div>,
			},
			{
				id: 'inventoryNumber',
				accessorKey: 'inventoryNumber',
				header: 'Инв. номер',
				cell: (info: any) => (
					<div className='truncate font-mono text-xs'>{info.getValue()}</div>
				),
			},
		],
		[]
	)

	// Создаем таблицу
	const table = useReactTable({
		data: equipmentList,
		columns,
		state: {
			sorting,
			columnFilters,
			globalFilter,
		},
		onSortingChange: setSorting,
		onColumnFiltersChange: setColumnFilters,
		onGlobalFilterChange: setGlobalFilter,
		getCoreRowModel: getCoreRowModel(),
		getSortedRowModel: getSortedRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		initialState: {
			pagination: {
				pageSize: 20,
				pageIndex: 0,
			},
		},
	})

	return (
		<div className='h-full flex flex-col'>
			<TableControls
				globalFilter={globalFilter}
				onGlobalFilterChange={setGlobalFilter}
				onRefresh={onRefresh}
				loading={loading}
			/>

			{error && (
				<div className='m-4 p-4 bg-red-500/10 border border-red-500/30 rounded-lg'>
					<p className='text-red-300 text-sm'>{error}</p>
				</div>
			)}

			<FixedGridTable
				table={table}
				loading={loading}
				equipmentList={equipmentList}
				onSelectEquipment={handleSelectEquipment}
			/>

			<TablePagination table={table} />
		</div>
	)
}

TableViewComponent.displayName = 'TableView'

export default memo(TableViewComponent)
