namespace TSE {
	/**
	 * Texture manager keeps track of how many handlers are using a texture
	 * if no handlers are using a texture, we can unload it
	 */
	class TextureReferenceNode {
		public texture: Texture;
		public referenceCount: number = 1;

		public constructor(texture: Texture) {
			this.texture = texture;
		}
	}

	export class TextureManager {

		private static _textures: { [name: string]: TextureReferenceNode } = {};

		private constructor() {

		}

		public static getTexture(textureName: string): Texture {
			// if texture doesn't exist then create a new one
			if (TextureManager._textures[textureName] === undefined) {
				let texture = new Texture(textureName);
				TextureManager._textures[textureName] = new TextureReferenceNode(texture);
			} else {
				TextureManager._textures[textureName].referenceCount++;
			}

			return TextureManager._textures[textureName].texture;
		}

		public static releaseTexture(textureName: string): void {
			if (TextureManager._textures[textureName] === undefined) {
				console.warn('a testure named ' + textureName + ' does not exist and cannot be released.');
			} else {
				TextureManager._textures[textureName].referenceCount--;
				// if referenced 0 times then delete all references
				if (TextureManager._textures[textureName].referenceCount < 1) {
					TextureManager._textures[textureName].texture.destroy();
					TextureManager._textures[textureName] = undefined;
					delete TextureManager._textures[textureName];	// delect from texture manager
				}
			}
		}
	}
}