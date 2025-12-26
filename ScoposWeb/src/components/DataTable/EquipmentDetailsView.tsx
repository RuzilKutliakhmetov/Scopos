import React, { memo } from 'react'
import type { EquipmentDetails } from '../../types/api'

interface EquipmentDetailsViewProps {
	equipment: EquipmentDetails
	onBack: () => void
}

const EquipmentDetailsViewComponent: React.FC<EquipmentDetailsViewProps> = ({
	equipment,
	onBack,
}) => {
	return (
		<div className='h-full overflow-auto p-6'>
			<button
				onClick={onBack}
				className='flex items-center text-sm text-blue-300 hover:text-white transition-colors mb-6 cursor-pointer'
			>
				<svg
					className='w-4 h-4 mr-1'
					fill='none'
					stroke='currentColor'
					viewBox='0 0 24 24'
				>
					<path
						strokeLinecap='round'
						strokeLinejoin='round'
						strokeWidth={2}
						d='M10 19l-7-7m0 0l7-7m-7 7h18'
					/>
				</svg>
				Вернуться к таблице
			</button>

			<div className='bg-gray-800/30 rounded-lg p-6 border border-gray-700/30'>
				<h3 className='text-xl font-semibold text-white mb-6 cursor-default'>
					{equipment.name}
				</h3>

				<div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
					<DetailsColumn equipment={equipment} />
					<AdditionalDetailsColumn equipment={equipment} />
				</div>
			</div>
		</div>
	)
}

const DetailsColumn: React.FC<{ equipment: EquipmentDetails }> = memo(
	({ equipment }) => (
		<div className='space-y-4'>
			<DetailItem label='Код оборудования' value={equipment.code} isMonospace />
			<DetailItem label='Класс оборудования' value={equipment.className} />
			{equipment.type && <DetailItem label='Тип' value={equipment.type} />}
			<DetailItem label='Производитель' value={equipment.manufacturer} />
			<DetailItem
				label='Инвентарный номер'
				value={equipment.inventoryNumber}
				isMonospace
			/>
		</div>
	)
)

const AdditionalDetailsColumn: React.FC<{ equipment: EquipmentDetails }> = memo(
	({ equipment }) => (
		<div className='space-y-4'>
			{equipment.parentName && (
				<DetailItem label='Родительский объект' value={equipment.parentName} />
			)}
			{equipment.branchName && (
				<DetailItem label='Филиал' value={equipment.branchName} />
			)}
			{equipment.prDepName && (
				<DetailItem label='Подразделение' value={equipment.prDepName} />
			)}
			{(equipment.productYear || equipment.productMonth) && (
				<div className='grid grid-cols-2 gap-4'>
					{equipment.productYear && (
						<DetailItem
							label='Год производства'
							value={equipment.productYear}
						/>
					)}
					{equipment.productMonth && (
						<DetailItem label='Месяц' value={equipment.productMonth} />
					)}
				</div>
			)}
			{(equipment.userStat || equipment.systemStat) && (
				<div className='grid grid-cols-2 gap-4'>
					{equipment.userStat && (
						<DetailItem
							label='Статус пользователя'
							value={equipment.userStat}
						/>
					)}
					{equipment.systemStat && (
						<DetailItem label='Системный статус' value={equipment.systemStat} />
					)}
				</div>
			)}
			{equipment.comissioningDate && (
				<DetailItem
					label='Дата ввода в эксплуатацию'
					value={equipment.comissioningDate}
				/>
			)}
			{equipment.serialNumber && (
				<DetailItem label='Серийный номер' value={equipment.serialNumber} />
			)}
		</div>
	)
)

const DetailItem: React.FC<{
	label: string
	value: string
	isMonospace?: boolean
}> = memo(({ label, value, isMonospace = false }) => (
	<div>
		<span className='text-gray-400 text-sm block mb-1 cursor-default'>
			{label}:
		</span>
		<p
			className={`text-white ${isMonospace ? 'font-mono' : ''} cursor-default`}
		>
			{value}
		</p>
	</div>
))

EquipmentDetailsViewComponent.displayName = 'EquipmentDetailsView'

export default memo(EquipmentDetailsViewComponent)
