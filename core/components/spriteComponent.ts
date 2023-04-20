/// <reference path="componentmanager.ts" />

namespace TSE {

	export class SpriteComponenetData implements IComponentData {
		public name: string;
		public materialName: string;

		public setFromJson(json: any): void {
			if (json.name !== undefined) {
				this.name = String(json.name);
			}

			if (json.materialName !== undefined) {
				this.materialName = String(json.materialName);
			}
		}
	}

	/**
	 * construct a componenet using the data read from JSON
	 * built indepedently of all pieces to allow for any number of componentst to be created
	 */
	export class SpriteComponentBuilder implements IComponentBuilder {
		// For whatever is looking at this, this is the type of the data
		public get type(): string {
			return "sprite";
		}

		public buildFromJson(json: any): IComponent {
			let data = new SpriteComponenetData();
			data.setFromJson(json);
			return new SpriteComponent(data);
		}
	}

	export class SpriteComponent extends BaseComponent {

		private _sprite: Sprite;

		public constructor(data: SpriteComponenetData) {
			super(data);

			this._sprite = new Sprite(name, data.materialName);
		}

		public load(): void {
			this._sprite.load();
		}

		public render(shader: Shader) {
			this._sprite.draw(shader, this.owner.worldMatrix);

			super.render(shader);
		}
	}

	// as soon as file is loaded, register
	ComponentManager.registerBuilder(new SpriteComponentBuilder());
}