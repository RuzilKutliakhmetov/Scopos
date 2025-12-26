import type { Table } from '@tanstack/react-table'
import { flexRender } from '@tanstack/react-table'
import { useVirtualizer } from '@tanstack/react-virtual'
import React, { memo, useRef } from 'react'
import type { EquipmentItem } from '../../types/api'

interface FixedGridTableProps {
	table: Table<EquipmentItem>
	loading: boolean
	equipmentList: EquipmentItem[]
	onSelectEquipment: (modelCode: string) => void
}

const FixedGridTableComponent: React.FC<FixedGridTableProps> = ({
	table,
	loading,
	equipmentList,
	onSelectEquipment,
}) => {
	const tableContainerRef = useRef<HTMLDivElement>(null)

	// Используем ВИРТУАЛИЗОВАННЫЕ строки для отображения
	const { rows } = table.getRowModel()

	const rowVirtualizer = useVirtualizer({
		count: rows.length,
		getScrollElement: () => tableContainerRef.current,
		estimateSize: () => 48, // высота строки
		overscan: 5,
	})

	// Уменьшенные размеры столбцов (в пикселях)
	const columnWidths = {
		code: 120, // Код - уменьшено
		name: 200, // Наименование - уменьшено
		className: 120, // Класс - уменьшено
		manufacturer: 140, // Производитель
		inventoryNumber: 100, // Инв. номер - уменьшено
	}

	const totalWidth = Object.values(columnWidths).reduce((a, b) => a + b, 0)

	return (
		<div
			ref={tableContainerRef}
			className='flex-1 overflow-auto relative'
			style={{ height: 'calc(100vh - 200px)' }}
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
								columnWidths={columnWidths}
								onClick={() => {
									const modelCode = row.original.modelCode || row.original.code
									onSelectEquipment(modelCode)
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
	)
}

const HeaderCell: React.FC<{ header: any; width: number }> = memo(
	({ header, width }) => (
		<div
			className='px-3 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer select-none hover:text-white flex-shrink-0 border-r border-gray-700/30 last:border-r-0'
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

const TableRow: React.FC<{
	row: any
	virtualRow: any
	columnWidths: Record<string, number>
	onClick: () => void
}> = memo(({ row, virtualRow, columnWidths, onClick }) => {
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
				className='px-3 py-2 flex items-center flex-shrink-0 border-r border-gray-800/30'
				style={{ width: `${columnWidths.code}px` }}
			>
				<div className='font-mono text-sm text-gray-300 truncate w-full'>
					{flexRender(cells[0].column.columnDef.cell, cells[0].getContext())}
				</div>
			</div>

			{/* Наименование */}
			<div
				className='px-3 py-2 flex items-center flex-shrink-0 border-r border-gray-800/30'
				style={{ width: `${columnWidths.name}px` }}
			>
				<div className='text-sm text-white truncate w-full'>
					{flexRender(cells[1].column.columnDef.cell, cells[1].getContext())}
				</div>
			</div>

			{/* Класс */}
			<div
				className='px-3 py-2 flex items-center flex-shrink-0 border-r border-gray-800/30'
				style={{ width: `${columnWidths.className}px` }}
			>
				<div className='text-sm text-gray-300 truncate w-full'>
					{flexRender(cells[2].column.columnDef.cell, cells[2].getContext())}
				</div>
			</div>

			{/* Производитель */}
			<div
				className='px-3 py-2 flex items-center flex-shrink-0 border-r border-gray-800/30'
				style={{ width: `${columnWidths.manufacturer}px` }}
			>
				<div className='text-sm text-gray-300 truncate w-full'>
					{flexRender(cells[3].column.columnDef.cell, cells[3].getContext())}
				</div>
			</div>

			{/* Инв. номер */}
			<div
				className='px-3 py-2 flex items-center flex-shrink-0'
				style={{ width: `${columnWidths.inventoryNumber}px` }}
			>
				<div className='font-mono text-xs text-gray-400 truncate w-full'>
					{flexRender(cells[4].column.columnDef.cell, cells[4].getContext())}
				</div>
			</div>
		</div>
	)
})

FixedGridTableComponent.displayName = 'FixedGridTable'

export default memo(FixedGridTableComponent)
