import './App.css'
import InfoPanel from './components/viewer/InfoPanel'
import Scene from './components/viewer/Scene'

function App() {
	return (
		<div className='app'>
			<Scene />
			<InfoPanel />

			{/* Загрузчик моделей (можно сделать кнопкой) */}
			<div className='model-loader-container'>
				<button
					className='load-model-btn'
					onClick={() => {
						// Здесь будет логика загрузки модели
						console.log('Загрузка модели...')
					}}
				>
					📁 Загрузить модель
				</button>
			</div>

			{/* Статус-бар внизу */}
			<div className='status-bar'>
				<div className='status-item'>
					<span className='status-dot online'></span>
					<span>Готов</span>
				</div>
				<div className='status-item'>
					<span>Модель: pipeline.glb</span>
				</div>
				<div className='status-item'>
					<span>Triangles: ~50k</span>
				</div>
			</div>
		</div>
	)
}

export default App
