/// <reference path="componentManager.ts" />
/// <reference path="baseComponent.ts" />
/// <reference path="spriteComponent.ts" />

namespace TSE {

	export class AnimatedSpriteComponenetData extends SpriteComponenetData implements IComponentData {

		public frameWidth: number;
		public frameHeight: number;
		public frameCount: number;
		public frameSequence: number[] = [];
		public autoPlay: boolean = true;
		public frameTime: number = 33;

		// require all above properties to be present
		public setFromJson(json: any): void {
			super.setFromJson(json);

			if (json.autoPlay !== undefined) {
				this.autoPlay = Boolean(json.autoPlay);
			}


			if (json.frameWidth === undefined) {
				throw new Error("AnimatedSpriteComponentData requires 'frameWidth' to be defined.");
			} else {
				this.frameWidth = Number(json.frameWidth);
			}

			if (json.frameHeight === undefined) {
				throw new Error("AnimatedSpriteComponentData requires 'frameHeight' to be defined.");
			} else {
				this.frameHeight = Number(json.frameHeight);
			}

			if (json.frameCount === undefined) {
				throw new Error("AnimatedSpriteComponentData requires 'frameCount' to be defined.");
			} else {
				this.frameCount = Number(json.frameCount);
			}

			if (json.frameSequence === undefined) {
				throw new Error("AnimatedSpriteComponentData requires 'frameSequence' to be defined.");
			} else {
				this.frameSequence = json.frameSequence;
			}

			if (json.frameTime === undefined) {
				throw new Error("AnimatedSpriteComponentData requires 'frameTime' to be defined.");
			} else {
				this.frameTime = Number(json.frameTime);
			}
		}
	}

	/**
	 * construct a componenet using the data read from JSON
	 * built indepedently of all pieces to allow for any number of componentst to be created
	 */
	export class AnimatedSpriteComponentBuilder implements IComponentBuilder {
		// For whatever is looking at this, this is the type of the data
		public get type(): string {
			return "animatedSprite";
		}

		public buildFromJson(json: any): IComponent {
			let data = new AnimatedSpriteComponenetData();
			data.setFromJson(json);
			return new AnimatedSpriteComponent(data);
		}
	}

	export class AnimatedSpriteComponent extends BaseComponent {

		private _autoPlay: boolean;
		private _sprite: AnimatedSprite;

		public constructor(data: AnimatedSpriteComponenetData) {
			super(data);

			this._autoPlay = data.autoPlay;

			let spriteInfo = new AnimatedSpriteInfo();
			spriteInfo.name = data.name;
			spriteInfo.materialName = data.materialName;
			spriteInfo.width = data.width;
			spriteInfo.height = data.height;
			spriteInfo.frameWidth = data.frameWidth;
			spriteInfo.frameHeight = data.frameHeight;
			spriteInfo.frameCount = data.frameCount;
			spriteInfo.frameSequence = data.frameSequence;
			spriteInfo.frameTime = data.frameTime;

			this._sprite = new AnimatedSprite(spriteInfo);
			// only run code if origin is default values
			if (!data.origin.equals(Vector3.zero)) {
				this._sprite.origin.copyFrom(data.origin);
			}
		}

		public get isPlaying(): boolean {
			return this._sprite.isPlaying;
		}

		public load(): void {
			this._sprite.load();
		}

		public updateRead(): void {
			// call stop on animation so it doesnt initiate
			if (!this._autoPlay) {
				this._sprite.stop();
			}
		}

		public update(time: number): void {
			this._sprite.update(time);

			super.update(time);
		}

		public render(shader: Shader) {
			this._sprite.draw(shader, this.owner.worldMatrix);

			super.render(shader);
		}

		public play(): void {
			this._sprite.play();
		}

		public stop(): void {
			this._sprite.stop();
		}

		public setFrame(frameNumber: number): void {
			this._sprite.setFrame(frameNumber);
		}
	}

	// as soon as file is loaded, register
	ComponentManager.registerBuilder(new AnimatedSpriteComponentBuilder());
}