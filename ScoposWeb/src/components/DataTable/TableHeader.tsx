import React, { memo } from 'react'
import { useEquipmentFilter } from '../../context/EquipmentFilterContext'

interface TableHeaderProps {
	title: string
	subtitle?: string
	onClose: () => void
}

const TableHeaderComponent: React.FC<TableHeaderProps> = ({
	title,
	subtitle,
	onClose,
}) => {
	const { filterMode, filterCodes } = useEquipmentFilter()

	return (
		<div className='flex items-center justify-between p-4 border-b border-gray-700/50 bg-gray-900'>
			<div className='flex items-center space-x-3'>
				<h2 className='text-lg font-bold text-white cursor-default'>{title}</h2>

				{/* Бейдж фильтра */}
				{filterMode && (
					<div
						className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
							filterMode === 'overdue'
								? 'bg-red-500/20 text-red-300 border border-red-500/30'
								: 'bg-orange-500/20 text-orange-300 border border-orange-500/30'
						}`}
					>
						<svg
							className={`w-3 h-3 mr-1 ${
								filterMode === 'overdue' ? 'text-red-400' : 'text-orange-400'
							}`}
							fill='none'
							stroke='currentColor'
							viewBox='0 0 24 24'
						>
							<path
								strokeLinecap='round'
								strokeLinejoin='round'
								strokeWidth={2}
								d={
									filterMode === 'overdue'
										? 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z'
										: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.998-.833-2.732 0L4.346 16.5c-.77.833.192 2.5 1.732 2.5z'
								}
							/>
						</svg>
						{filterMode === 'overdue' ? 'Просроченные' : 'Дефектные'}
						<span className='ml-1 text-gray-400'>({filterCodes.size})</span>
					</div>
				)}
			</div>

			<div className='flex items-center space-x-2'>
				{subtitle && !filterMode && (
					<p className='text-xs text-gray-400 mr-3 cursor-default'>
						{subtitle}
					</p>
				)}

				<button
					onClick={onClose}
					className='p-2 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white transition-colors cursor-pointer'
					title='Закрыть таблицу'
				>
					<svg
						className='w-5 h-5'
						fill='none'
						stroke='currentColor'
						viewBox='0 0 24 24'
					>
						<path
							strokeLinecap='round'
							strokeLinejoin='round'
							strokeWidth={2}
							d='M6 18L18 6M6 6l12 12'
						/>
					</svg>
				</button>
			</div>
		</div>
	)
}

TableHeaderComponent.displayName = 'TableHeader'

export default memo(TableHeaderComponent)
