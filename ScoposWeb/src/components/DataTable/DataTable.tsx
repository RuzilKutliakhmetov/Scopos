import React, { memo, useCallback, useEffect, useRef, useState } from 'react'
import { useEquipmentFilter } from '../../context/EquipmentFilterContext'
import { emitCustomEvent, useCustomEvent } from '../../hooks/useCustomEvent'
import type { EquipmentDetails, EquipmentItem } from '../../types/api'
import EquipmentDetailsView from './EquipmentDetailsView'
import TableHeader from './TableHeader'
import UnifiedTableView from './UnifiedTableView'

interface DataTableProps {
	isOpen: boolean
	onClose: () => void
	selectedObjectCode?: string
}

const DataTableComponent: React.FC<DataTableProps> = ({
	isOpen,
	onClose,
	selectedObjectCode,
}) => {
	const [equipmentList, setEquipmentList] = useState<EquipmentItem[]>([])
	const [selectedEquipment, setSelectedEquipment] =
		useState<EquipmentDetails | null>(null)
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)

	// Рефы для сохранения состояния фильтров
	const searchFilterRef = useRef<string>('')
	const sortStateRef = useRef<any>(null)
	const paginationStateRef = useRef<any>({ pageIndex: 0, pageSize: 20 })

	// Используем контекст фильтров
	const { filterMode } = useEquipmentFilter()

	// Реакция на изменение фильтра
	useEffect(() => {
		if (isOpen && filterMode) {
			console.log(
				`🗑️ Фильтр изменен: сбрасываем выделение и возвращаемся к списку`
			)
			// Сбрасываем выделение при изменении фильтра
			setSelectedEquipment(null)
		}
	}, [filterMode, isOpen])

	// Загружаем данные при открытии таблицы
	useEffect(() => {
		if (isOpen) {
			fetchEquipmentList()
		}
	}, [isOpen])

	// При изменении selectedObjectCode загружаем новые данные
	useEffect(() => {
		if (isOpen && selectedObjectCode) {
			console.log(
				`🔄 Загрузка данных для нового объекта: ${selectedObjectCode}`
			)
			handleSelectEquipment(selectedObjectCode)
		}
	}, [isOpen, selectedObjectCode])

	// Слушаем события открытия деталей
	useCustomEvent<{ code: string }>(
		'open-equipment-details',
		useCallback(
			detail => {
				console.log(`📥 Событие открытия деталей: ${detail.code}`)
				if (isOpen) {
					handleSelectEquipment(detail.code)
				}
			},
			[isOpen]
		)
	)

	// Слушаем события сброса камеры для возврата к таблице
	useCustomEvent(
		'reset-camera',
		useCallback(() => {
			console.log('📤 Сброс камеры: возврат к списку оборудования')
			// Сбрасываем выбранное оборудование при сбросе камеры
			setSelectedEquipment(null)
		}, [])
	)

	const fetchEquipmentList = async () => {
		setLoading(true)
		setError(null)
		try {
			const { apiService } = await import('../../services/api')
			const data = await apiService.getAllEquipment()
			setEquipmentList(data)
		} catch (err) {
			setError('Не удалось загрузить список оборудования')
			console.error('Ошибка загрузки:', err)
		} finally {
			setLoading(false)
		}
	}

	const handleSelectEquipment = async (modelCode: string) => {
		console.log(`📡 Загрузка данных для: ${modelCode}`)
		try {
			const { apiService } = await import('../../services/api')
			const details = await apiService.getEquipmentByCode(modelCode)
			setSelectedEquipment(details)
			console.log(`✅ Данные обновлены для: ${modelCode}`)
		} catch (err) {
			console.log(`ℹ️ Нет данных для: ${modelCode}`)
			setSelectedEquipment(null)
		}
	}

	const handleClose = () => {
		emitCustomEvent('clear-selections')
		setSelectedEquipment(null)
		setError(null)
		onClose()
	}

	const handleBackToList = () => {
		emitCustomEvent('clear-selections')
		setSelectedEquipment(null)
		setError(null)
	}

	// Функция для сохранения состояния фильтров
	const saveTableState = useCallback(
		(search: string, sort: any, pagination: any) => {
			searchFilterRef.current = search
			sortStateRef.current = sort
			paginationStateRef.current = pagination
			console.log('💾 Сохранено состояние таблицы:', {
				search,
				sort,
				pagination,
			})
		},
		[]
	)

	// Функция для получения сохраненного состояния фильтров
	const getSavedTableState = useCallback(
		() => ({
			search: searchFilterRef.current,
			sort: sortStateRef.current,
			pagination: paginationStateRef.current,
		}),
		[]
	)

	if (!isOpen) return null

	return (
		<div
			className={`fixed top-0 right-0 h-full w-full max-w-xl z-40 transform transition-all duration-300 ease-in-out ${
				isOpen ? 'translate-x-0' : 'translate-x-full'
			}`}
			style={{ zIndex: 40 }}
		>
			<div className='h-full bg-gray-900/95 border-l border-gray-700/50 shadow-2xl flex flex-col overflow-hidden'>
				<TableHeader
					title={selectedEquipment ? selectedEquipment.name : 'Таблица данных'}
					subtitle={
						filterMode
							? `Фильтр: ${
									filterMode === 'overdue' ? 'Просроченные' : 'Дефектные'
							  }`
							: selectedEquipment
							? 'Детальная информация'
							: ''
					}
					onClose={handleClose}
				/>

				<div className='flex-1 overflow-hidden'>
					{selectedEquipment ? (
						<EquipmentDetailsView
							equipment={selectedEquipment}
							onBack={handleBackToList}
						/>
					) : (
						<UnifiedTableView
							equipmentList={equipmentList}
							loading={loading}
							error={error}
							onSelectEquipment={handleSelectEquipment}
							onSaveState={saveTableState}
							savedState={getSavedTableState()}
						/>
					)}
				</div>
			</div>
		</div>
	)
}

DataTableComponent.displayName = 'DataTable'

const DataTable = memo(DataTableComponent)

export default DataTable
