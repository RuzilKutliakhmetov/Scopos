import type { Table } from '@tanstack/react-table'
import { flexRender } from '@tanstack/react-table'
import { useVirtualizer } from '@tanstack/react-virtual'
import React, { memo, useRef } from 'react'
import type { EquipmentItem } from '../../types/api'

interface VirtualizedTableProps {
	table: Table<EquipmentItem>
	loading: boolean
	equipmentList: EquipmentItem[]
	onSelectEquipment: (modelCode: string) => void
}

const VirtualizedTableComponent: React.FC<VirtualizedTableProps> = ({
	table,
	loading,
	equipmentList,
	onSelectEquipment,
}) => {
	const tableContainerRef = useRef<HTMLDivElement>(null)
	const { rows } = table.getRowModel()

	const rowVirtualizer = useVirtualizer({
		count: rows.length,
		getScrollElement: () => tableContainerRef.current,
		estimateSize: () => 48,
		overscan: 10,
	})

	return (
		<div
			ref={tableContainerRef}
			className='flex-1 overflow-auto relative'
			style={{ height: 'calc(100vh - 200px)' }}
		>
			<table className='w-full table-fixed'>
				<thead className='sticky top-0 bg-gray-900/95 backdrop-blur-sm z-10'>
					{table.getHeaderGroups().map(headerGroup => (
						<tr key={headerGroup.id}>
							{headerGroup.headers.map(header => (
								<HeaderCell key={header.id} header={header} />
							))}
						</tr>
					))}
				</thead>
				<tbody
					className='divide-y divide-gray-800/50 relative'
					style={{ height: `${rowVirtualizer.getTotalSize()}px` }}
				>
					{rowVirtualizer.getVirtualItems().map(virtualRow => {
						const row = rows[virtualRow.index]
						return (
							<TableRow
								key={row.id}
								row={row}
								virtualRow={virtualRow}
								onClick={() =>
									onSelectEquipment(row.original.modelCode || row.original.code)
								}
							/>
						)
					})}
				</tbody>
			</table>

			{loading && <LoadingSpinner />}

			{!loading && equipmentList.length === 0 && <EmptyState />}
		</div>
	)
}

const HeaderCell: React.FC<{ header: any }> = memo(({ header }) => {
	const columnId = header.column.id
	const getColumnWidth = () => {
		switch (columnId) {
			case 'code':
				return 'w-32' // 8rem (128px)
			case 'name':
				return 'w-1/3' // 33%
			case 'className':
				return 'w-32' // 8rem (128px)
			case 'manufacturer':
				return 'w-32' // 8rem (128px)
			case 'inventoryNumber':
				return 'w-32' // 8rem (128px)
			default:
				return ''
		}
	}

	return (
		<th
			className={`px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider border-b border-gray-700/50 cursor-pointer select-none hover:text-white ${getColumnWidth()}`}
			onClick={header.column.getToggleSortingHandler()}
		>
			<div className='flex items-center space-x-1 truncate'>
				<span className='truncate'>
					{flexRender(header.column.columnDef.header, header.getContext())}
				</span>
				{{
					asc: (
						<svg
							className='w-4 h-4 flex-shrink-0'
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
							className='w-4 h-4 flex-shrink-0'
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
		</th>
	)
})

const TableRow: React.FC<{
	row: any
	virtualRow: any
	onClick: () => void
}> = memo(({ row, virtualRow, onClick }) => {
	const cells = row.getVisibleCells()

	return (
		<tr
			className='hover:bg-gray-800/30 transition-colors cursor-pointer absolute w-full'
			style={{
				height: `${virtualRow.size}px`,
				transform: `translateY(${virtualRow.start}px)`,
			}}
			onClick={onClick}
		>
			{/* Код */}
			<td key={cells[0].id} className='px-4 py-3 text-sm w-32 truncate'>
				<div className='font-mono text-gray-300 truncate'>
					{flexRender(cells[0].column.columnDef.cell, cells[0].getContext())}
				</div>
			</td>

			{/* Наименование */}
			<td key={cells[1].id} className='px-4 py-3 text-sm w-1/3 truncate'>
				<div className='font-medium text-white truncate'>
					{flexRender(cells[1].column.columnDef.cell, cells[1].getContext())}
				</div>
			</td>

			{/* Класс */}
			<td key={cells[2].id} className='px-4 py-3 text-sm w-32 truncate'>
				<div className='text-gray-300 truncate'>
					{flexRender(cells[2].column.columnDef.cell, cells[2].getContext())}
				</div>
			</td>

			{/* Производитель */}
			<td key={cells[3].id} className='px-4 py-3 text-sm w-32 truncate'>
				<div className='text-gray-300 truncate'>
					{flexRender(cells[3].column.columnDef.cell, cells[3].getContext())}
				</div>
			</td>

			{/* Инв. номер */}
			<td key={cells[4].id} className='px-4 py-3 text-sm w-32 truncate'>
				<div className='font-mono text-xs text-gray-400 truncate'>
					{flexRender(cells[4].column.columnDef.cell, cells[4].getContext())}
				</div>
			</td>
		</tr>
	)
})

const LoadingSpinner: React.FC = memo(() => (
	<div className='flex justify-center items-center py-12 absolute inset-0'>
		<div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500'></div>
	</div>
))

const EmptyState: React.FC = memo(() => (
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
		<p className='text-gray-400 cursor-default'>Нет данных для отображения</p>
	</div>
))

VirtualizedTableComponent.displayName = 'VirtualizedTable'

export default memo(VirtualizedTableComponent)
