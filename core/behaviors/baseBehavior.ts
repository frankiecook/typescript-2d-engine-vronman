namespace TSE {

	export abstract class BaseBehavior implements IBehavior {
		public name: string;

		protected _data: IBehaviorData;
		protected _owner: SimObject;

		public constructor(data: IBehaviorData) {
			this._data = data;
			this.name = this._data.name;
		}

		public setOwner(owner: SimObject): void {
			this._owner = owner;
		}

		public updateReady(): void {

		}

		public update(time: number): void {

		}

		/* Behavior should be applied to the attached object 
		* any data can be passed in and the behavior should know how to handle
		*/
		public apply(userData: any): void {

		}
	}
}