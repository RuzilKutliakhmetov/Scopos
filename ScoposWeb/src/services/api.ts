import axios, { type AxiosInstance } from 'axios'
import type { EquipmentDetails, EquipmentItem } from '../types/api'

class ApiService {
	private api: AxiosInstance
	private baseURL: string

	constructor() {
		this.baseURL = this.determineBaseURL()

		this.api = axios.create({
			baseURL: this.baseURL,
			timeout: 30000,
			headers: {
				'Content-Type': 'application/json',
				Accept: 'application/json',
			},
			withCredentials: true,
		})

		this.setupInterceptors()
	}

	private determineBaseURL(): string {
		if (import.meta.env.VITE_API_URL) {
			return import.meta.env.VITE_API_URL
		}

		const hostname = window.location.hostname
		const port = window.location.port

		if (hostname === 'localhost' || hostname === '127.0.0.1') {
			return port === '3000' || port === '5173' || port === '8080'
				? 'https://localhost:7218'
				: 'http://localhost:7218'
		}

		if (hostname.includes('gazprom.ru')) {
			return 'http://srv-edms-scopos.ufa-tr.gazprom.ru'
		}

		return 'https://localhost:7218'
	}

	private setupInterceptors() {
		this.api.interceptors.request.use(
			config => {
				if (import.meta.env.DEV) {
					console.log(
						`📡 ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`
					)
				}
				return config
			},
			error => {
				console.error('❌ Request Error:', error)
				return Promise.reject(error)
			}
		)

		this.api.interceptors.response.use(
			response => {
				if (import.meta.env.DEV) {
					console.log(`✅ ${response.status} ${response.config.url}`)
				}
				return response
			},
			error => {
				if (error.response) {
					console.error('❌ API Error:', {
						status: error.response.status,
						statusText: error.response.statusText,
						url: error.config?.url,
						data: error.response.data,
					})

					if (error.response.status === 301 || error.response.status === 308) {
						const redirectUrl = error.response.headers.location
						console.warn(
							`⚠️ Получен редирект ${error.response.status} на:`,
							redirectUrl
						)
						throw new Error(
							`Сервер перенаправил запрос. Проверьте настройки API.`
						)
					}
				} else if (error.request) {
					console.error('❌ Network Error:', error.message)
					throw new Error('Проблемы с сетью. Проверьте подключение.')
				} else {
					console.error('❌ Request Setup Error:', error.message)
				}

				return Promise.reject(error)
			}
		)
	}

