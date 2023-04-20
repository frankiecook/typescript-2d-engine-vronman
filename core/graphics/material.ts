namespace TSE {

	export class Material {

		private _name: string;
		private _diffuseTextureName: string;

		private _diffuseTexture: Texture;
		private _tint: Color;


		public constructor(name: string, diffuseTextureName: string, tint: Color) {
			this._name = name;
			this._diffuseTextureName = diffuseTextureName;
			this._tint = tint;

			// reference to the texture for the material
			if (this._diffuseTextureName !== undefined) {
				this._diffuseTexture = TextureManager.getTexture(this._diffuseTextureName);
			}

		}

		public get name(): string {
			return this._name;
		}

		public get diffuseTextureName(): string {
			return this._diffuseTextureName;
		}

		public get diffuseTexture(): Texture {
			return this._diffuseTexture;
		}

		public get tint(): Color {
			return this._tint;
		}

		/**
		 * check for reference before reassigning
		 */
		public set diffuseTextureName(value: string) {
			// if a reference exists then release the reference
			if (this._diffuseTexture !== undefined) {
				TextureManager.releaseTexture(this._diffuseTextureName);
			}

			this._diffuseTextureName = value;


			if (this._diffuseTexture !== undefined) {
				this._diffuseTexture = TextureManager.getTexture(this._diffuseTextureName);
			}
		}

		// destroy the material and undefine the reference
		public destroy(): void {
			TextureManager.releaseTexture(this.diffuseTextureName);
			this._diffuseTexture = undefined;
		}
	}
}