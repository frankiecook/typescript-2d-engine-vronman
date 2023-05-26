namespace TSE {
	/**
	 * _vertices: need a copy of the vertex data for this sprite
	 */
	export class Sprite {

		protected _name: string;
		protected _width: number;
		protected _height: number;
		protected _origin: Vector3 = Vector3.zero;
		
		protected _buffer: GLBuffer;
		protected _materialName: string;
		protected _material: Material;
		protected _vertices: Vertex[];

		public constructor(name: string, materialName: string, width: number = 50, height: number = 50) {
			this._name = name;
			this._width = width;
			this._height = height;
			this._materialName = materialName;
			this._material = MaterialManager.getMaterial(this._materialName);


			if (name === "grass") {
				console.log("GROUND SPRITE");
			}
		}

		public get name(): string {
			return this._name;
		}

		public get origin(): Vector3 {
			return this._origin;
		}

		public set origin(value: Vector3) {
			this._origin = value;
			// when origin is set
			this.recalculateVertices();
		}

		public get width(): number {
			return this._width;
		}

		public get height(): number {
			return this._height;
		}

		public destroy(): void {
			this._buffer.destroy();
			MaterialManager.releaseMaterial(this._materialName);
			this._material = undefined;
			this._materialName = undefined;
		}

		public load(): void {
			this._buffer = new GLBuffer();

			let positionAttribute = new AttributeInfo();
			// position attribute is always known to be the first attribute
			// for the purpose of this tutorial we will set the lcoation to 0, not dynamic intentionally
			positionAttribute.location = 0;//this._shader.getAttributeLocation("a_position");
			positionAttribute.size = 3;
			this._buffer.addAttributeLocation(positionAttribute);


			let texCoordAttribute = new AttributeInfo();
			texCoordAttribute.location = 1;
			texCoordAttribute.size = 2;
			this._buffer.addAttributeLocation(texCoordAttribute);

			this.calculateVertices();
		}

		public update(time: number): void {
			
		}

		// draw method of sprite changes to use a model instead of a position variable
		//
		public draw(shader: Shader, model: Matrix4x4): void {

			// take in a model matrix
			let modelLocation = shader.getUniformLocation("u_model");
			gl.uniformMatrix4fv(modelLocation, false, model.toFloat32Array());

			// set uniforms
			let colorLocation = shader.getUniformLocation("u_tint");
			// 4fv takes a vector of information
			gl.uniform4fv(colorLocation, this._material.tint.toFloat32Array());

			// check if the material has a diffuseTexture
			if (this._material.diffuseTexture !== undefined) {
				this._material.diffuseTexture.activateAndBind(0);
				// set up the uniform to know what texture channel to pull
				let diffuseLocation = shader.getUniformLocation("u_diffuse");
				gl.uniform1i(diffuseLocation, 0);
			} else {
				console.log("texture diffuse is undefined")
			}

			// draw to screen
			//gl.bindBuffer(gl.ARRAY_BUFFER, this._buffer);
			this._buffer.bind();
			this._buffer.draw();
		}

		protected calculateVertices(): void {
			// calculate offset from origin
			let minX = -(this._width * this._origin.x);
			let maxX = this._width * (1.0 - this._origin.x);

			let minY = -(this._height * this._origin.y);
			let maxY = this._height * (1.0 - this._origin.y);

			this._vertices = [
				// x, y, z	, u, v
				new Vertex(minX, minY, 0, 0, 0),
				new Vertex(minX, maxY, 0, 0, 1.0),
				new Vertex(maxX, maxY, 0, 1.0, 1.0),

				new Vertex(maxX, maxY, 0, 1.0, 1.0),
				new Vertex(maxX, minY, 0, 1.0, 0),
				new Vertex(minX, minY, 0, 0, 0)
			];

			for (let v of this._vertices) {
				// hey webgl, we want to pass you info
				this._buffer.pushBackData(v.toArray());
			}

			this._buffer.upload();
			this._buffer.unbind();
		}

		protected recalculateVertices(): void {
			// calculate offset from origin
			let minX = -(this._width * this._origin.x);
			let maxX = this._width * (1.0 - this._origin.x);

			let minY = -(this._height * this._origin.y);
			let maxY = this._height * (1.0 - this._origin.y);

			this._vertices[0].position.set(minX, minY);
			this._vertices[1].position.set(minX, maxY);
			this._vertices[2].position.set(maxX, maxY);
			// 3, 4, 5
			this._vertices[3].position.set(maxX, maxY);
			this._vertices[4].position.set(maxX, minY);
			this._vertices[5].position.set(minX, minY);

			this._buffer.clearData();

			for (let v of this._vertices) {
				// hey wgl, we want to pass you info
				this._buffer.pushBackData(v.toArray());
			}

			this._buffer.upload();
			this._buffer.unbind();
		}
	}
}