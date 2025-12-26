// import * as THREE from 'three'
// import { LAYERS } from '../../config/layers'

// /**
//  * Распределяет объекты по слоям в зависимости от их имени
//  * @param object - Объект Three.js для распределения по слоям
//  * @param isBackground - Флаг, указывающий что объект является фоновым
//  */
// export const assignLayers = (object: THREE.Object3D, isBackground = false) => {
// 	const name = object.name || ''
// 	const isBg = isBackground || name.includes('*')

// 	if (/^\d/.test(name)) {
// 		object.layers.set(LAYERS.PIPELINE)
// 		//console.log(`📌 Объект "${name}" → PIPELINE`)
// 	} else if (isBg) {
// 		object.layers.set(LAYERS.BACKGROUND)
// 		//console.log(`📌 Объект "${name}" → BACKGROUND`)
// 	} else {
// 		object.layers.set(LAYERS.OTHERS)
// 		//console.log(`📌 Объект "${name}" → OTHERS`)
// 	}

// 	object.children.forEach(child => assignLayers(child, isBg))
// }

// /**
//  * Экспортирует все объекты слоя PIPELINE в консоль
//  * @param scene - Сцена Three.js для анализа
//  */
// export const exportPipelineObjects = (scene: THREE.Group) => {
// 	const pipelineObjects: string[] = []

// 	scene.traverse(object => {
// 		if (object.layers.isEnabled(LAYERS.PIPELINE)) {
// 			if (object.name && object.name.trim() !== '') {
// 				pipelineObjects.push(object.name)
// 			}
// 		}
// 	})

// 	//console.log('🎯 Объекты слоя PIPELINE:', pipelineObjects)
// 	//console.log(`📊 Всего объектов: ${pipelineObjects.length}`)
// 	//console.log('📄 JSON массив:', JSON.stringify(pipelineObjects, null, 2))

// 	return pipelineObjects
// }