	private async requestWithRetry<T>(
		requestFn: () => Promise<T>,
		maxRetries = 2
	): Promise<T> {
		for (let i = 0; i < maxRetries; i++) {
			try {
				return await requestFn()
			} catch (error) {
				if (i === maxRetries - 1) throw error
				// Экспоненциальная задержка
				await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)))
			}
		}
		throw new Error('Max retries exceeded')
	}

	// Добавить в класс ApiService
	// Получить просроченные объекты
	async getOverdueEquipment(): Promise<string[]> {
		return this.requestWithRetry(async () => {
			try {
				const response = await this.api.get<string[]>(
					'/api/equipment/overdue-simple'
				)
				return response.data
			} catch (error: any) {
				console.error('Error fetching overdue equipment:', error)

				// Тестовые данные для разработки
				if (import.meta.env.DEV) {
					console.warn(
						'⚠️ Используем тестовые данные для просроченного оборудования'
					)
					return ['301-123', '302-456', '303-789', '304-012']
				}

				throw error
			}
		})
	}

	// Получить объекты с дефектами
	async getDefectiveEquipment(): Promise<string[]> {
		return this.requestWithRetry(async () => {
			try {
				const response = await this.api.get<string[]>(
					'/api/notify/equipment/modelcodes'
				)
				return response.data
			} catch (error: any) {
				console.error('Error fetching defective equipment:', error)

				// Тестовые данные для разработки
				if (import.meta.env.DEV) {
					console.warn(
						'⚠️ Используем тестовые данные для оборудования с дефектами'
					)
					return ['305-678', '306-901', '307-234', '308-567']
				}

				throw error
			}
		})
	}

	// Получить все оборудование
	async getAllEquipment(): Promise<EquipmentItem[]> {
		return this.requestWithRetry(async () => {
			try {
				const response = await this.api.get<EquipmentItem[]>('/api/equipment')
				return response.data
			} catch (error: any) {
				console.error('Error fetching all equipment:', error)

				if (
					error.message.includes('Network Error') ||
					error.message.includes('CORS') ||
					error.response?.status === 301
				) {
					console.warn(
						'⚠️ Проблема с доступом к API. Используем тестовые данные.'
					)
					return this.getMockData()
				}

				throw error
			}
		})
	}

	// Получить информацию по коду
	async getEquipmentByCode(modelCode: string): Promise<EquipmentDetails> {
		return this.requestWithRetry(async () => {
			try {
				console.log(`🔍 Запрос оборудования по коду: ${modelCode}`)

				const encodedCode = encodeURIComponent(modelCode)
				const response = await this.api.get<EquipmentDetails>(
					`/api/equipment/${encodedCode}`
				)

				return response.data
			} catch (error: any) {
				console.error(`Error fetching equipment ${modelCode}:`, error)

				if (error.response?.status === 404) {
					throw new Error(`Оборудование с кодом ${modelCode} не найдено`)
				} else if (error.response?.status === 301) {
					throw new Error(`Ошибка перенаправления при запросе ${modelCode}`)
				} else if (
					error.message.includes('Network Error') ||
					error.message.includes('CORS')
				) {
					console.warn(
						'⚠️ Проблема с доступом к API. Используем тестовые данные.'
					)
					return this.getMockDetails(modelCode)
				}

				throw error
			}
		})
	}

	// Тестовые данные
	private getMockData(): EquipmentItem[] {
		console.log('📋 Используются тестовые данные')
		return [
			{
				code: '1001218362',
				modelCode: '3192-3193',
				name: 'Труба №12 (11575мм)',
				className: 'Трубопровод',
				manufacturer: 'Россия',
				inventoryNumber: '080923',
				location: 'ЛПУ МГ Полянское/КС Полянская/КС-17',
				serialNumber: null,
			},
			{
				code: '1001218327',
				modelCode: '3194-3195',
				name: 'Труба №23 (360мм)',
				className: 'Трубопровод',
				manufacturer: 'Германия',
				inventoryNumber: '080924',
				location: 'ЛПУ МГ Полянское/КС Полянская/КС-17',
				serialNumber: null,
			},
			{
				code: '1001215593',
				modelCode: '3196-3197',
				name: 'Труба №1 (2460мм)',
				className: 'Трубопровод',
				manufacturer: 'Франция',
				inventoryNumber: '080951',
				location: 'ЛПУ МГ Полянское/КС Полянская/КС-17',
				serialNumber: null,
			},
		]
	}

	private getMockDetails(modelCode: string): EquipmentDetails {
		return {
			code: '1001215593',
			modelCode: modelCode,
			name: `Труба (${modelCode})`,
			type: 'E',
			className: 'Трубопровод',
			parentCode: '1001215577',
			parentName: 'Группа АВО газа №9',
			inventoryNumber: '080951',
			manufacturer: 'Франция',
			serialNumber: null,
			productYear: '1981',
			productMonth: '01',
			comissioningDate: null,
			branchName: 'ГТУфа Полянское ЛПУМГ',
			prDepName: 'ПО ЭКС',
			location:
				'ЛПУ МГ Полянское/КС Полянская/КС-17/Установка АВО газа КС-17/Группа АВО газа №9',
			userStat: 'ЭКСП',
			systemStat: 'ПВЕО',
		}
	}

	getBaseURL(): string {
		return this.baseURL
	}
}

export const apiService = new ApiService()
