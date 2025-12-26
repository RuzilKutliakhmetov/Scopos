import React, { memo, useCallback, useEffect, useState } from 'react'
import { emitCustomEvent, useCustomEvent } from '../../hooks/useCustomEvent'
import type { EquipmentDetails, EquipmentItem } from '../../types/api'
import EquipmentDetailsView from './EquipmentDetailsView'
import TableHeader from './TableHeader'
import TableView from './TableView'

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
	const [currentSelectedCode, setCurrentSelectedCode] = useState<
		string | undefined
	>()

	// Загружаем данные при открытии таблицы
	useEffect(() => {
		if (isOpen) {
			fetchEquipmentList()
		}
	}, [isOpen])

	// Обновляем при получении нового кода извне (например, при клике на объект)
	useEffect(() => {
		if (selectedObjectCode && selectedObjectCode !== currentSelectedCode) {
			console.log(`📥 Новый код получен извне: ${selectedObjectCode}`)
			setCurrentSelectedCode(selectedObjectCode)
			handleSelectEquipment(selectedObjectCode)
		}
	}, [selectedObjectCode])

	// Также слушаем события открытия деталей
	// useCustomEvent<{ code: string }>(
	// 	'open-equipment-details',
	// 	useCallback(
	// 		detail => {
	// 			console.log(`📥 Событие открытия деталей: ${detail.code}`)
	// 			if (detail.code !== currentSelectedCode) {
	// 				setCurrentSelectedCode(detail.code)
	// 				handleSelectEquipment(detail.code)
	// 			}
	// 		},
	// 		[currentSelectedCode]
	// 	)
	// )

	useCustomEvent<{ code: string }>(
		'open-equipment-details',
		useCallback(
			detail => {
				console.log(`📥 Прямое событие открытия в DataTable: ${detail.code}`)
				if (isOpen) {
					handleSelectEquipment(detail.code)
				}
			},
			[isOpen]
		)
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
			console.log(`✅ Данные загружены для: ${modelCode}`)
		} catch (err) {
			console.log(`ℹ️ Нет данных для: ${modelCode}`)
			setSelectedEquipment(null) // Сбрасываем, если нет данных
		}
	}

	const handleClose = () => {
		emitCustomEvent('clear-selections')
		setSelectedEquipment(null)
		setCurrentSelectedCode(undefined)
		setError(null)
		onClose()
	}

	const handleBackToList = () => {
		emitCustomEvent('clear-selections')
		setSelectedEquipment(null)
		setCurrentSelectedCode(undefined)
		setError(null)
	}

	if (!isOpen) return null

	return (
		<div
			className={`fixed top-0 right-0 h-full w-full max-w-xl z-50 transform transition-all duration-300 ease-in-out ${
				isOpen ? 'translate-x-0' : 'translate-x-full'
			}`}
		>
			<div className='h-full bg-gray-900/95 border-l border-gray-700/50 shadow-2xl flex flex-col overflow-hidden'>
				<TableHeader
					title={selectedEquipment ? selectedEquipment.name : 'Таблица данных'}
					subtitle={selectedEquipment ? 'Детальная информация' : ''}
					onClose={handleClose}
				/>

				<div className='flex-1 overflow-hidden'>
					{selectedEquipment ? (
						<EquipmentDetailsView
							equipment={selectedEquipment}
							onBack={handleBackToList}
						/>
					) : (
						<TableView
							equipmentList={equipmentList}
							loading={loading}
							error={error}
							onSelectEquipment={handleSelectEquipment}
							onRefresh={fetchEquipmentList}
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
