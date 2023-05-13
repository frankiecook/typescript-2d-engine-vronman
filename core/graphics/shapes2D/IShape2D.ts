namespace TSE {

	export interface IShape2D {

		position: Vector2;

		// temporary fix for boundary positions
		offset: Vector2;

		setFromJson(json: any): void;

		intersect(shape: IShape2D): boolean;

		pointInShape(point: Vector2): boolean;
	}
}