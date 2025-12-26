import fs from 'fs'
import path from 'path'

console.log('🔍 Проверка структуры проекта...\n')

// Текущая директория
const rootDir = process.cwd()
console.log('Корневая директория:', rootDir)

// Проверяем наличие public папки
const publicDir = path.join(rootDir, 'public')
console.log(
	'\n1. Папка public:',
	fs.existsSync(publicDir) ? '✅ существует' : '❌ отсутствует'
)

if (fs.existsSync(publicDir)) {
	console.log('   Содержимое public:')
	const publicFiles = fs.readdirSync(publicDir, { withFileTypes: true })
	publicFiles.forEach(item => {
		console.log(`   ${item.isDirectory() ? '📁' : '📄'} ${item.name}`)
	})
}

// Проверяем наличие models папки
const modelsDir = path.join(publicDir, 'models')
console.log(
	'\n2. Папка models:',
	fs.existsSync(modelsDir) ? '✅ существует' : '❌ отсутствует'
)

if (fs.existsSync(modelsDir)) {
	console.log('   Содержимое models:')
	const modelFiles = fs.readdirSync(modelsDir)
	modelFiles.forEach(file => {
		const filePath = path.join(modelsDir, file)
		const stats = fs.statSync(filePath)
		console.log(`   📄 ${file} (${(stats.size / 1024).toFixed(2)} KB)`)
	})
}

// Проверяем наличие KS-17_optimized.glb
const targetFile = path.join(modelsDir, 'KS-17_optimized.glb')
console.log(
	'\n3. Файл KS-17_optimized.glb:',
	fs.existsSync(targetFile) ? '✅ найден' : '❌ отсутствует'
)

if (fs.existsSync(targetFile)) {
	const stats = fs.statSync(targetFile)
	console.log(`   Размер: ${(stats.size / 1024).toFixed(2)} KB`)
	console.log(`   Путь: ${targetFile}`)
}

// Проверяем vite.config.js
console.log('\n4. Vite конфигурация:')
const viteConfigPath = path.join(rootDir, 'vite.config.ts')
if (fs.existsSync(viteConfigPath)) {
	const configContent = fs.readFileSync(viteConfigPath, 'utf-8')
	console.log('   ✅ vite.config.ts существует')

	// Проверяем настройки статических файлов
	if (
		configContent.includes('publicDir') ||
		configContent.includes('assetsInclude')
	) {
		console.log('   ⚙️  Найдены настройки статических файлов')
	}
} else {
	console.log('   ⚠️  vite.config.ts не найден')
}

console.log('\n📋 Рекомендации:')
console.log(
	'1. Убедитесь, что файл KS-17_optimized.glb находится в public/models/'
)
console.log('2. Запустите приложение: npm run dev')
console.log('3. Откройте в браузере: http://localhost:5173')
console.log('4. Проверьте консоль браузера (F12) на наличие ошибок')
