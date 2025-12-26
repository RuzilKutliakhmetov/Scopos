import React, { memo } from 'react'

interface TableControlsProps {
	globalFilter: string
	onGlobalFilterChange: (value: string) => void
	onRefresh: () => void
	loading: boolean
}

const TableControlsComponent: React.FC<TableControlsProps> = ({
	globalFilter,
	onGlobalFilterChange,
	onRefresh,
	loading,
}) => {
	return (
		<div className='p-4 border-b border-gray-700/50'>
			<div className='flex items-center justify-between'>
				<div className='flex items-center space-x-4'>
					{/* Поиск */}
					<div className='relative'>
						<input
							type='text'
							placeholder='Поиск...'
							value={globalFilter}
							onChange={e => onGlobalFilterChange(e.target.value)}
							className='pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 cursor-text'
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

					{/* Кнопка обновления */}
					<button
						onClick={onRefresh}
						className='px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-colors flex items-center cursor-pointer'
						disabled={loading}
					>
						{loading ? (
							<>
								<div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2'></div>
								Загрузка...
							</>
						) : (
							<>
								<svg
									className='w-4 h-4 mr-2'
									fill='none'
									stroke='currentColor'
									viewBox='0 0 24 24'
								>
									<path
										strokeLinecap='round'
										strokeLinejoin='round'
										strokeWidth={2}
										d='M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15'
									/>
								</svg>
								Обновить
							</>
						)}
					</button>
				</div>
			</div>
		</div>
	)
}

TableControlsComponent.displayName = 'TableControls'

export default memo(TableControlsComponent)
