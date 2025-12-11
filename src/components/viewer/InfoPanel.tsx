import { useModelStore } from '../../hooks/useModelStore'
import './InfoPanel.css'

export default function InfoPanel() {
	const { selectedComponent, currentModel, viewMode, setViewMode } =
		useModelStore()

	return (
		<div className='info-panel'>
			<div className='panel-header'>
				<h3>PipeVision Viewer</h3>
				<div className='view-mode-selector'>
					<button
						className={viewMode === 'solid' ? 'active' : ''}
						onClick={() => setViewMode('solid')}
					>
						Сетка
					</button>
					<button
						className={viewMode === 'wireframe' ? 'active' : ''}
						onClick={() => setViewMode('wireframe')}
					>
						Каркас
					</button>
					<button
						className={viewMode === 'xray' ? 'active' : ''}
						onClick={() => setViewMode('xray')}
					>
						Рентген
					</button>
				</div>
			</div>

			{selectedComponent ? (
				<div className='component-info'>
					<h4>Выбранный компонент</h4>
					<div className='info-grid'>
						<div className='info-row'>
							<span className='label'>Название:</span>
							<span className='value'>{selectedComponent.name}</span>
						</div>
						<div className='info-row'>
							<span className='label'>Тип:</span>
							<span className='value'>{selectedComponent.type}</span>
						</div>
						<div className='info-row'>
							<span className='label'>Диаметр (DN):</span>
							<span className='value'>{selectedComponent.diameter} мм</span>
						</div>
						<div className='info-row'>
							<span className='label'>Давление (PN):</span>
							<span className='value'>{selectedComponent.pressure} бар</span>
						</div>
						<div className='info-row'>
							<span className='label'>Материал:</span>
							<span className='value'>{selectedComponent.material}</span>
						</div>
						{selectedComponent.sapEquipmentId && (
							<div className='info-row'>
								<span className='label'>SAP ID:</span>
								<span className='value sap-id'>
									{selectedComponent.sapEquipmentId}
								</span>
							</div>
						)}
					</div>

					<div className='actions'>
						<button className='btn-primary'>Показать в SAP</button>
						<button className='btn-secondary'>История ремонтов</button>
					</div>
				</div>
			) : (
				<div className='no-selection'>
					<p>👈 Кликните на любой компонент модели для просмотра информации</p>
					<div className='instructions'>
						<h5>Управление:</h5>
						<ul>
							<li>ЛКМ + движение — вращение</li>
							<li>ПКМ + движение — панорамирование</li>
							<li>Колесо мыши — масштабирование</li>
							<li>Клик по объекту — выделение</li>
						</ul>
					</div>
				</div>
			)}

			{currentModel && (
				<div className='model-info'>
					<h5>Модель: {currentModel.name}</h5>
					<p>{currentModel.description}</p>
					<small>Обновлено: {currentModel.lastModified}</small>
				</div>
			)}
		</div>
	)
}
