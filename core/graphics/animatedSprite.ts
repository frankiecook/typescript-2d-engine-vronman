/// <reference path="sprite.ts" />

namespace TSE {

	/**
	 * stores the minimum and maximum UV coordinates
	 */
	class UVInfo {
		public min: Vector2;
		public max: Vector2;

		public constructor(min: Vector2, max: Vector2) {
			this.min = min;
			this.max = max;
		}
	}

	export class AnimatedSpriteInfo {
		public name: string;
		public materialName: string;
		public width: number = 100;
		public height: number = 100;
		public frameWidth: number = 10;
		public frameHeight: number = 10;
		public frameCount: number = 1;
		public frameSequence: number[] = [];
		public frameTime: number = 60;
	}

	/**
	 * Represents a 2-dimensional animated sprite
	 * @_frameHeight height of frame in sprite sheet
	 * @_frameWidth width of rame in sprite sheet
	 * @_frameCount current frame
	 * @_frameSequence order of frames
	 * @_currentFrame current frame for animation
	 * @_frameUVs calculated and stored UVs for each frame
	 * @_frameTime how long a frame lasts in ms
	 * @_currentTime tracks the current time in update
	 */
	export class AnimatedSprite extends Sprite implements IMessageHandler {

		private _frameHeight: number;
		private _frameWidth: number;
		private _frameCount: number;
		private _frameSequence: number[];

		private _currentFrame: number = 0;
		private _frameUVs: UVInfo[] = [];

		private _frameTime: number = 33;
		private _currentTime: number = 0;
		private _assetLoaded: boolean = false;
		private _assetWidth: number=2;
		private _assetHeight: number = 2;
		private _isPlaying: boolean = true;

		public constructor(info: AnimatedSpriteInfo) {
			super(info.name, info.materialName, info.width, info.height);

			this._frameHeight = info.frameHeight;
			this._frameWidth = info.frameWidth;
			this._frameCount = info.frameCount;
			this._frameSequence = info.frameSequence;
			this._frameTime = info.frameTime;

			// message subscription is for calculating UVs
			Message.subscribe(MESSAGE_ASSET_LOADER_ASSET_LOADED + this._material.diffuseTextureName, this);
		}

		public get isPlaying(): boolean {
			return this._isPlaying;
		}

		public destroy(): void {
			super.destroy();
		}

		public play(): void {
			this._isPlaying = true;
		}

		public stop(): void {
			this._isPlaying = false;
		}

		public setFrame(frameNumber: number): void {
			if (frameNumber >= this._frameCount) {
				throw new Error("Frame is out of range:" + frameNumber+", frame count:"+this._frameCount);
			}

			this._currentFrame = frameNumber;
		}

		// must wait until the asset has loaded to calculate UVs
		onMessage(message: Message): void {
			if (message.code === MESSAGE_ASSET_LOADER_ASSET_LOADED + this._material.diffuseTextureName) {
				this._assetLoaded = true;
				let asset = message.context as ImageAsset;
				this._assetHeight = asset.height;
				this._assetWidth = asset.width;
				this.calculateUVs();
			}
		}

		public load(): void {
			super.load();

			if (!this._assetLoaded) {
				this.setupFromMaterial();
			}
		}

		public update(time: number): void {
			if (!this._assetLoaded) {
				this.setupFromMaterial();
				return;
			}

			// boot out early if not animating
			if (!this._isPlaying) {
				return;
			}

			// update the current time
			this._currentTime += time;
			// if current time is beyond the frame time (ms) update the frame
			if (this._currentTime > this._frameTime) {
				this._currentFrame++;
				this._currentTime = 0;

				// don't let current frame exceed the frame length
				if (this._currentFrame >= this._frameSequence.length) {
					this._currentFrame = 0;
				}

				// use the current frame in the frame sequence to copy UV data from
				let frameUVs = this._frameSequence[this._currentFrame];

				this._vertices[0].texCoords.copyFrom(this._frameUVs[frameUVs].min);
				this._vertices[1].texCoords = new Vector2(this._frameUVs[frameUVs].min.x, this._frameUVs[frameUVs].max.y);
				this._vertices[2].texCoords.copyFrom(this._frameUVs[frameUVs].max);
				// broken for some reason 4,3,5
				this._vertices[3].texCoords.copyFrom(this._frameUVs[frameUVs].max);
				this._vertices[4].texCoords = new Vector2(this._frameUVs[frameUVs].max.x, this._frameUVs[frameUVs].min.y);
				this._vertices[5].texCoords.copyFrom(this._frameUVs[frameUVs].min);

				this._vertices[0].texCoords = new Vector2(0 + 0.333 * frameUVs, 0);
				this._vertices[1].texCoords = new Vector2(0 + 0.333 * frameUVs, 1);
				this._vertices[2].texCoords = new Vector2(0.333 * (frameUVs+1), 1);
				// broken for some reason 5,3,4
				this._vertices[5].texCoords = new Vector2(0 + 0.333 * frameUVs, 0);
				this._vertices[3].texCoords = new Vector2(0.33 * (frameUVs + 1), 1);
				this._vertices[4].texCoords = new Vector2(0.33 * (frameUVs + 1), 0);

				// update buffer
				this._buffer.clearData();
				for (let v of this._vertices) {
					// hey webgl, we want to pass you info

					this._buffer.pushBackData(v.toArray());
				}

				this._buffer.upload();
				this._buffer.unbind();
			}

			super.update(time);
		}

		private calculateUVs(): void {
			let totalWidth: number = 0;
			let xValue: number = 0;
			let yValue: number = 0;

			// cylce through each frame
			for (let i = 0; i < this._frameCount; i++) {
				
				totalWidth += this._frameWidth;

				// track the y direction
				if (totalWidth > this._assetWidth) {
					yValue++;
					totalWidth = 0;
					xValue = 0;
				}

				// normalize by the image size to get UV coordinates
				let u = (xValue * this._frameWidth) / this._assetWidth;
				let v = (yValue * this._frameHeight) / this._assetHeight;
				let min: Vector2 = new Vector2(u, v);

				// increment from the min position by the current frame widht and height
				let uMax = ((xValue * this._frameWidth) + this._frameWidth) / this._assetWidth;
				let vMax = ((yValue * this._frameHeight) + this._frameHeight) / this._assetHeight;
				let max: Vector2 = new Vector2(uMax, vMax);

				// store the calculated UV coordinates
				this._frameUVs.push(new UVInfo(min, max));

				xValue++;
			}
		}

		private setupFromMaterial(): void {
			// check if material's diffuse texture and asset are loaded
			if (!this._assetLoaded) {
				let material = MaterialManager.getMaterial(this._materialName);
				
				if (material.diffuseTexture.isLoaded) {
					if (AssetManager.isAssetLoaded(material.diffuseTextureName)) {
						// set values
						this._assetHeight = material.diffuseTexture.height;
						this._assetHeight = material.diffuseTexture.width;
						this._assetLoaded = true;
						this.calculateUVs();
					}
				}
			}
		}
	}
}