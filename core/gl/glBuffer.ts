namespace TSE {

	// treating this class a struct because typescript/js does not have structs
	export class AttributeInfo {
		// location of attribute, size (number of elements) in attribute, number of elements from the beginning of buffer
		public location: number;
		public size: number;
		public offset: number;
	}

	export class GLBuffer {
		// class needs to be set up to take in multiple types of data

		private _hasAttributeLocation: boolean;
		private _elementSize: number;
		private _stride: number;
		private _buffer: WebGLBuffer;

		private _targetBufferType: number;
		private _dataType: number;
		private _mode: number;
		private _typeSize: number;

		private _data: number[] = [];
		private _attributes: AttributeInfo[] = [];
		private _totalOffset: number = 0;

		/**
		 * creates a new buffer
		 * @param elementSize size of each element in this buffer
		 * @param dataType the data type of this buffer. default: gl.FLOAT
		 * @param targetBufferType buffer target type. can be either gl.ARRAY_BUFFER or gl.ELEMENT_ARRAY_BUFFER. Default: gl.ARRAY_BUFFER
		 * @param mode drawing mode of this buffer. default: gl.TRIANGLES
		 */
		public constructor(dataType: number = gl.FLOAT, targetBufferType: number = gl.ARRAY_BUFFER, mode: number = gl.TRIANGLES) {
			this._elementSize = 0;
			this._dataType = dataType;
			this._targetBufferType = targetBufferType
			this._mode = mode;

			// determine byte size
			// something you do no want to think about
			switch (this._dataType) {
				case gl.FLOAT:
				case gl.INT:
				case gl.UNSIGNED_INT:
					this._typeSize = 4;
					break;
				case gl.SHORT:
				case gl.UNSIGNED_SHORT:
					this._typeSize = 2;
					break;
				case gl.BYTE:
				case gl.UNSIGNED_BYTE:
					this._typeSize = 1;
					break;
				default:
					throw new Error("Unrecognized data type: " + dataType.toString());
			}

			this._buffer = gl.createBuffer();
		}

		public destroy(): void {
			gl.deleteBuffer(this._buffer);
		}

		// normalized indicated if the data should be normalized
		public bind(normalized: boolean = false): void {
			gl.bindBuffer(this._targetBufferType, this._buffer);

			// attributes hold information to pass into the buffer
			if (this._hasAttributeLocation) {
				for (let it of this._attributes) {
					gl.vertexAttribPointer(it.location, it.size, this._dataType, normalized, this._stride, it.offset * this._typeSize);
					gl.enableVertexAttribArray(it.location);
				}
			}
		}

		public unbind(): void {
			// disable each attribute
			for (let it of this._attributes) {
				gl.disableVertexAttribArray(it.location);
			}

			gl.bindBuffer(this._targetBufferType, undefined);
		}

		/**
		 * adds an attribute witht the provided information
		 * @param info
		 */
		public addAttributeLocation(info: AttributeInfo): void {
			this._hasAttributeLocation = true;
			info.offset = this._elementSize;
			this._attributes.push(info);
			this._elementSize += info.size;
			// stride is equal to how big the element is times the size of the element
			this._stride = this._elementSize * this._typeSize;
		}

		/**
		 * replaces the current data in this buffer with the provided data
		 * @param data data to be loaded in this buffer
		 */
		public setData(data: number[]): void {
			this.clearData();
			this.pushBackData(data);
		}

		/**
		 * add data to this buffer
		 * @param data
		 */
		public pushBackData(data: number[]): void {
			for (let d of data) {
				this._data.push(d);
			}
		}

		/**
		 * clears out all data in this buffer
		 */
		public clearData(): void {
			this._data.length = 0;
		}

		/**
		 * upload data to GPU (want to run this one time)
		 */
		public upload(): void {
			gl.bindBuffer(this._targetBufferType, this._buffer);

			let bufferData: ArrayBuffer;
			switch (this._dataType) {
				case gl.FLOAT:
					bufferData = new Float32Array(this._data);
					break;
				case gl.INT:
					bufferData = new Int32Array(this._data);
					break;
				case gl.UNSIGNED_INT:
					bufferData = new Uint32Array(this._data);
					break;
				case gl.SHORT:
					bufferData = new Int16Array(this._data);
					break;
				case gl.UNSIGNED_SHORT:
					bufferData = new Uint16Array(this._data);
					break;
				case gl.BYTE:
					bufferData = new Int16Array(this._data);
					break;
				case gl.UNSIGNED_BYTE:
					bufferData = new Uint8Array(this._data);
					break;
			}

			gl.bufferData(this._targetBufferType, bufferData, gl.STATIC_DRAW);
		}

		/**
		 * draws the buffer
		 */
		public draw(): void {
			if (this._targetBufferType === gl.ARRAY_BUFFER) {
				// total element count is length of data divided by the element size
				gl.drawArrays(this._mode, 0, this._data.length / this._elementSize);
			} else if (this._targetBufferType === gl.ELEMENT_ARRAY_BUFFER) {
				gl.drawElements(this._mode, this._data.length, this._dataType, 0);
			}
		}
	}
}