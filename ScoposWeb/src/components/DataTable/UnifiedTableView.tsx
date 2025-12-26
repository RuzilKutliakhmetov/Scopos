import {
	flexRender,
	getCoreRowModel,
	getFilteredRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	useReactTable,
	type ColumnFiltersState,
	type SortingState,
} from '@tanstack/react-table'
import { useVirtualizer } from '@tanstack/react-virtual'
import React, { memo, useCallback, useMemo, useRef, useState } from 'react'
import { emitCustomEvent } from '../../hooks/useCustomEvent'
import type { EquipmentItem } from '../../types/api'

interface UnifiedTableViewProps {
	equipmentList: EquipmentItem[]
	loading: boolean
	error: string | null
	onSelectEquipment: (modelCode: string) => void
	onRefresh: () => void
}

const UnifiedTableView: React.FC<UnifiedTableViewProps> = ({
	equipmentList,
	loading,
	error,
	onSelectEquipment,
}) => {
	const [sorting, setSorting] = useState<SortingState>([])
	const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
	const [globalFilter, setGlobalFilter] = useState('')
	const tableContainerRef = useRef<HTMLDivElement>(null)

	// Обработчик выбора оборудования
	const handleSelectEquipment = useCallback(
		(modelCode: string) => {
			console.log(`🖱️ Клик на строку таблицы: ${modelCode}`)

			// Отправляем события для фокусировки и выделения
			emitCustomEvent('focus-on-object', {
				objectName: modelCode,
				instant: false,
			})

			emitCustomEvent('select-object', {
				objectName: modelCode,
			})

			// Загружаем детали
			onSelectEquipment(modelCode)
		},
		[onSelectEquipment]
	)

	// Определяем колонки для таблицы (без "Производителя")
	const columns = useMemo(
		() => [
			{
				id: 'code',
				accessorKey: 'code',
				header: 'Код',
				cell: (info: any) => (
					<div className='truncate font-mono text-sm'>{info.getValue()}</div>
				),
				size: 110,
			},
			{
				id: 'name',
				accessorKey: 'name',
				header: 'Наименование',
				cell: (info: any) => <div className='truncate'>{info.getValue()}</div>,
				size: 200,
			},
			{
				id: 'className',
				accessorKey: 'className',
				header: 'Класс',
				cell: (info: any) => (
					<div className='truncate text-sm'>{info.getValue()}</div>
				),
				size: 130,
			},
			{
				id: 'inventoryNumber',
				accessorKey: 'inventoryNumber',
				header: 'Инв. номер',
				cell: (info: any) => (
					<div className='truncate font-mono text-xs'>{info.getValue()}</div>
				),
				size: 110,
			},
		],
		[]
	)

	// Создаем таблицу с помощью Tanstack Table
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

	// Получаем строки для текущей страницы
	const { rows } = table.getRowModel()
	const filteredRows = table.getFilteredRowModel().rows
	const pageSize = table.getState().pagination.pageSize
	const pageIndex = table.getState().pagination.pageIndex
	const pageCount = table.getPageCount()

	// Виртуализация строк
	const rowVirtualizer = useVirtualizer({
		count: rows.length,
		getScrollElement: () => tableContainerRef.current,
		estimateSize: () => 48,
		overscan: 5,
	})

	// Фиксированные размеры столбцов (обновленные)
	const columnWidths = {
		code: 110,
		name: 200,
		className: 130,
		inventoryNumber: 110,
	}
	const totalWidth = Object.values(columnWidths).reduce((a, b) => a + b, 0)

	// Расчет отображаемого диапазона
	const getDisplayedRange = () => {
		if (filteredRows.length === 0) return { start: 0, end: 0, total: 0 }

		const start = pageIndex * pageSize + 1
		const end = Math.min((pageIndex + 1) * pageSize, filteredRows.length)
		return { start, end, total: filteredRows.length }
	}

	const { start, end, total } = getDisplayedRange()

	// Компонент заголовка ячейки
	const HeaderCell = memo(
		({ header, width }: { header: any; width: number }) => (
			<div
				className='px-3 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer select-none hover:text-white flex-shrink-0 border-r border-gray-700/30 last:border-r-0'
				style={{ width: `${width}px` }}
				onClick={header.column.getToggleSortingHandler()}
			>
				<div className='flex items-center space-x-1 truncate'>
					<span className='truncate'>
						{flexRender(header.column.columnDef.header, header.getContext())}
					</span>
					{{
						asc: (
							<svg
								className='w-3 h-3 flex-shrink-0'
								fill='none'
								stroke='currentColor'
								viewBox='0 0 24 24'
							>
								<path
									strokeLinecap='round'
									strokeLinejoin='round'
									strokeWidth={2}
									d='M5 15l7-7 7 7'
								/>
							</svg>
						),
						desc: (
							<svg
								className='w-3 h-3 flex-shrink-0'
								fill='none'
								stroke='currentColor'
								viewBox='0 0 24 24'
							>
								<path
									strokeLinecap='round'
									strokeLinejoin='round'
									strokeWidth={2}
									d='M19 9l-7 7-7-7'
								/>
							</svg>
						),
					}[header.column.getIsSorted() as string] ?? null}
				</div>
			</div>
		)
	)

	// Компонент строки таблицы
	const TableRow = memo(
		({
			row,
			virtualRow,
			onClick,
		}: {
			row: any
			virtualRow: any
			onClick: () => void
		}) => {
			const cells = row.getVisibleCells()

			return (
				<div
					className='hover:bg-gray-800/30 transition-colors cursor-pointer absolute w-full flex border-b border-gray-800/50'
					style={{
						height: `${virtualRow.size}px`,
						transform: `translateY(${virtualRow.start}px)`,
					}}
					onClick={onClick}
				>
					{/* Код */}
					<div
						className='px-3 py-3 flex items-center flex-shrink-0 border-r border-gray-800/30'
						style={{ width: `${columnWidths.code}px` }}
					>
						<div className='font-mono text-sm text-gray-300 truncate w-full'>
							{flexRender(
								cells[0].column.columnDef.cell,
								cells[0].getContext()
							)}
						</div>
					</div>

					{/* Наименование */}
					<div
						className='px-3 py-3 flex items-center flex-shrink-0 border-r border-gray-800/30'
						style={{ width: `${columnWidths.name}px` }}
					>
						<div className='text-sm text-white truncate w-full'>
							{flexRender(
								cells[1].column.columnDef.cell,
								cells[1].getContext()
							)}
						</div>
					</div>

					{/* Класс */}
					<div
						className='px-3 py-3 flex items-center flex-shrink-0 border-r border-gray-800/30'
						style={{ width: `${columnWidths.className}px` }}
					>
						<div className='text-sm text-gray-300 truncate w-full'>
							{flexRender(
								cells[2].column.columnDef.cell,
								cells[2].getContext()
							)}
						</div>
					</div>

					{/* Инв. номер */}
					<div
						className='px-3 py-3 flex items-center flex-shrink-0'
						style={{ width: `${columnWidths.inventoryNumber}px` }}
					>
						<div className='font-mono text-xs text-gray-400 truncate w-full'>
							{flexRender(
								cells[3].column.columnDef.cell,
								cells[3].getContext()
							)}
						</div>
					</div>
				</div>
			)
		}
	)

	return (
		<div className='h-full flex flex-col'>
			{/* Панель управления (только поиск) */}
			<div className='p-4 border-b border-gray-700/50'>
				<div className='flex items-center'>
					<div className='relative flex-1'>
						<input
							type='text'
							placeholder='Поиск по таблице...'
							value={globalFilter ?? ''}
							onChange={e => setGlobalFilter(e.target.value)}
							className='w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 cursor-text'
						/>
						<svg
							className='absolute left-3 top-2.5 w-4 h-4 text-gray-500'
							fill='none'
							stroke='currentColor'
							viewBox='0 0 24 24'
						>
							<path
								strokeLinecap='round'
								strokeLinejoin='round'
								strokeWidth={2}
								d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z'
							/>
						</svg>
					</div>
				</div>
			</div>

			{/* Сообщение об ошибке */}
			{error && (
				<div className='m-4 p-4 bg-red-500/10 border border-red-500/30 rounded-lg'>
					<p className='text-red-300 text-sm'>{error}</p>
				</div>
			)}

			{/* Таблица с виртуализацией и кастомным скроллбаром */}
			<div
				ref={tableContainerRef}
				className='flex-1 overflow-auto relative table-scrollbar'
				style={{ height: 'calc(100vh - 220px)' }}
			>
				{/* Таблица с фиксированной шириной */}
				<div style={{ width: `${totalWidth}px`, minWidth: '100%' }}>
					{/* Заголовок таблицы */}
					<div className='sticky top-0 bg-gray-900/95 backdrop-blur-sm z-10 border-b border-gray-700/50'>
						<div className='flex'>
							{table.getHeaderGroups().map(headerGroup => (
								<React.Fragment key={headerGroup.id}>
									{headerGroup.headers.map(header => (
										<HeaderCell
											key={header.id}
											header={header}
											width={
												columnWidths[
													header.column.id as keyof typeof columnWidths
												]
											}
										/>
									))}
								</React.Fragment>
							))}
						</div>
					</div>

					{/* Тело таблицы с виртуализацией */}
					<div
						className='relative'
						style={{ height: `${rowVirtualizer.getTotalSize()}px` }}
					>
						{rowVirtualizer.getVirtualItems().map(virtualRow => {
							const row = rows[virtualRow.index]
							return (
								<TableRow
									key={row.id}
									row={row}
									virtualRow={virtualRow}
									onClick={() => {
										const modelCode =
											row.original.modelCode || row.original.code
										handleSelectEquipment(modelCode)
									}}
								/>
							)
						})}
					</div>
				</div>

				{/* Состояние загрузки */}
				{loading && (
					<div className='flex justify-center items-center py-12 absolute inset-0'>
						<div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500'></div>
					</div>
				)}

				{/* Сообщение при отсутствии данных */}
				{!loading && equipmentList.length === 0 && (
					<div className='flex flex-col items-center justify-center py-12 absolute inset-0'>
						<svg
							className='w-12 h-12 text-gray-600 mb-4'
							fill='none'
							stroke='currentColor'
							viewBox='0 0 24 24'
						>
							<path
								strokeLinecap='round'
								strokeLinejoin='round'
								strokeWidth={1.5}
								d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
							/>
						</svg>
						<p className='text-gray-400 cursor-default'>
							Нет данных для отображения
						</p>
					</div>
				)}
			</div>

			{/* Пагинация с обновленным текстом */}
			<div className='p-4 border-t border-gray-700/50 flex items-center justify-between'>
				<div className='text-sm text-gray-400 cursor-default'>
					{total > 0 ? `${start}-${end} из ${total}` : 'Нет данных'}
				</div>

				{pageCount > 1 && (
					<div className='flex items-center space-x-2'>
						<button
							onClick={() => table.setPageIndex(0)}
							disabled={!table.getCanPreviousPage()}
							className='px-3 py-1.5 rounded text-sm bg-gray-800 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed text-gray-300 hover:text-white transition-colors cursor-pointer'
							title='Первая страница'
						>
							«
						</button>

						<button
							onClick={() => table.previousPage()}
							disabled={!table.getCanPreviousPage()}
							className='px-3 py-1.5 rounded text-sm bg-gray-800 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed text-gray-300 hover:text-white transition-colors cursor-pointer'
							title='Предыдущая страница'
						>
							‹
						</button>

						<span className='text-sm text-gray-400 px-2 cursor-default'>
							{pageIndex + 1} / {pageCount}
						</span>

						<button
							onClick={() => table.nextPage()}
							disabled={!table.getCanNextPage()}
							className='px-3 py-1.5 rounded text-sm bg-gray-800 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed text-gray-300 hover:text-white transition-colors cursor-pointer'
							title='Следующая страница'
						>
							›
						</button>

						<button
							onClick={() => table.setPageIndex(pageCount - 1)}
							disabled={!table.getCanNextPage()}
							className='px-3 py-1.5 rounded text-sm bg-gray-800 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed text-gray-300 hover:text-white transition-colors cursor-pointer'
							title='Последняя страница'
						>
							»
						</button>

						<select
							value={pageSize}
							onChange={e => {
								const newSize = Number(e.target.value)
								table.setPageSize(newSize)
								// Сбрасываем на первую страницу при изменении размера
								table.setPageIndex(0)
							}}
							className='px-3 py-1.5 rounded text-sm bg-gray-800 border border-gray-700 text-gray-300 focus:outline-none focus:border-blue-500 cursor-pointer'
						>
							{[10, 20, 50].map(size => (
								<option key={size} value={size}>
									{size} на странице
								</option>
							))}
						</select>
					</div>
				)}
			</div>
		</div>
	)
}

UnifiedTableView.displayName = 'UnifiedTableView'

export default memo(UnifiedTableView)
