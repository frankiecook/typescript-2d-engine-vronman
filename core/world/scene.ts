namespace TSE {


	export class Scene {

		// one simobject that is present for all other simobjects
		private _root: SimObject;

		public constructor() {
			// pass this so we automatically have the scene attached to the root object
			this._root = new SimObject(0, "__ROOT__", this);
		}

		public get root(): SimObject {
			return this._root;
		}

		public get isLoaded(): boolean {
			return this._root.isLoaded;
		}

		public addObject(object: SimObject): void {
			this._root.addChild(object);
		}

		// should be used lightly if the scene holds a lot of objects due to recursive nature
		public getObjectByName(name: string): SimObject {
			return this._root.getObjectByName(name);
		}

		public load(): void {
			this._root.load();
		}

		public update(time: number): void {
			this._root.update(time);
		}

		public render(shader: Shader): void {
			this._root.render(shader);
		}
	}
}