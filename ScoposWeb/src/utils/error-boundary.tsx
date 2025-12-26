import React from 'react'

interface Props {
	children: React.ReactNode
	fallback?: React.ReactNode
}

interface State {
	hasError: boolean
	error?: Error
}

export class ErrorBoundary extends React.Component<Props, State> {
	constructor(props: Props) {
		super(props)
		this.state = { hasError: false }
	}

	static getDerivedStateFromError(error: Error): State {
		return { hasError: true, error }
	}

	componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
		console.error('3D Viewer Error:', error)
		console.error('Error Info:', errorInfo)
	}

	render() {
		if (this.state.hasError) {
			return (
				this.props.fallback || (
					<div className='p-4 bg-red-900/50 border border-red-700 rounded-lg'>
						<h3 className='text-lg font-semibold text-red-300 mb-2'>
							Ошибка рендеринга 3D
						</h3>
						<p className='text-red-400 text-sm'>
							{this.state.error?.message ||
								'Произошла ошибка при отображении сцены'}
						</p>
						<button
							onClick={() => this.setState({ hasError: false })}
							className='mt-3 px-4 py-2 bg-red-700 hover:bg-red-600 text-white rounded text-sm'
						>
							Попробовать снова
						</button>
					</div>
				)
			)
		}

		return this.props.children
	}
}
