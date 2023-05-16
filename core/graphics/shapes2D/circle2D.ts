namespace TSE {

	export class Circle2D implements IShape2D {

		public position: Vector2 = Vector2.zero;

		// temporary fix for boundary positions
		public origin: Vector2 = Vector2.zero;

		public radius: number;

		/**
		 * retrieve offset value
		 */
		public get offset(): Vector2 {
			return new Vector2(this.radius + (this.radius * this.origin.x), this.radius + (this.radius * this.origin.y));
		}

		/**
		 * set values from json
		 * @param json
		 */
		public setFromJson(json: any): void {
			if (json.position !== undefined) {
				this.position.setFromJson(json.position);
			}

			if (json.offset !== undefined) {
				this.offset.setFromJson(json.offset);
			}

			if (json.radius === undefined) {
				throw new Error("Rectangle2D requires radius to be present.");
			}
			this.radius = Number(json.radius);
		}


		// each individual shape is responsible for knowing how to collide with other shapes
		public intersect(other: IShape2D): boolean {
			// if the distance between both circles is less than the combines radius, then collsiion
			if (other instanceof Circle2D) {
				let distance = Math.abs(Vector2.distance(other.position, this.position));
				let radiusLengths = this.radius + other.radius;
				if (distance <= radiusLengths) {
					return true;
				}
			}

			if (other instanceof Rectangle2D) {
				// check if any sides of the rectangle intersect with the circle
				let deltaX = this.position.x - Math.max(other.position.x, Math.min(this.position.x, other.position.x + other.width));
				let deltaY = this.position.y - Math.max(other.position.y, Math.min(this.position.y, other.position.y + other.width));
				if ((deltaX * deltaX + deltaY * deltaY) < (this.radius * this.radius)) {
					return true;
				}
			}

			// no colision
			return false;
		}

		// check if a point is inside the shape
		public pointInShape(point: Vector2): boolean {
			// calculate absolute distance
			let absDistance = Math.abs(Vector2.distance(this.position, point));
			if (absDistance <= this.radius) {
				return true;
			}

			// if shape is unknown then don't intersect
			return false;
		}
	}
}