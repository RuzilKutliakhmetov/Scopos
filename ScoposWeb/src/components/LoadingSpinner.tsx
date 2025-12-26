import React from 'react'
import { VIEWER_CONFIG } from '../config/viewerConfig'

interface LoadingSpinnerProps {
	progress: number
	message?: string
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
	progress,
	message = 'Загрузка модели',
}) => {
	return (
		<div
			className='w-screen h-screen flex flex-col items-center justify-center'
			style={{ backgroundColor: VIEWER_CONFIG.ui.loadingBgColor }}
		>
			<div className='relative'>
				<div className='relative w-32 h-32'>
					<div className='absolute inset-0 rounded-full border-8 border-gray-700 cursor-default' />
					<div
						className='absolute inset-0 rounded-full border-8 border-blue-500 border-t-transparent border-r-transparent transition-all duration-300'
						style={{ transform: `rotate(${progress * 3.6}deg)` }}
					/>
					<div className='absolute inset-4 rounded-full bg-gray-800 flex items-center justify-center'>
						<span className='text-2xl font-bold text-white cursor-default'>
							{progress.toFixed(0)}%
						</span>
					</div>
				</div>
			</div>

			<div className='mt-8 text-center space-y-2'>
				<p className='text-xl font-semibold text-white cursor-default'>
					{message}
				</p>
				<p className='text-gray-300 cursor-default'>
					{VIEWER_CONFIG.model.name}
				</p>
				<div className='w-64 h-2 bg-gray-700 rounded-full overflow-hidden mt-4 cursor-default'>
					<div
						className='h-full bg-blue-500 transition-all duration-300'
						style={{ width: `${progress}%` }}
					/>
				</div>
			</div>
		</div>
	)
}

export default LoadingSpinner
