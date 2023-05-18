/// <reference path="componentmanager.ts" />

namespace TSE {

	export class SpriteComponenetData implements IComponentData {
		public name: string;
		public materialName: string;
		public origin: Vector3 = Vector3.zero;
		public width: number;
		public height: number;

		public setFromJson(json: any): void {
			if (json.name !== undefined) {
				this.name = String(json.name);
			}

			if (json.width !== undefined) {
				this.width = Number(json.width);
			}

			if (json.height !== undefined) {
				this.height = Number(json.height);
			}

			if (json.materialName !== undefined) {
				this.materialName = String(json.materialName);
			}

			// set origin from json
			if (json.origin !== undefined) {
				this.origin.setFromJson(json.origin);
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
		private _width: number;
		private _height: number;

		public constructor(data: SpriteComponenetData) {
			super(data);

			this._width = data.width;
			this._height = data.height;
			this._sprite = new Sprite(name, data.materialName, this._width, this._height);

			// only run code if origin is default values
			if (!data.origin.equals(Vector3.zero)) {
				this._sprite.origin.copyFrom(data.origin);
			}
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