import React, { useCallback, useState } from 'react'

interface FileUploaderProps {
	onFileSelect: (file: File) => void
}

const FileUploader: React.FC<FileUploaderProps> = ({ onFileSelect }) => {
	const [isDragging, setIsDragging] = useState(false)

	const handleFileChange = useCallback(
		(event: React.ChangeEvent<HTMLInputElement>) => {
			const file = event.target.files?.[0]
			if (file && file.name.endsWith('.glb')) {
				onFileSelect(file)
			} else {
				alert('Пожалуйста, выберите файл формата .glb')
			}
		},
		[onFileSelect]
	)

	const handleDrop = useCallback(
		(event: React.DragEvent<HTMLDivElement>) => {
			event.preventDefault()
			setIsDragging(false)
			const file = event.dataTransfer.files?.[0]
			if (file && file.name.endsWith('.glb')) {
				onFileSelect(file)
			} else {
				alert('Пожалуйста, загрузите файл формата .glb')
			}
		},
		[onFileSelect]
	)

	const handleDragOver = useCallback(
		(event: React.DragEvent<HTMLDivElement>) => {
			event.preventDefault()
			setIsDragging(true)
		},
		[]
	)

	const handleDragLeave = useCallback(
		(event: React.DragEvent<HTMLDivElement>) => {
			event.preventDefault()
			setIsDragging(false)
		},
		[]
	)

	return (
		<div
			className={`relative w-full max-w-2xl mx-auto transition-all duration-300 ${
				isDragging ? 'scale-105' : 'scale-100'
			}`}
		>
			<div
				className={`border-3 border-dashed rounded-2xl p-12 text-center transition-all duration-300
          ${
						isDragging
							? 'border-primary-500 bg-primary-50 shadow-xl'
							: 'border-primary-300 bg-primary-50/50 hover:bg-primary-50 hover:shadow-lg'
					}`}
				onDrop={handleDrop}
				onDragOver={handleDragOver}
				onDragLeave={handleDragLeave}
			>
				<div className='flex flex-col items-center space-y-6'>
					<div
						className={`p-4 rounded-full transition-all duration-300 
            ${isDragging ? 'bg-primary-100 scale-110' : 'bg-white'}`}
					>
						<svg
							className={`w-16 h-16 transition-all duration-300 ${
								isDragging
									? 'text-primary-600 animate-float'
									: 'text-primary-500'
							}`}
							fill='none'
							stroke='currentColor'
							viewBox='0 0 24 24'
							xmlns='http://www.w3.org/2000/svg'
						>
							<path
								strokeLinecap='round'
								strokeLinejoin='round'
								strokeWidth='1.5'
								d='M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12'
							/>
						</svg>
					</div>

					<div className='space-y-3'>
						<h3 className='text-2xl font-bold text-gray-800'>
							{isDragging
								? 'Отпустите для загрузки'
								: 'Перетащите файл .glb сюда'}
						</h3>
						<p className='text-gray-600'>или</p>
					</div>

					<label className='btn-primary cursor-pointer px-6 py-3 text-lg'>
						Выберите файл на компьютере
						<input
							type='file'
							accept='.glb'
							onChange={handleFileChange}
							className='hidden'
						/>
					</label>

					<div className='space-y-2'>
						<p className='text-sm text-gray-500'>
							Поддерживаются только файлы в формате .glb (Binary GLTF)
						</p>
						<div className='flex items-center justify-center space-x-2 text-xs text-gray-400'>
							<svg className='w-4 h-4' fill='currentColor' viewBox='0 0 20 20'>
								<path
									fillRule='evenodd'
									d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z'
									clipRule='evenodd'
								/>
							</svg>
							<span>3D модели</span>
							<span>•</span>
							<svg className='w-4 h-4' fill='currentColor' viewBox='0 0 20 20'>
								<path
									fillRule='evenodd'
									d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z'
									clipRule='evenodd'
								/>
							</svg>
							<span>Текстуры</span>
							<span>•</span>
							<svg className='w-4 h-4' fill='currentColor' viewBox='0 0 20 20'>
								<path
									fillRule='evenodd'
									d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z'
									clipRule='evenodd'
								/>
							</svg>
							<span>Анимации</span>
						</div>
					</div>
				</div>
			</div>

			{isDragging && (
				<div className='absolute inset-0 flex items-center justify-center'>
					<div className='bg-black/80 text-white px-4 py-2 rounded-lg animate-pulse-slow'>
						Отпустите для загрузки файла
					</div>
				</div>
			)}
		</div>
	)
}

export default FileUploader
