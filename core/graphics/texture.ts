namespace TSE {

	const LEVEL: number = 0;
	const BORDER: number = 0;
	// default image data will represent a single white pixel
	// unit8aray is an array of 8bit integers
	const TEMP_IMAGE_DATA: Uint8Array = new Uint8Array([255, 255, 255, 255]);

	export class Texture implements IMessageHandler {

		private _name: string;
		private _handle: WebGLTexture;
		private _isLoaded: boolean = false;
		private _width: number;
		private _height: number;

		public constructor(name: string, width: number = 1, height: number = 1) {
			this._name = name;
			this._width = width;
			this._height = height;

			this._handle = gl.createTexture();

			// subscribe to listen for when a texture is loaded
			Message.subscribe(MESSAGE_ASSET_LOADER_ASSET_LOADED + this._name, this);

			this.bind();

			// loading raw data into texture
			gl.texImage2D(gl.TEXTURE_2D, LEVEL, gl.RGBA, 1, 1, BORDER, gl.RGBA, gl.UNSIGNED_BYTE, TEMP_IMAGE_DATA);

			// START asset loading
			// check if the texture already exists in an already loaded asset
			let asset = AssetManager.getAsset(this.name) as ImageAsset;

			if (asset !== undefined) {
				this.loadTextureFromAsset(asset);
			}
		}

		public get name(): string {
			return this._name;
		}

		public get isLoaded(): boolean {
			return this._isLoaded;
		}

		public get width(): number {
			return this._width;
		}

		public get height(): number {
			return this._height;
		}

		// avoid the memory leaksss.
		public destroy(): void {
			gl.deleteTexture(this._handle);
		}

		/**
		 * Our value textureUnit is telling WebGL what channel to activate the texture on
		 * webgl has 32 texture units that can be referenced
		 * unit value offsets from texture0
		 */
		public activateAndBind(textureUnit: number = 0): void {
			gl.activeTexture(gl.TEXTURE0 + textureUnit);

			this.bind();
		}

		/**
		 * binding tells WebGL what we what to use
		 */
		public bind(): void {
			gl.bindTexture(gl.TEXTURE_2D, this._handle);
		}

		// pass undefined to GL
		public unbind(): void {
			gl.bindTexture(gl.TEXTURE_2D, undefined);
		}

		public onMessage(message: Message): void {
			// if we receive a message saying that our asset has been loaded
			if (message.code === MESSAGE_ASSET_LOADER_ASSET_LOADED + this._name) {
				this.loadTextureFromAsset(message.context as ImageAsset);
			}
		}

		private loadTextureFromAsset(asset: ImageAsset): void {
			this._width = asset.width;
			this._height = asset.height;

			this.bind();

			// loading an image into the texture
			gl.texImage2D(gl.TEXTURE_2D, LEVEL, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, asset.data);

			if (this.isPowerof2()) {
				gl.generateMipmap(gl.TEXTURE_2D);
			} else {
				// do not generate a mip map and clamp wrapping to edge
				// S,T are equavalent to U,V
				gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
				gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
			}

			// TODO: set texture filtering based on configuration
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

			// ASSET IS LOADED
			this._isLoaded = true;
		}

		// if an image is not a power of 2 then specific filtering parameters need to be set
		private isPowerof2(): boolean {
			return (this.isValuePowerOf2(this._width) && this.isValuePowerOf2(this.height));
		}

		private isValuePowerOf2(value: number): boolean {
			return (value & (value - 1)) == 0;
		}
	}
}