import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
// import './index.css'

// Для разработки - добавляем мок-данные
import { useModelStore } from './hooks/useModelStore.ts'

// Инициализация мок-данными (удалить в продакшене)
const initializeMockData = () => {
	const store = useModelStore.getState()
	store.setCurrentModel({
		name: 'Магистральный трубопровод №5',
		description: 'Участок нефтепровода с запорной арматурой',
		createdAt: '2024-01-15',
		lastModified: '2024-03-20',
		components: [
			{
				id: 'pipe_1',
				name: 'Труба DN300',
				type: 'pipe',
				diameter: 300,
				pressure: 40,
				material: 'Сталь 20',
				position: [0, 0, 0],
				rotation: [0, 0, 0],
			},
			{
				id: 'valve_1',
				name: 'Задвижка 300мм',
				type: 'valve',
				diameter: 300,
				pressure: 40,
				material: 'Чугун',
				position: [5, 0, 0],
				rotation: [0, 0, 0],
			},
		],
		sapProjectId: 'PRJ-2024-005',
	})
}

// Вызываем инициализацию
initializeMockData()

ReactDOM.createRoot(document.getElementById('root')!).render(
	<React.StrictMode>
		<App />
	</React.StrictMode>
)
