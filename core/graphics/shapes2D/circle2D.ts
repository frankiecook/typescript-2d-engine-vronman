namespace TSE {

	export class Circle2D implements IShape2D {

		public position: Vector2 = Vector2.zero;

		// temporary fix for boundary positions
		public offset: Vector2 = Vector2.zero;

		public radius: number;

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

			/**MISSING COLLISION INSTANCE OF RECTANGLES*/

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