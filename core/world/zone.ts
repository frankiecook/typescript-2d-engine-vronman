//	/// <reference path="zone.ts" />

namespace TSE {

	// state machine handles the state of object
	export enum ZoneState {
		UNINITIALIZED,
		LOADING,
		UPDATING
	}

	export class Zone {

		private _id: number;
		private _name: string;
		private _description: string;
		private _scene: Scene;
		private _state: ZoneState = ZoneState.UNINITIALIZED;
		private _globalID: number = -1;

		public constructor(id: number, name: string, description: string) {
			this._id = id;
			this._name = name;
			this._description = description;
			this._scene = new Scene();
		}

		public get id(): number {
			return this._id;
		}

		public get name(): string {
			return this._name;
		}

		public get description(): string {
			return this._description;
		}

		public get scene(): Scene {
			return this._scene;
		}

		// initialize zone after creation
		// loops through all data and determines where everything belongs
		public initialize(zoneData: any): void {
			// search for the objects
			if (zoneData.objects === undefined) {
				throw new Error("zone initialization error: objects not present.");
			}

			// loop through the objects
			for (let o in zoneData.objects) {
				let obj = zoneData.objects[o];

				this.loadSimObject(obj, this._scene.root);
			}
		}

		public load(): void {
			this._state = ZoneState.LOADING;

			this._scene.load();
			this._scene.root.updateReady();

			this._state = ZoneState.UPDATING;
		}

		public unload(): void {

		}

		public update(time: number) {
			// CHECK for the correct state
			if (this._state === ZoneState.UPDATING) {
				this._scene.update(time);
			}

		}

		public render(shader: Shader): void {
			if (this._state === ZoneState.UPDATING) {
				this._scene.render(shader);
			}
		}

		public onActivated(): void {

		}

		public onDeactivated(): void {

		}

		// useful for recursively laoding all objects in a scene from the parent object
		// reference to parent so properties can be inherited
		// children objects are top level and need to maintain their family tree
		private loadSimObject(dataSection: any, parent: SimObject): void {
			let name: string;
			if (dataSection.name !== undefined) {
				name = String(dataSection.name);
			}

			this._globalID++;
			// recursively loads children and objects
			let simObject = new SimObject(this._globalID, name, this._scene);

			// add transform data
			if (dataSection.transform !== undefined) {
				simObject.transform.setFromJson(dataSection.transform);
			}

			// load coditions for components
			if (dataSection.components !== undefined) {
				for (let c in dataSection.components) {
					let data = dataSection.components[c];
					let component = ComponentManager.extractComponent(data);

					simObject.addComponent(component);
				}
			}

			// load behaviors
			if (dataSection.behaviors !== undefined) {
				for (let b in dataSection.behaviors) {
					let data = dataSection.behaviors[b];
					let behavior = BehaviorManager.extractBehavior(data);

					simObject.addBehavior(behavior);
				}
			}

			// check for children and load them as simobjects
			if (dataSection.children !== undefined) {
				// loop through the children
				for (let o in dataSection.children) {
					let obj = dataSection.children[o];
					this.loadSimObject(obj, simObject);
				}
			}

			// attach the child to parent
			if (parent !== undefined) {
				parent.addChild(simObject);
			}
		}
	}
}