/// <reference path="basebehavior.ts" />
/// <reference path="behaviormanager.ts" />

namespace TSE {

	export class RotationBehaviorData implements IBehaviorData {
		public name: string;

		public rotation: Vector3 = Vector3.zero;

		/* load information from json */
		public setFromJson(json: any): void {
			if (json.name === undefined) {
				throw new Error("Name must be defined in behavior data.");
			}

			this.name = String(json.name);

			// check if the rotation from json data exists and set
			if (json.rotation !== undefined) {
				this.rotation.setFromJson(json.rotation);
			}
		}
	}

	export class RotationBehaviorBuilder implements IBehaviorBuilder {
		public get type(): string {
			return "rotation";
		}

		public buildFromJson(json: any): IBehavior {
			let data = new RotationBehaviorData();
			data.setFromJson(json);
			return new RotationBehavior(data);
		}
	}

	/* handles rotation behavior of objects */
	export class RotationBehavior extends BaseBehavior {

		private _rotation: Vector3;

		public constructor(data: RotationBehaviorData) {
			super(data);

			this._rotation = data.rotation;
		}

		public update(time: number): void {
			/* basic computation for rotation */
			this._owner.transform.rotation.add(this._rotation);

			super.update(time);
		}
	}

	// auto register
	BehaviorManager.registerBuilder(new RotationBehaviorBuilder());
}