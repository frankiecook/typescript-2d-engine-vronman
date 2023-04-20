/// <reference path="componentmanager.ts" />
/// <reference path="basecomponent.ts" />
/// <reference path="spritecomponent.ts" />

namespace TSE {

	export class AnimatedSpriteComponenetData extends SpriteComponenetData implements IComponentData {

		public frameWidth: number;
		public frameHeight: number;
		public frameCount: number;
		public frameSequence: number[] = [];

		// require all above properties to be present
		public setFromJson(json: any): void {
			super.setFromJson(json);


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

		private _sprite: AnimatedSprite;

		public constructor(data: AnimatedSpriteComponenetData) {
			super(data);

			this._sprite = new AnimatedSprite(name, data.materialName, data.frameWidth, data.frameHeight, data.frameWidth, data.frameHeight, data.frameCount, data.frameSequence);
		}

		public load(): void {
			this._sprite.load();
		}

		public update(time: number): void {
			this._sprite.update(time);

			super.update(time);
		}

		public render(shader: Shader) {
			this._sprite.draw(shader, this.owner.worldMatrix);

			super.render(shader);
		}
	}

	// as soon as file is loaded, register
	ComponentManager.registerBuilder(new AnimatedSpriteComponentBuilder());
}