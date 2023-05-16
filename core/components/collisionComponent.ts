/// <reference path="componentmanager.ts" />

namespace TSE {

	export class CollisionComponentData implements IComponentData {
		public name: string;
		public shape: IShape2D;

		public setFromJson(json: any): void {
			if (json.name !== undefined) {
				this.name = String(json.name);
			}

			// check if shape exists
			if (json.shape === undefined) {
				throw new Error("CollisionComponenetData requires 'shape' to be present.");
			} else {
				// check if type of shape exist (rectangle, circle, etc.)
				if (json.shape.type === undefined) {
					throw new Error("CollsiionComponentData requires 'shape.type' to be present.");
				}

				let shapeType: string = String(json.shape.type).toLowerCase();
				switch (shapeType) {
					case "rectangle":
						this.shape = new Rectangle2D();
						break;
					case "circle":
						this.shape = new Circle2D();
						break;
					default:
						throw new Error("Unsupported shape type: '" + shapeType + ";.");
				}
			}

			this.shape.setFromJson(json.shape);
		}
	}

	/**
	 * construct a componenet using the data read from JSON
	 * built indepedently of all pieces to allow for any number of componentst to be created
	 */
	export class CollisionComponentBuilder implements IComponentBuilder {
		// For whatever is looking at this, this is the type of the data
		public get type(): string {
			return "collision";
		}

		public buildFromJson(json: any): IComponent {
			let data = new CollisionComponentData();
			data.setFromJson(json);
			return new CollisionComponent(data);
		}
	}

	export class CollisionComponent extends BaseComponent {

		private _shape: IShape2D;

		public constructor(data: CollisionComponentData) {
			super(data);

			this._shape = data.shape;
		}

		public get shape(): IShape2D {
			return this._shape;
		}

		public load(): void {
			super.load();

			// TODO: update this to handle nested objects
			this._shape.position.copyFrom(this.owner.transform.position.toVector2().add(this._shape.offset));

			// tell the collision manager that we exist
			CollisionManager.registerCollisionComponent(this);
		}

		/**
		 * Grab the shape's position and add to the owner's transform position
		 * @returns
		 */
		public update(time: number): void {

			// TODO: update this to handle nested objects
			this._shape.position.copyFrom(this.owner.transform.position.toVector2().add(this._shape.offset));

			super.update(time);
		}

		//** Collsiion boxes do not render, except for debugging */
		public render(shader: Shader) {
			//this._sprite.draw(shader, this.owner.worldMatrix);

			super.render(shader);
		}

		public onCollisionEntry(other: CollisionComponent): void {
			console.log("onCollisionEntry: ", this, other);
		}

		public onCollisionUpdate(other: CollisionComponent): void {
			console.log("onCollisionUpdate: ", this, other);
		}

		public onCollisionExit(other: CollisionComponent): void {
			console.log("onCollisionExit: ", this, other);
		}
	}

	// as soon as file is loaded, register
	ComponentManager.registerBuilder(new CollisionComponentBuilder());
}