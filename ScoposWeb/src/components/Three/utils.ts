import * as THREE from 'three'

export { assignLayers, exportPipelineObjects } from '../../utils/three-helpers'

export const getObjectCenter = (object: THREE.Object3D): THREE.Vector3 => {
	const box = new THREE.Box3().setFromObject(object)
	const center = new THREE.Vector3()
	box.getCenter(center)
	return center
}
