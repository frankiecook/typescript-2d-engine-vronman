/// <reference path="componentManager.ts" />

namespace TSE {

	export class CollisionComponentData implements IComponentData {
		public name: string;
		public shape: IShape2D;
		public static: boolean = true;

		public setFromJson(json: any): void {
			if (json.name !== undefined) {
				this.name = String(json.name);
			}

			if (json.static !== undefined) {
				this.static = Boolean(json.static);
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
		private _static: boolean;
		private _debugSprite: Sprite;
		private _debugMaterialName: string = "redborder";
		private _debugHeight: number;
		private _debugWidth: number;

		public constructor(data: CollisionComponentData) {
			super(data);

			this._shape = data.shape;
			this._static = data.static;
		}

		public get shape(): IShape2D {
			return this._shape;
		}

		public get isStatic(): boolean {
			return this._static;
		}

		public set debugWidth(width: number) {
			this._debugWidth = width;
		}

		public set debugHeight(height: number) {
			this._debugHeight = height;
		}

		public load(): void {
			super.load();

			// TODO: update this to handle nested objects
			this._shape.position.copyFrom(this.owner.getWorldPosition().toVector2().subtract(this._shape.offset));

			// debug sprite
			if (this._shape instanceof Rectangle2D) {
				this.debugHeight = this._shape.height;
				this.debugWidth = this._shape.width;
			}
			this._debugSprite = new Sprite("debugSprite", this._debugMaterialName, this._debugWidth, this._debugHeight);
			this._debugSprite.origin.copyFrom(this._shape.origin.toVector3());
			this._debugSprite.load();

			// tell the collision manager that we exist
			CollisionManager.registerCollisionComponent(this);
		}

		/**
		 * Grab the shape's position and add to the owner's transform position
		 * @returns
		 */
		public update(time: number): void {

			if (this.owner.name === "duck") {
				//console.log("DUCK COLLISIONCOMPONENT UPDATE");
				this._shape.origin.x = 0.5;
				this._shape.origin.y = 0.5;
				this._shape.position.copyFrom(this.owner.getWorldPosition().toVector2().subtract(this._shape.offset));
			} else {
				this._shape.position.copyFrom(this.owner.getWorldPosition().toVector2().subtract(this._shape.offset));
			}

			// TODO: update this to handle nested objects
			//this._shape.position.copyFrom(this.owner.getWorldPosition().toVector2().subtract(this._shape.offset));

			// debug sprite
			this._debugSprite.origin.copyFrom(this.owner.getWorldPosition().subtract(this._shape.offset.toVector3()));

			super.update(time);
		}

		//** Collision boxes do not render, except for debugging */
		public render(shader: Shader) {
			//this._debugSprite.draw(shader, this.owner.worldMatrix);

			super.render(shader);
		}

		public onCollisionEntry(other: CollisionComponent): void {
			//console.log("onCollisionEntry: ", this, other);
		}

		public onCollisionUpdate(other: CollisionComponent): void {
			//console.log("onCollisionUpdate: ", this, other);
		}

		public onCollisionExit(other: CollisionComponent): void {
			//console.log("onCollisionExit: ", this, other);
		}
	}

	// as soon as file is loaded, register
	ComponentManager.registerBuilder(new CollisionComponentBuilder());
}