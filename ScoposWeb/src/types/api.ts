export interface EquipmentItem {
	code: string
	modelCode: string | null
	name: string
	type?: string
	className: string
	parentCode?: string
	parentName?: string
	inventoryNumber: string
	manufacturer: string
	serialNumber: string | null
	productYear?: string
	productMonth?: string
	comissioningDate?: string | null
	branchName?: string
	prDepName?: string
	location: string
	userStat?: string
	systemStat?: string
}

export interface EquipmentDetails extends EquipmentItem {
	type: string
	parentCode: string
	parentName: string
	productYear: string
	productMonth: string
	comissioningDate: string | null
	branchName: string
	prDepName: string
	userStat: string
	systemStat: string
}

// Добавить в существующий файл
export interface EquipmentSimple {
	modelCode: string
}

export type EquipmentModelCode = string
