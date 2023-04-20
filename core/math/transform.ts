namespace TSE {

	export class Transform {

		public position: Vector3 = Vector3.zero;

		public rotation: Vector3 = Vector3.zero;

		public scale: Vector3 = Vector3.one; // default for scale is always one

		public copyFrom(transform: Transform): void {
			this.position.copyFrom(transform.position);
			this.rotation.copyFrom(transform.rotation);
			this.scale.copyFrom(transform.scale);
		}

		public getTransformationMatrix(): Matrix4x4 {
			let translation = Matrix4x4.translation(this.position);
			let rotation = Matrix4x4.rotationXYZ(this.rotation.x, this.rotation.y, this.rotation.z);
			let scale = Matrix4x4.scale(this.scale);

			// order of multiplication does matter
			// T * R * S is the order
			return Matrix4x4.multiply(Matrix4x4.multiply(translation, rotation), scale);
		}

		// set only the values that have been defined
		public setFromJson(json: any): void {
			if (json.position !== undefined) {
				this.position.setFromJson(json.position);
			}

			if (json.rotation !== undefined) {
				this.rotation.setFromJson(json.rotation);
			}

			if (json.scale !== undefined) {
				this.scale.setFromJson(json.scale);
			}
		}
	}
}