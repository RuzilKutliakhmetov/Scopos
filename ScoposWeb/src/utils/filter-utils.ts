import type { EquipmentFilterMode } from '../context/EquipmentFilterContext'

/**
 * Проверяет, соответствует ли объект активному фильтру
 */
export const checkObjectInFilter = (
	objectName: string,
	filterMode: EquipmentFilterMode,
	filterCodes: Set<string>
): boolean => {
	if (!filterMode || filterCodes.size === 0) return true

	// Проверяем по полному имени
	if (filterCodes.has(objectName)) {
		return true
	}

	// Проверяем части имени (если содержит цифры или коды)
	const codesInName = objectName.match(/[\d-]+/g) || []
	for (const code of codesInName) {
		if (filterCodes.has(code)) {
			return true
		}
	}

	return false
}

/**
 * Проверяет, доступен ли объект для выделения при активном фильтре
 */
export const isObjectSelectable = (
	objectName: string,
	filterMode: EquipmentFilterMode,
	filterCodes: Set<string>
): boolean => {
	if (!filterMode || filterCodes.size === 0) return true
	return checkObjectInFilter(objectName, filterMode, filterCodes)
}

/**
 * Получает список кодов объектов, которые соответствуют фильтру
 */
export const getFilteredObjectCodes = (
	allObjects: string[],
	filterMode: EquipmentFilterMode,
	filterCodes: Set<string>
): string[] => {
	if (!filterMode || filterCodes.size === 0) return allObjects

	return allObjects.filter(objectName =>
		checkObjectInFilter(objectName, filterMode, filterCodes)
	)
}
