namespace TSE {

	export class Vector2 {

		private _x: number;
		private _y: number;

		public constructor(x: number = 0, y: number = 0) {
			this._x = x;
			this._y = y;
		}

		public get x(): number {
			return this._x;
		}

		public set x(value: number) {
			this._x = value;
		}

		public get y(): number {
			return this._y;
		}

		public set y(value: number) {
			this._y = value;
		}

		// you DO NOT want to create this returned vector statically and simply return it
		// if you did, then the same reference would be used all over the code
		public static get zero(): Vector2 {
			return new Vector2();
		}

		public static get one(): Vector2 {
			return new Vector2(1, 1);
		}

		public copyFrom(v: Vector2): void {
			this._x = v._x;
			this._y = v._y;
		}

		public toArray(): number[] {
			return [this._x, this._y];
		}

		public toFloat32Array(): Float32Array {
			return new Float32Array(this.toArray());
		}

		// set only the values that have been defined
		public setFromJson(json: any): void {
			if (json.x !== undefined) {
				this._x = Number(json.x);
			}

			if (json.y !== undefined) {
				this._y = Number(json.y);
			}
		}
	}
}