namespace TSE {

	export class SimObject {

		private _id: number;
		private _children: SimObject[] = [];
		private _parent: SimObject;
		private _isLoaded: boolean = false;
		private _scene: Scene;
		private _components: IComponent[] = [];
		private _behaviors: IBehavior[] = [];

		private _localMatrix: Matrix4x4 = Matrix4x4.identity();
		private _worldMatrix: Matrix4x4 = Matrix4x4.identity();


		public name: string;

		public transform: Transform = new Transform();

		public constructor(id: number, name: string, scene?: Scene) {
			this._id = id;
			this.name = name;
			this._scene = scene;
		}

		public get id(): number {
			return this._id;
		}

		public get parent(): SimObject {
			return this._parent;
		}

		public get worldMatrix(): Matrix4x4 {
			return this._worldMatrix;
		}

		public get isLoaded(): boolean {
			return this._isLoaded;
		}

		public addChild(child: SimObject): void {
			child._parent = this;
			this._children.push(child);
			this.onAdded(this._scene);
		}

		// check to make sure the given child is actually a child of the object
		public removeChild(child: SimObject): void {
			let index = this._children.indexOf(child);
			if (index !== -1) {
				child._parent = undefined;
				this._children.splice(index, 1);
			}
		}

		/**
		 * Recursively searches for component names
		 */
		public getComponentByName(name: string): IComponent {
			for (let component of this._components) {
				//let result = child.getObjectByName(name);
				if (component.name === name) {
					return component;
				}
			}

			for (let child of this._children) {
				let component = child.getComponentByName(name);
				if (component !== undefined) {
					return component;
				}
			}

			return undefined;
		}

		/**
		 * Recursively searches for behavior names
		 */
		public getBehaviorByName(name: string): IBehavior {
			for (let behavior of this._behaviors) {
				//let result = child.getObjectByName(name);
				if (behavior.name === name) {
					return behavior;
				}
			}

			for (let child of this._children) {
				let behavior = child.getBehaviorByName(name);
				if (behavior !== undefined) {
					return behavior;
				}
			}

			return undefined;
		}

		/**
		 * recursively searches for the object
		 */
		public getObjectByName(name: string): SimObject {
			// if the curren object is the one being searched for return it
			if (this.name === name) {
				return this;
			}

			for (let child of this._children) {
				let result = child.getObjectByName(name);
				if (result !== undefined) {
					return result;
				}
			}
		}

		public addComponent(component: IComponent): void {
			this._components.push(component);
			component.setOwner(this);
		}

		// add a behavior componenet to engine
		public addBehavior(behavior: IBehavior): void {
			this._behaviors.push(behavior);
			behavior.setOwner(this);
		}

		public load(): void {
			this._isLoaded = true;

			// load all components
			for (let c of this._components) {
				c.load();
			}

			// recursively check that children are loaded
			for (let c of this._children) {
				c.load();
			}
		}

		public updateReady(): void {
			for (let c of this._components) {
				c.updateReady();
			}

			// update behaviors
			for (let b of this._behaviors) {
				b.updateReady();
			}

			for (let c of this._children) {
				c.updateReady();
			}
		}

		/**
		 * recursively update children
		 */
		public update(time: number): void {

			// matrix math, update matrices
			// getting the transformation matrix is not something you want to do on every cycle
			// if the parent is not undefined then pass the parent world matrix
			this._localMatrix = this.transform.getTransformationMatrix();
			this.updateWorldMatrix((this._parent !== undefined) ? this._parent.worldMatrix : undefined);

			for (let c of this._components) {
				c.update(time);
			}

			// update behaviors
			for (let b of this._behaviors) {
				b.update(time);
			}

			for (let c of this._children) {
				c.update(time);
			}
		}

		/**
		 * recursivley update children
		 */
		public render(shader: Shader): void {
			for (let c of this._components) {
				c.render(shader);
			}

			for (let c of this._children) {
				c.render(shader);
			}
		}

		// protected becuase if any classes override simobject then they should take advantage of this
		// called when a new child is added
		protected onAdded(scene: Scene): void {
			this._scene = scene;
		}

		// magic for object heirachy
		private updateWorldMatrix(parentWorldMatrix: Matrix4x4): void {
			// if has a parent
			if (parentWorldMatrix !== undefined) {
				this._worldMatrix = Matrix4x4.multiply(parentWorldMatrix, this._localMatrix);
			} else {
				// use local transformation matrix
				this._worldMatrix.copyFrom(this._localMatrix);
			}
		}
	}
}