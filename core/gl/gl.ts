namespace TSE {

	// public variable referencing this context of webgl
	export var gl: WebGLRenderingContext;

	/**
	 * Responsible for setting up a WebGL rendering context
	 */
	export class GLUtilities {

		/**
		 * Initializes Webgl, potentially using the canvas with an assigned id matching the provided if it is defined
		 * @param elementId The id of the element to search for
		 */
		// static does not need an object of the class to be called
		// Example, GLUtilities.initialize();
		public static initialize(elementId?: string): HTMLCanvasElement {
			let canvas: HTMLCanvasElement;

			if (elementId !== undefined) {
				// casting converts from one type to a similar type
				canvas = document.getElementById(elementId) as HTMLCanvasElement;

				if (canvas === undefined) {
					throw new Error("cannot find a canvas element neamed:" + elementId);
				}
			} else {
				canvas = document.createElement("canvas") as HTMLCanvasElement;
				document.body.appendChild(canvas);
			}

			gl = canvas.getContext("webgl");
			if (gl === undefined) {
				throw new Error("Unable to initialize WebGL!");
			}

			return canvas;
		}
	}
}