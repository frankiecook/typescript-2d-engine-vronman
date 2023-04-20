namespace TSE {
	/**
	* these classes behave similarly to the messageManager
	* keep track of references with a node
	* However, materials will be loaded elsewhere and then regestered after loading
	*/
	class MaterialReferenceNode {

		public material: Material;

		public referenceCount: number = 1;

		public constructor(material: Material) {
			this.material = material;
		}
	}

	/**
	 * Materials work differently from textures, because we load these from another location
	 */
	export class MaterialManager {

		private static _materials: { [name: string]: MaterialReferenceNode } = {};

		private constructor() {

		}

		public static registerMaterial(material: Material): void {
			if (MaterialManager._materials[material.name] === undefined) {
				MaterialManager._materials[material.name] = new MaterialReferenceNode(material);
			}
		}

		public static getMaterial(materialName: string): Material {
			// not enough information to actually load a material, so return that the material is undefined
			if (MaterialManager._materials[materialName] === undefined) {
				return undefined;
			} else {
				MaterialManager._materials[materialName].referenceCount++;
				return MaterialManager._materials[materialName].material;
			}
		}

		/**
		 * Releases a reference of a material with the provided name and decrements the reference count. 
		 * If the material's reference count is 0, it is automatically released. 
		 * @param materialName The name of the material to be released.
		 */
		public static releaseMaterial(materialName: string): void {
			// material existence check
			if (MaterialManager._materials[materialName] === undefined) {
				console.warn("Cannot release a material which has not been registered.")
			} else {
				MaterialManager._materials[materialName].referenceCount--;
				if (MaterialManager._materials[materialName].referenceCount < 1) {
					MaterialManager._materials[materialName].material.destroy();
					MaterialManager._materials[materialName].material = undefined;
					delete MaterialManager._materials[materialName];
				}
			}
		}
	}
}