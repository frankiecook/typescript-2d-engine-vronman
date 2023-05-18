namespace TSE {

	// can not create an instance of an abstract class
	export abstract class Shader {

		// is for indetifying the shader if more than one exist
		private _name: string;
		private _program: WebGLProgram;

		private _attributes: { [name: string]: number } = {}; // hash pair
		private _uniforms: { [name: string]: WebGLUniformLocation } = {};

		/**
		 * creates a new shader
		 * @param vertexSource source of vs
		 * @param fragmentSource source of fs
		 */
		public constructor(name: string) {
			this._name = name;
		}

		/**Name of the shader */
		public get name(): string {
			return this._name
		}

		/**
		 * tell webgl we want to use the shader
		 */
		public use(): void {
			gl.useProgram(this._program);
		}

		/**
		 * gets the location of an attribute witht the provided name
		 */
		public getAttributeLocation(name: string): number {
			if (this._attributes[name] === undefined) {
				console.log(this._attributes);
				throw new Error('Unable to find attribute named:' + name + " All attributes:" + this._attributes[0]);
			}

			return this._attributes[name];
		}

		/**
	 * gets the location of an uniform witht he provided name
	 */
		public getUniformLocation(name: string): WebGLUniformLocation {
			if (this._uniforms[name] === undefined) {
				console.log(this._uniforms);
				throw new Error('Unable to find uniform named:' + name + " All attributes:");
			}

			return this._uniforms[name];
		}

		protected load(vertexSource: string, fragmentSource: string): void {
			let vertexShader = this.loadShader(vertexSource, gl.VERTEX_SHADER);
			let fragmentShader = this.loadShader(fragmentSource, gl.FRAGMENT_SHADER);

			this.createProgram(vertexShader, fragmentShader);
			this.detectAttributes();
			this.detectUniforms();
		}

		// loads up one of the shaders and compiles it
		private loadShader(source: string, shaderType: number): WebGLShader {
			let shader: WebGLShader = gl.createShader(shaderType);

			gl.shaderSource(shader, source);
			gl.compileShader(shader);
			let error = gl.getShaderInfoLog(shader).trim();
			if (error !== "") {
				throw new Error("Error compiling shader: " + this._name + ":" + error);
			}

			return shader;
		}

		private createProgram(vertexShader: WebGLShader, fragmentShader: WebGLShader): void {
			this._program = gl.createProgram(); // reserve a program for us

			gl.attachShader(this._program, vertexShader);
			gl.attachShader(this._program, fragmentShader);

			gl.linkProgram(this._program);

			let error = gl.getProgramInfoLog(this._program).trim();
			if (error !== "") {
				throw new Error("Error linking shader: " + this._name + ":" + error);
			}
		}

		/**
		 * find all attributes and their respective locations
		 */
		private detectAttributes(): void {
			// retrives a count of all the attributes in shader
			let attributeCount = gl.getProgramParameter(this._program, gl.ACTIVE_ATTRIBUTES);
			for (let i = 0; i < attributeCount; ++i) {
				// attribute information
				let info: WebGLActiveInfo = gl.getActiveAttrib(this._program, i);
				if (!info) {
					break;
				}

				this._attributes[info.name] = gl.getAttribLocation(this._program, info.name);
			}
		}

		/**
		 * find all uniforms and their respective locations
		 */
		private detectUniforms(): void {
			// retrives a count of all the attributes in shader
			let uniformCount = gl.getProgramParameter(this._program, gl.ACTIVE_UNIFORMS);
			for (let i = 0; i < uniformCount; ++i) {
				// attribute information
				let info: WebGLActiveInfo = gl.getActiveUniform(this._program, i);
				if (!info) {
					break;
				}

				this._uniforms[info.name] = gl.getUniformLocation(this._program, info.name);
			}
		}
	}
}