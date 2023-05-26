// namespaces organize objects and class in the project
namespace TSE {

	// exporting allows us to reference the class in other files
	export class Engine implements IMessageHandler {

		private _canvas: HTMLCanvasElement;
		private _basicShader: BasicShader;

		private _projection: Matrix4x4;
		private _previousTime: number = 0;

		private _gameWidth: number;
		private _gameHeight: number;


		// typescript has three levels of scope (public, private, protected)
		// width of game in pixels
		// height of game in pixels
		public constructor(width?: number, height?: number) {
			this._gameWidth = width;
			this._gameHeight = height;
		}

		public start(): void {

			this._canvas = GLUtilities.initialize();

			// set width and height if exists
			if (this._gameWidth !== undefined && this._gameHeight !== undefined) {
				// px for CSS property
				this._canvas.style.width = this._gameWidth + "px";
				this._canvas.style.height = this._gameHeight + "px";
				this._canvas.width = this._gameWidth;
				this._canvas.height = this._gameHeight;
			}

			// initialize assets and zones
			AssetManager.initialize();
			InputManager.initialize();
			ZoneManager.initialize();

			// what color the webgl will be cleared to for every frame
			gl.clearColor(146/255, 206/255, 247/255, 1);
			gl.enable(gl.BLEND);
			gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

			this._basicShader = new BasicShader(); 
			this._basicShader.use();

			this._projection = Matrix4x4.orthographic(0, this._canvas.width, this._canvas.height, 0, -100.0, 100.0);

			// load fonts
			BitmapFontManager.addFont("default", "assets/fonts/text.txt");
			BitmapFontManager.load();

			// load materials
			MaterialManager.registerMaterial(new Material("leaves", "assets/textures/dk64-leaves.png", Color.white()));
			MaterialManager.registerMaterial(new Material("duck", "assets/textures/duck.png", Color.white()));
			MaterialManager.registerMaterial(new Material("grass", "assets/textures/grass.png", Color.white()));
			MaterialManager.registerMaterial(new Material("bg", "assets/textures/bg.png", Color.white()));
			MaterialManager.registerMaterial(new Material("end", "assets/textures/end.png", Color.white()));
			MaterialManager.registerMaterial(new Material("middle", "assets/textures/middle.png", Color.white()));

			AudioManager.loadSoundFile("flap", "assets/sounds/flap.mp3", false);
			AudioManager.loadSoundFile("ting", "assets/sounds/ting.mp3", false);
			AudioManager.loadSoundFile("dead", "assets/sounds/dead.mp3", false);

			// load
			this._projection = Matrix4x4.orthographic(0, this._canvas.width, this._canvas.height, 0, -100.0, 100.0);

			this.resize();

			// begin the preloading phase, which waits for various thingsto be loaded before starting the game
			this.preloading();
		}

		/**
		 * Resizes the canvas to fit the window
		 */
		public resize(): void {
			if (this._canvas !== undefined) {
				// default to full screen behavior
				if (this._gameWidth === undefined || this._gameHeight === undefined) {
					this._canvas.width = window.innerWidth;
					this._canvas.height = window.innerHeight;
				}

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
			}
		}

		private loop(): void {
			this.update();
			this.render();

			// runs about 60 fps, originally designed for animations 
			// .bind(this) is calling loop() for THIS instance of the engine
			requestAnimationFrame(this.loop.bind(this));
		}

		// operates on a game loop of its own but in a different state
		private preloading(): void {

			// make sure to always update the message bus
			MessageBus.update(0);

			// bitmap fonts are 'system level' and need to be running for the engine to operate
			if (!BitmapFontManager.updateReady()) {
				requestAnimationFrame(this.preloading.bind(this));
				return;
			}

			// load up our zone TODO: make this configurable
			ZoneManager.changeZone(0);

			// kick off the loop
			this.loop();
		}

		private update(): void {
			// calculate time
			// performance.now() is very accurate
			let delta = performance.now() - this._previousTime;

			MessageBus.update(delta);
			ZoneManager.update(delta);
			CollisionManager.update(delta);

			this._previousTime = performance.now();
		}

		private render(): void {
			// clears the buffer that draws the next frame of color
			// potential weird effects??
			gl.clear(gl.COLOR_BUFFER_BIT);

			ZoneManager.render(this._basicShader);

			let projectionPosition = this._basicShader.getUniformLocation("u_projection");
			gl.uniformMatrix4fv(projectionPosition, false, new Float32Array(this._projection.data));
		}
	}
}