import React, { memo, useEffect } from 'react'
import { useEquipmentFilter } from '../context/EquipmentFilterContext'

interface ToolbarProps {
	onResetCamera: () => void
	onPipelineToggle: () => void
	onBackgroundToggle: () => void
	onOpenTable: () => void
	isPipelineMode: boolean
	showBackground: boolean
	isTableOpen?: boolean
}

const ToolbarComponent: React.FC<ToolbarProps> = ({
	onResetCamera,
	onPipelineToggle,
	onBackgroundToggle,
	onOpenTable,
	isPipelineMode,
	showBackground,
	isTableOpen = false,
}) => {
	const { filterMode, filterCodes, isLoading, setFilterMode } =
		useEquipmentFilter()

	useEffect(() => {
		const handleKeyPress = (e: KeyboardEvent) => {
			if (e.ctrlKey || e.metaKey) {
				switch (e.key.toLowerCase()) {
					case 'r':
						e.preventDefault()
						onResetCamera()
						break
					case 'p':
						e.preventDefault()
						onPipelineToggle()
						break
					case 'b':
						e.preventDefault()
						if (!isPipelineMode) onBackgroundToggle()
						break
					case 't':
						e.preventDefault()
						if (!isTableOpen) onOpenTable()
						break
					case 'o':
						e.preventDefault()
						setFilterMode('overdue')
						break
					case 'd':
						e.preventDefault()
						setFilterMode('defective')
						break
					case '?':
						e.preventDefault()
						break
				}
			}
		}

		window.addEventListener('keydown', handleKeyPress)
		return () => window.removeEventListener('keydown', handleKeyPress)
	}, [
		onResetCamera,
		onPipelineToggle,
		onBackgroundToggle,
		onOpenTable,
		isPipelineMode,
		isTableOpen,
		setFilterMode,
	])

	const ToolbarButton = React.memo(
		({
			onClick,
			title,
			icon,
			active = false,
			disabled = false,
			shortcut,
			loading = false,
			badgeCount = 0,
			isFilterButton = false,
		}: {
			onClick: () => void
			title: string
			icon: React.ReactNode
			active?: boolean
			disabled?: boolean
			shortcut?: string
			loading?: boolean
			badgeCount?: number
			isFilterButton?: boolean
		}) => {
			// Определяем цвет активной кнопки
			const getActiveColorClass = () => {
				if (isFilterButton && filterMode) {
					return filterMode === 'overdue'
						? 'bg-red-600/80 text-white'
						: 'bg-orange-600/80 text-white'
				}
				// Синий цвет для обычных активных кнопок
				return 'bg-blue-600 text-white'
			}

			return (
				<button
					onClick={onClick}
					disabled={disabled || loading}
					className={`p-3 rounded-lg transition-all duration-200 group relative cursor-pointer ${
						active
							? getActiveColorClass()
							: disabled || loading
							? 'opacity-50 cursor-not-allowed bg-gray-800'
							: 'bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white'
					}`}
					title={`${title} ${shortcut ? `(${shortcut})` : ''}`}
				>
					{loading ? (
						<div className='w-5 h-5 border-2 border-gray-300 border-t-transparent rounded-full animate-spin'></div>
					) : (
						<>
							{icon}
							{badgeCount > 0 && (
								<span
									className={`absolute -top-1 -right-1 text-xs rounded-full w-5 h-5 flex items-center justify-center ${
										filterMode === 'overdue'
											? 'bg-red-500 text-white'
											: 'bg-orange-500 text-white'
									}`}
								>
									{badgeCount > 99 ? '99+' : badgeCount}
								</span>
							)}
						</>
					)}
					<span className='absolute -bottom-8 left-1/2 transform -translate-x-1/2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-50 pointer-events-none'>
						{title}{' '}
						{shortcut && <span className='text-gray-400 ml-1'>{shortcut}</span>}
					</span>
				</button>
			)
		}
	)

	return (
		<>
			{/* Main toolbar */}
			<div className='fixed top-6 left-1/2 transform -translate-x-1/2 z-50'>
				<div className='flex items-center space-x-2 bg-gray-900/80 backdrop-blur-sm rounded-xl border border-gray-700/50 p-2'>
					<ToolbarButton
						onClick={onPipelineToggle}
						title={isPipelineMode ? 'Все объекты' : 'Только трубопроводы'}
						icon={
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
									d='M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'
								/>
							</svg>
						}
						active={isPipelineMode}
						shortcut='Ctrl+P'
					/>

					<div className='h-6 w-px bg-gray-700' />

					<ToolbarButton
						onClick={onBackgroundToggle}
						title={showBackground ? 'Выключить фон' : 'Включить фон'}
						icon={
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
									d='M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z'
								/>
							</svg>
						}
						active={showBackground}
						disabled={isPipelineMode}
						shortcut='Ctrl+B'
					/>

					<div className='h-6 w-px bg-gray-700' />

					{/* Кнопки для фильтрации оборудования */}
					<ToolbarButton
						onClick={() => setFilterMode('overdue')}
						title={
							filterMode === 'overdue'
								? 'Сбросить просроченные'
								: `Показать просроченные (${filterCodes.size})`
						}
						icon={
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
									d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z'
								/>
							</svg>
						}
						active={filterMode === 'overdue'}
						loading={isLoading && filterMode === 'overdue'}
						badgeCount={filterMode === 'overdue' ? filterCodes.size : 0}
						shortcut='Ctrl+O'
						isFilterButton={true}
					/>

					<ToolbarButton
						onClick={() => setFilterMode('defective')}
						title={
							filterMode === 'defective'
								? 'Сбросить дефектные'
								: `Показать дефектные (${filterCodes.size})`
						}
						icon={
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
									d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.998-.833-2.732 0L4.346 16.5c-.77.833.192 2.5 1.732 2.5z'
								/>
							</svg>
						}
						active={filterMode === 'defective'}
						loading={isLoading && filterMode === 'defective'}
						badgeCount={filterMode === 'defective' ? filterCodes.size : 0}
						shortcut='Ctrl+D'
						isFilterButton={true}
					/>

					<div className='h-6 w-px bg-gray-700' />

					<ToolbarButton
						onClick={onResetCamera}
						title='Сбросить камеру'
						icon={
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
									d='M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15'
								/>
							</svg>
						}
						shortcut='Ctrl+R'
					/>
				</div>
			</div>

			{/* Table button - скрываем при открытой таблице */}
			{!isTableOpen && (
				<div className='fixed top-6 right-6 z-50'>
					<ToolbarButton
						onClick={onOpenTable}
						title='Открыть таблицу данных'
						icon={
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
									d='M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2'
								/>
							</svg>
						}
						shortcut='Ctrl+T'
					/>
				</div>
			)}
		</>
	)
}

ToolbarComponent.displayName = 'Toolbar'

const Toolbar = memo(ToolbarComponent)

export default Toolbar
