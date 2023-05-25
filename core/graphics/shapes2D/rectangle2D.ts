namespace TSE {

	export class Rectangle2D implements IShape2D {

		public position: Vector2 = Vector2.zero;

		// temporary fix for boundary positions
		public origin: Vector2 = Vector2.zero;

		public width: number;

		public height: number;

		/**
		 * provide offset value
		 */
		public get offset(): Vector2 {
			return new Vector2((this.width * this.origin.x), (this.height * this.origin.y));
		}

		public setFromJson(json: any): void {
			if (json.position !== undefined) {
				this.position.setFromJson(json.position);
			}

			if (json.offset !== undefined) {
				this.offset.setFromJson(json.offset);
			}

			if (json.width === undefined) {
				throw new Error("Rectangle2D requires width to be present.");
			}
			this.width = Number(json.width);

			if (json.height === undefined) {
				throw new Error("Rectangle2D requires width to be present.");
			}
			this.height = Number(json.height);
		}

		// each individual shape is responsible for knowing how to collide with other shapes
		public intersect(other: IShape2D): boolean {
			// case when other shape is rectangle
			if (other instanceof Rectangle2D) {

				// check if any of the four corners of the bounding rectangle intersect
				return (this.pointInShape(other.position) ||
					this.pointInShape(new Vector2(other.position.x + other.width, other.position.y)) ||
					this.pointInShape(new Vector2(other.position.x + other.width, other.position.y + other.height)) ||
					this.pointInShape(new Vector2(other.position.x, other.position.y + other.height)))
			}

			if (other instanceof Circle2D) {
				let deltaX = other.position.x - Math.max(this.position.x, Math.min(other.position.x, this.position.x + this.width));
				let deltaY = other.position.y - Math.max(this.position.y, Math.min(other.position.y, this.position.y + this.height));
				if ((deltaX * deltaX + deltaY * deltaY) < (other.radius * other.radius)) {
					return true;
				}
			}

			return false;
		}

		// check if a point is inside the shape
		public pointInShape(point: Vector2): boolean {

			let x = this.width < 0 ? this.position.x - this.width : this.position.x;
			let y = this.width < 0 ? this.position.y - this.width : this.position.y;

			let extentX = this.width < 0 ? this.position.x : this.position.x + this.width;
			let extentY = this.width < 0 ? this.position.y : this.position.y + this.width;

			if (point.x >= x && point.x <= extentX && point.y >= y && point.y <= extentY) {
				return true;
			}
				
			// if shape is unknown then don't intersect
			return false;
		}
	}
}