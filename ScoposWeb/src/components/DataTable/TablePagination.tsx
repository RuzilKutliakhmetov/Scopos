import type { Table } from '@tanstack/react-table'
import React, { memo } from 'react'
import type { EquipmentItem } from '../../types/api'

interface TablePaginationProps {
	table: Table<EquipmentItem>
}

const TablePaginationComponent: React.FC<TablePaginationProps> = ({
	table,
}) => {
	const state = table.getState()
	const pageCount = table.getPageCount()
	const currentPage = state.pagination.pageIndex + 1
	const pageSize = state.pagination.pageSize
	const totalRows = table.getFilteredRowModel().rows.length
	const startRow = currentPage * pageSize - pageSize + 1
	const endRow = Math.min(currentPage * pageSize, totalRows)

	if (totalRows === 0) return null

	return (
		<div className='p-4 border-t border-gray-700/50 flex items-center justify-between'>
			<div className='text-sm text-gray-400 cursor-default'>
				{totalRows > 0
					? `Показано ${startRow}-${endRow} из ${totalRows} записей`
					: 'Нет данных'}
			</div>

			{pageCount > 1 && (
				<div className='flex items-center space-x-2'>
					<button
						onClick={() => table.firstPage()}
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
						{currentPage} / {pageCount}
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
						onClick={() => table.lastPage()}
						disabled={!table.getCanNextPage()}
						className='px-3 py-1.5 rounded text-sm bg-gray-800 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed text-gray-300 hover:text-white transition-colors cursor-pointer'
						title='Последняя страница'
					>
						»
					</button>

					<select
						value={pageSize}
						onChange={e => {
							table.setPageSize(Number(e.target.value))
						}}
						className='px-3 py-1.5 rounded text-sm bg-gray-800 border border-gray-700 text-gray-300 focus:outline-none focus:border-blue-500 cursor-pointer'
					>
						{[10, 20, 50].map(size => (
							<option key={size} value={size}>
								{size} строк
							</option>
						))}
					</select>
				</div>
			)}
		</div>
	)
}

TablePaginationComponent.displayName = 'TablePagination'

export default memo(TablePaginationComponent)
