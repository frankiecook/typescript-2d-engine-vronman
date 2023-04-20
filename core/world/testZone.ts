////< reference path="../world/zone.ts" />
/////<reference path="../world/zone.ts" />

//namespace TSE {

//	export class TestZone extends Zone {

//		private _parentObject: SimObject;
//		private _testObject: SimObject;
//		private _parentSprite: SpriteComponent;
//		private _testSprite: SpriteComponent;
		
//		public load(): void {
//			this._parentObject = new SimObject(0, "parentObject");
//			this._parentObject.transform.position.x = 300;
//			this._parentObject.transform.position.y = 300;
//			this._parentSprite = new SpriteComponent("test", "leaves");
//			this._parentObject.addComponent(this._parentSprite);

//			this._testObject = new SimObject(1, "testObject");
//			this._testSprite = new SpriteComponent("test", "leaves");
//			this._testObject.addComponent(this._testSprite);

//			this._testObject.transform.position.x = 120;
//			this._testObject.transform.position.y = 120;

//			// add child to parent object
//			this._parentObject.addChild(this._testObject);

//			// add object to the scene
//			this.scene.addObject(this._parentObject);
//			console.log(this._parentObject.parent);
//			console.log(this._testObject.parent);
//			super.load();
//		}

//		public update(time: number): void {

//			this._testObject.transform.rotation.z += 0.01;
//			this._parentObject.transform.rotation.z += 0.01;

//			super.update(time);
//		}
//	}
//}