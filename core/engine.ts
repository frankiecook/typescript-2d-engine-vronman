// namespaces organize objects and class in the project
namespace TSE {

	// exporting allows us to reference the class in other files
	export class Engine implements IMessageHandler {

		private _canvas: HTMLCanvasElement;
		private _basicShader: BasicShader;

		private _projection: Matrix4x4;
		private _previousTime: number = 0;

		// typescript has three levels of scope (public, private, protected)
		public constructor() {

		}

		public start(): void {

			this._canvas = GLUtilities.initialize();

			// initialize assets and zones
			AssetManager.initialize();
			InputManager.initialize();
			ZoneManager.initialize();

			Message.subscribe("MOUSE_UP", this);

			// what color the webgl will be cleared to for every frame
			gl.clearColor(0, 0, 0, 1);
			gl.enable(gl.BLEND);
			gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

			this._basicShader = new BasicShader(); 
			this._basicShader.use();

			this._projection = Matrix4x4.orthographic(0, this._canvas.width, this._canvas.height, 0, -100.0, 100.0);

			// load materials
			MaterialManager.registerMaterial(new Material("leaves", "assets/textures/dk64-leaves.png", Color.white()));
			MaterialManager.registerMaterial(new Material("cat", "assets/textures/bird.png", Color.white()));

			AudioManager.loadSoundFile("flap", "assets/sounds/birdflap.mp3", false);

			// load
			this._projection = Matrix4x4.orthographic(0, this._canvas.width, this._canvas.height, 0, -100.0, 100.0);

			// TEMPORARY
			ZoneManager.changeZone(0);

			this.resize();
			this.loop();
		}

		/**
		 * Resizes the canvas to fit the window
		 */
		public resize(): void {
			if (this._canvas !== undefined) {
				this._canvas.width = window.innerWidth;
				this._canvas.height = window.innerHeight;

				// tells webgl to use the full range of the viewport
				gl.viewport(0, 0, this._canvas.width, this._canvas.height);

				// give webgl a reference for the maximum area of the screen
				gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
				this._projection = Matrix4x4.orthographic(0, this._canvas.width, this._canvas.height, 0, -100.0, 100.0);
			}
		}

		public onMessage(message: Message): void {
			if (message.code === "MOUSE_UP") {
				let context = message.context as MouseContext;
				document.title = 'Pos: [String(context.position.x},${context.position.y}]';

				AudioManager.playSound('flap');
			}
		}

		private loop(): void {
			this.update();
			this.render();
		}

		private update(): void {
			// calculate time
			// performance.now() is very accurate
			let delta = performance.now() - this._previousTime;

			MessageBus.update(delta);
			ZoneManager.update(delta);

			this._previousTime = performance.now();
		}

		private render(): void {
			// clears the buffer that draws the next frame of color
			// potential weird effects??
			gl.clear(gl.COLOR_BUFFER_BIT);

			ZoneManager.render(this._basicShader);

			let projectionPosition = this._basicShader.getUniformLocation("u_projection");
			gl.uniformMatrix4fv(projectionPosition, false, new Float32Array(this._projection.data));

			// runs about 60 fps, originally designed for animations 
			// .bind(this) is calling loop() for THIS instance of the engine
			requestAnimationFrame(this.loop.bind(this));
		}
	}
}