import React from 'react'
import { LAYERS } from '../../config/layers'

interface DebugPanelProps {
	camera: any
	currentLayerMask: number
	isPipelineMode: boolean
	showBackground: boolean
}

const DebugPanel: React.FC<DebugPanelProps> = ({
	camera,
	currentLayerMask,
	isPipelineMode,
	showBackground,
}) => {
	if (!camera) return null

	return (
		<div className='fixed bottom-4 right-4 z-50 bg-gray-900/90 text-white p-4 rounded-lg shadow-xl max-w-sm'>
			<h3 className='font-bold mb-3 text-lg'>🐛 Отладка слоев</h3>

			<div className='space-y-3'>
				{/* Статус камеры */}
				<div>
					<div className='text-sm font-semibold mb-1'>Камера:</div>
					<div className='text-xs font-mono'>
						Позиция: [{camera.position?.x?.toFixed(1) || 'N/A'},
						{camera.position?.y?.toFixed(1) || 'N/A'},
						{camera.position?.z?.toFixed(1) || 'N/A'}]
					</div>
					<div className='text-xs font-mono'>
						Маска слоев: {currentLayerMask.toString(2).padStart(3, '0')}
					</div>
				</div>

				{/* Состояние UI */}
				<div>
					<div className='text-sm font-semibold mb-1'>Состояние UI:</div>
					<div className='flex items-center space-x-2'>
						<div
							className={`w-3 h-3 rounded-full ${
								isPipelineMode ? 'bg-green-500' : 'bg-red-500'
							}`}
						></div>
						<span className='text-xs'>
							Режим трубопроводов: {isPipelineMode ? 'ВКЛ' : 'ВЫКЛ'}
						</span>
					</div>
					<div className='flex items-center space-x-2'>
						<div
							className={`w-3 h-3 rounded-full ${
								showBackground ? 'bg-green-500' : 'bg-red-500'
							}`}
						></div>
						<span className='text-xs'>
							Фон: {showBackground ? 'ВКЛ' : 'ВЫКЛ'}
						</span>
					</div>
				</div>

				{/* Слои камеры */}
				<div>
					<div className='text-sm font-semibold mb-1'>Слои камеры:</div>
					<div className='space-y-1'>
						{Object.entries(LAYERS).map(([name, layer]) => {
							const isEnabled = camera.layers?.isEnabled?.(layer) || false
							return (
								<div key={name} className='flex items-center justify-between'>
									<span className='text-xs'>{name}:</span>
									<div
										className={`px-2 py-1 rounded text-xs ${
											isEnabled ? 'bg-green-600' : 'bg-red-600'
										}`}
									>
										{isEnabled ? '✓' : '✗'}
									</div>
								</div>
							)
						})}
					</div>
				</div>

				{/* Тестовые кнопки */}
				<div className='pt-2 border-t border-gray-700'>
					<div className='text-sm font-semibold mb-2'>Тесты:</div>
					<div className='flex flex-wrap gap-2'>
						<button
							onClick={() => {
								const event = new CustomEvent('toggle-layers', {
									detail: { pipelineMode: true, showBackground: false },
								})
								window.dispatchEvent(event)
								console.log('Тест: Включен режим трубопроводов')
							}}
							className='px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-xs'
						>
							Тест: Только трубы
						</button>
						<button
							onClick={() => {
								const event = new CustomEvent('toggle-layers', {
									detail: { pipelineMode: false, showBackground: true },
								})
								window.dispatchEvent(event)
								console.log('Тест: Все объекты с фоном')
							}}
							className='px-3 py-1 bg-green-600 hover:bg-green-700 rounded text-xs'
						>
							Тест: Все + фон
						</button>
						<button
							onClick={() => {
								const event = new CustomEvent('toggle-layers', {
									detail: { pipelineMode: false, showBackground: false },
								})
								window.dispatchEvent(event)
								console.log('Тест: Все без фона')
							}}
							className='px-3 py-1 bg-yellow-600 hover:bg-yellow-700 rounded text-xs'
						>
							Тест: Все - фон
						</button>
					</div>
				</div>
			</div>
		</div>
	)
}

export default DebugPanel
