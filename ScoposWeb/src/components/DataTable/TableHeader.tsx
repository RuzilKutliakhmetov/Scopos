import React, { memo } from 'react'

interface TableHeaderProps {
	title: string
	subtitle: string
	onClose: () => void
}

const TableHeaderComponent: React.FC<TableHeaderProps> = ({
	title,
	subtitle,
	onClose,
}) => {
	return (
		<div className='flex items-center justify-between p-4 border-b border-gray-700/50 bg-gray-900'>
			<div>
				<h2 className='text-lg font-bold text-white cursor-default'>{title}</h2>
				{subtitle && (
					<p className='text-xs text-gray-400 mt-1 cursor-default'>
						{subtitle}
					</p>
				)}
			</div>
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
	)
}

TableHeaderComponent.displayName = 'TableHeader'

export default memo(TableHeaderComponent)
