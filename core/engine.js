// namespaces organize objects and class in the project
var TSE;
(function (TSE) {
    // exporting allows us to reference the class in other files
    var Engine = /** @class */ (function () {
        // typescript has three levels of scope (public, private, protected)
        // width of game in pixels
        // height of game in pixels
        function Engine(width, height) {
            this._previousTime = 0;
            this._isFirstUpdate = true;
            this._gameWidth = width;
            this._gameHeight = height;
        }
        Engine.prototype.start = function (elementName) {
            // temporayily removed
            console.log(elementName);
            this._canvas = document.getElementById(elementName);//GLUtilities.initialize("glcanvas");

            // set width and height if exists
            if (this._gameWidth !== undefined && this._gameHeight !== undefined) {
                // px for CSS property
                this._aspect = this._gameWidth / this._gameHeight;
            }
            // initialize assets and zones
            AssetManager.initialize();
            InputManager.initialize(this._canvas);
            ZoneManager.initialize();

            // what color the webgl will be cleared to for every frame
            gl.clearColor(146 / 255, 206 / 255, 247 / 255, 1);
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

            MaterialManager.registerMaterial(new Material("playbtn", "assets/textures/playbtn.png", Color.white()));
            MaterialManager.registerMaterial(new Material("restartbtn", "assets/textures/restartbtn.png", Color.white()));
            MaterialManager.registerMaterial(new Material("score", "assets/textures/score.png", Color.white()));
            MaterialManager.registerMaterial(new Material("title", "assets/textures/title.png", Color.white()));
            MaterialManager.registerMaterial(new Material("tutorial", "assets/textures/tutorial.png", Color.white()));
            
            AudioManager.loadSoundFile("flap", "assets/sounds/flap.mp3", false);
            AudioManager.loadSoundFile("ting", "assets/sounds/ting.mp3", false);
            AudioManager.loadSoundFile("dead", "assets/sounds/dead.mp3", false);

            // load
            this._projection = Matrix4x4.orthographic(0, this._canvas.width, this._canvas.height, 0, -100.0, 100.0);
            this.resize();
            
            // begin the preloading phase, which waits for various thingsto be loaded before starting the game
            this.preloading();
        };
        /**
         * Resizes the canvas to fit the window
         */
        Engine.prototype.resize = function () {
            if (this._canvas !== undefined) {
                // default to full screen behavior
                if (this._gameWidth === undefined || this._gameHeight === undefined) {
                    this._canvas.width = window.innerWidth;
                    this._canvas.height = window.innerHeight;
                    // change viewport to size of the window
                    gl.viewport(0, 0, window.innerWidth, window.innerHeight);
                    // not using an aspect ratio
                    this._projection = Matrix4x4.orthographic(0, window.innerWidth, window.innerHeight, 0, -100.0, 100.0);
                }
                else {
                    var newWidth = window.innerWidth;
                    var newHeight = window.innerHeight;
                    var newWidthToHeight = newWidth / newHeight;
                    var gameArea = document.getElementById("glcanvas_container2");
                    // grabs the new size and associated aspect ratio
                    // calculates how big to resize the game area
                    // sets gameArea style to appropriate width and height
                    if (newWidthToHeight > this._aspect) {
                        newWidth = newHeight * this._aspect;
                        gameArea.style.height = newHeight + 'px';
                        gameArea.style.width = newWidth + 'px';
                    }
                    else {
                        newHeight = newWidth / this._aspect;
                        gameArea.style.width = newWidth + 'px';
                        gameArea.style.height = newHeight + 'px';
                    }
                    gameArea.style.marginTop = (-newHeight / 2) + 'px';
                    gameArea.style.marginLeft = (-newWidth / 2) + 'px';
                    // set size of the canvas
                    this._canvas.width = newWidth;
                    this._canvas.height = newHeight;
                    // regenerate projection matrix
                    gl.viewport(0, 0, newWidth, newHeight);
                    this._projection = Matrix4x4.orthographic(0, this._gameWidth, this._gameHeight, 0, -100.0, 100.0);
                    // resolution scale is used by input manager
                    var resolutionScale = new Vector2(newWidth / this._gameWidth, newHeight / this._gameHeight);
                    InputManager.setResolutionScale(resolutionScale);
                }
            }
        };
        Engine.prototype.onMessage = function (message) {
            if (message.code === "MOUSE_UP") {
                var context = message.context;
                document.title = 'Pos: [String(context.position.x},${context.position.y}]';
            }
        };
        Engine.prototype.loop = function () {
            // check for first update
            if (this._isFirstUpdate) {
            }
            this.update();
            this.render();
            // runs about 60 fps, originally designed for animations 
            // .bind(this) is calling loop() for THIS instance of the engine
            requestAnimationFrame(this.loop.bind(this));
        };
        // operates on a game loop of its own but in a different state
        Engine.prototype.preloading = function () {
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
        };
        Engine.prototype.update = function () {
            // calculate time
            // performance.now() is very accurate
            var delta = performance.now() - this._previousTime;
            MessageBus.update(delta);
            ZoneManager.update(delta);
            CollisionManager.update(delta);
            this._previousTime = performance.now();
        };
        Engine.prototype.render = function () {
            // clears the buffer that draws the next frame of color
            // potential weird effects??
            gl.clear(gl.COLOR_BUFFER_BIT);
            ZoneManager.render(this._basicShader);
            var projectionPosition = this._basicShader.getUniformLocation("u_projection");
            gl.uniformMatrix4fv(projectionPosition, false, new Float32Array(this._projection.data));
        };
        return Engine;
    }());
    TSE.Engine = Engine;
})(TSE || (TSE = {}));
