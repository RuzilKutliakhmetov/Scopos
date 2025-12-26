import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react-swc'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
	plugins: [react(), tailwindcss()],
	server: {
		open: true,
		port: 5173,
	},
	build: {
		outDir: 'dist',
		assetsDir: 'assets',
	},
	// Важно: настройки для GLB файлов
	assetsInclude: ['**/*.glb'],
	// Настройка публичной папки
	publicDir: 'public',
})
