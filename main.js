var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var engine;
window.onload = function () {
    engine = new TSE.Engine(320, 480);
    engine.start("viewport");
};
window.onresize = function () {
    engine.resize();
};
var TSE;
(function (TSE) {
    var Engine = (function () {
        function Engine(width, height) {
            this._previousTime = 0;
            this._isFirstUpdate = true;
            this._gameWidth = width;
            this._gameHeight = height;
        }
        Engine.prototype.start = function (elementName) {
            this._canvas = TSE.GLUtilities.initialize(elementName);
            if (this._gameWidth !== undefined && this._gameHeight !== undefined) {
                this._aspect = this._gameWidth / this._gameHeight;
            }
            TSE.AssetManager.initialize();
            TSE.InputManager.initialize(this._canvas);
            TSE.ZoneManager.initialize();
            TSE.gl.clearColor(146 / 255, 206 / 255, 247 / 255, 1);
            TSE.gl.enable(TSE.gl.BLEND);
            TSE.gl.blendFunc(TSE.gl.SRC_ALPHA, TSE.gl.ONE_MINUS_SRC_ALPHA);
            this._basicShader = new TSE.BasicShader();
            this._basicShader.use();
            this._projection = TSE.Matrix4x4.orthographic(0, this._canvas.width, this._canvas.height, 0, -100.0, 100.0);
            TSE.BitmapFontManager.addFont("default", "assets/fonts/text.txt");
            TSE.BitmapFontManager.load();
            TSE.MaterialManager.registerMaterial(new TSE.Material("leaves", "assets/textures/dk64-leaves.png", TSE.Color.white()));
            TSE.MaterialManager.registerMaterial(new TSE.Material("duck", "assets/textures/duck.png", TSE.Color.white()));
            TSE.MaterialManager.registerMaterial(new TSE.Material("grass", "assets/textures/grass.png", TSE.Color.white()));
            TSE.MaterialManager.registerMaterial(new TSE.Material("bg", "assets/textures/bg.png", TSE.Color.white()));
            TSE.MaterialManager.registerMaterial(new TSE.Material("end", "assets/textures/end.png", TSE.Color.white()));
            TSE.MaterialManager.registerMaterial(new TSE.Material("middle", "assets/textures/middle.png", TSE.Color.white()));
            TSE.MaterialManager.registerMaterial(new TSE.Material("playbtn", "assets/textures/playbtn.png", TSE.Color.white()));
            TSE.MaterialManager.registerMaterial(new TSE.Material("restartbtn", "assets/textures/restartbtn.png", TSE.Color.white()));
            TSE.MaterialManager.registerMaterial(new TSE.Material("score", "assets/textures/score.png", TSE.Color.white()));
            TSE.MaterialManager.registerMaterial(new TSE.Material("title", "assets/textures/title.png", TSE.Color.white()));
            TSE.MaterialManager.registerMaterial(new TSE.Material("tutorial", "assets/textures/tutorial.png", TSE.Color.white()));
            TSE.MaterialManager.registerMaterial(new TSE.Material("redborder", "assets/textures/redborder.png", TSE.Color.white()));
            TSE.AudioManager.loadSoundFile("flap", "assets/sounds/flap.mp3", false);
            TSE.AudioManager.loadSoundFile("ting", "assets/sounds/ting.mp3", false);
            TSE.AudioManager.loadSoundFile("dead", "assets/sounds/dead.mp3", false);
            this._projection = TSE.Matrix4x4.orthographic(0, this._canvas.width, this._canvas.height, 0, -100.0, 100.0);
            this.resize();
            this.preloading();
        };
        Engine.prototype.resize = function () {
            if (this._canvas !== undefined) {
                if (this._gameWidth === undefined || this._gameHeight === undefined) {
                    this._canvas.width = window.innerWidth;
                    this._canvas.height = window.innerHeight;
                    TSE.gl.viewport(0, 0, window.innerWidth, window.innerHeight);
                    this._projection = TSE.Matrix4x4.orthographic(0, window.innerWidth, window.innerHeight, 0, -100.0, 100.0);
                }
                else {
                    var newWidth = window.innerWidth;
                    var newHeight = window.innerHeight;
                    var newWidthToHeight = newWidth / newHeight;
                    var gameArea = document.getElementById("gameArea");
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
                    this._canvas.width = newWidth;
                    this._canvas.height = newHeight;
                    TSE.gl.viewport(0, 0, newWidth, newHeight);
                    this._projection = TSE.Matrix4x4.orthographic(0, this._gameWidth, this._gameHeight, 0, -100.0, 100.0);
                    var resolutionScale = new TSE.Vector2(newWidth / this._gameWidth, newHeight / this._gameHeight);
                    TSE.InputManager.setResolutionScale(resolutionScale);
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
            if (this._isFirstUpdate) {
            }
            this.update();
            this.render();
            requestAnimationFrame(this.loop.bind(this));
        };
        Engine.prototype.preloading = function () {
            TSE.MessageBus.update(0);
            if (!TSE.BitmapFontManager.updateReady()) {
                requestAnimationFrame(this.preloading.bind(this));
                return;
            }
            TSE.ZoneManager.changeZone(0);
            this.loop();
        };
        Engine.prototype.update = function () {
            var delta = performance.now() - this._previousTime;
            TSE.MessageBus.update(delta);
            TSE.ZoneManager.update(delta);
            TSE.CollisionManager.update(delta);
            this._previousTime = performance.now();
        };
        Engine.prototype.render = function () {
            TSE.gl.clear(TSE.gl.COLOR_BUFFER_BIT);
            TSE.ZoneManager.render(this._basicShader);
            var projectionPosition = this._basicShader.getUniformLocation("u_projection");
            TSE.gl.uniformMatrix4fv(projectionPosition, false, new Float32Array(this._projection.data));
        };
        return Engine;
    }());
    TSE.Engine = Engine;
})(TSE || (TSE = {}));
var TSE;
(function (TSE) {
    TSE.MESSAGE_ASSET_LOADER_ASSET_LOADED = "MESSAGE_ASSET_LOADER_ASSET_LOADED::";
    var AssetManager = (function () {
        function AssetManager() {
        }
        AssetManager.initialize = function () {
            AssetManager._loaders.push(new TSE.ImageAssetLoader());
            AssetManager._loaders.push(new TSE.JsonAssetLoader());
            AssetManager._loaders.push(new TSE.TextAssetLoader());
        };
        AssetManager.registerLoader = function (loader) {
            AssetManager._loaders.push(loader);
        };
        AssetManager.onAssetLoaded = function (asset) {
            AssetManager._loadedAssets[asset.name] = asset;
            TSE.Message.send(TSE.MESSAGE_ASSET_LOADER_ASSET_LOADED + asset.name, this, asset);
        };
        AssetManager.loadAsset = function (assetName) {
            var extension = assetName.split('.').pop().toLowerCase();
            for (var _i = 0, _a = AssetManager._loaders; _i < _a.length; _i++) {
                var l = _a[_i];
                if (l.supportedExtensions.indexOf(extension) !== -1) {
                    l.loadAsset(assetName);
                    return;
                }
            }
            console.warn("unable to load asset with extension " + extension + "because there is no loader associated with it.");
        };
        AssetManager.isAssetLoaded = function (assetName) {
            return AssetManager._loadedAssets[assetName] !== undefined;
        };
        AssetManager.getAsset = function (assetName) {
            if (AssetManager._loadedAssets[assetName] !== undefined) {
                return AssetManager._loadedAssets[assetName];
            }
            else {
                AssetManager.loadAsset(assetName);
            }
            return undefined;
        };
        AssetManager._loaders = [];
        AssetManager._loadedAssets = {};
        return AssetManager;
    }());
    TSE.AssetManager = AssetManager;
})(TSE || (TSE = {}));
var TSE;
(function (TSE) {
    var ImageAsset = (function () {
        function ImageAsset(name, data) {
            this.name = name;
            this.data = data;
        }
        Object.defineProperty(ImageAsset.prototype, "width", {
            get: function () {
                return this.data.width;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(ImageAsset.prototype, "height", {
            get: function () {
                return this.data.height;
            },
            enumerable: false,
            configurable: true
        });
        return ImageAsset;
    }());
    TSE.ImageAsset = ImageAsset;
    var ImageAssetLoader = (function () {
        function ImageAssetLoader() {
        }
        Object.defineProperty(ImageAssetLoader.prototype, "supportedExtensions", {
            get: function () {
                return ["png", "gif", "jpg"];
            },
            enumerable: false,
            configurable: true
        });
        ImageAssetLoader.prototype.loadAsset = function (assetName) {
            console.log("load asset name: " + assetName);
            var image = new Image();
            image.onload = this.onImageLoaded.bind(this, assetName, image);
            image.src = assetName;
        };
        ImageAssetLoader.prototype.onImageLoaded = function (assetName, image) {
            console.log("onImageLoaded: assetName/image", assetName, image);
            var asset = new ImageAsset(assetName, image);
            TSE.AssetManager.onAssetLoaded(asset);
        };
        return ImageAssetLoader;
    }());
    TSE.ImageAssetLoader = ImageAssetLoader;
})(TSE || (TSE = {}));
var TSE;
(function (TSE) {
    var JsonAsset = (function () {
        function JsonAsset(name, data) {
            this.name = name;
            this.data = data;
        }
        return JsonAsset;
    }());
    TSE.JsonAsset = JsonAsset;
    var JsonAssetLoader = (function () {
        function JsonAssetLoader() {
        }
        Object.defineProperty(JsonAssetLoader.prototype, "supportedExtensions", {
            get: function () {
                return ["json"];
            },
            enumerable: false,
            configurable: true
        });
        JsonAssetLoader.prototype.loadAsset = function (assetName) {
            var request = new XMLHttpRequest();
            request.open("GET", assetName);
            request.addEventListener("load", this.onJsonLoaded.bind(this, assetName, request));
            request.send();
        };
        JsonAssetLoader.prototype.onJsonLoaded = function (assetName, request) {
            console.log("onJsonLoaded: assetName/request", assetName, request);
            if (request.readyState === request.DONE) {
                var json = JSON.parse(request.responseText);
                var asset = new JsonAsset(assetName, json);
                TSE.AssetManager.onAssetLoaded(asset);
            }
        };
        return JsonAssetLoader;
    }());
    TSE.JsonAssetLoader = JsonAssetLoader;
})(TSE || (TSE = {}));
var TSE;
(function (TSE) {
    var TextAsset = (function () {
        function TextAsset(name, data) {
            this.name = name;
            this.data = data;
        }
        return TextAsset;
    }());
    TSE.TextAsset = TextAsset;
    var TextAssetLoader = (function () {
        function TextAssetLoader() {
        }
        Object.defineProperty(TextAssetLoader.prototype, "supportedExtensions", {
            get: function () {
                return ["txt"];
            },
            enumerable: false,
            configurable: true
        });
        TextAssetLoader.prototype.loadAsset = function (assetName) {
            var request = new XMLHttpRequest();
            request.open("GET", assetName);
            request.addEventListener("load", this.onTextLoaded.bind(this, assetName, request));
            request.send();
        };
        TextAssetLoader.prototype.onTextLoaded = function (assetName, request) {
            console.debug("onTextLoaded: assetName/request", assetName, request);
            if (request.readyState === request.DONE) {
                var asset = new TextAsset(assetName, request.responseText);
                TSE.AssetManager.onAssetLoaded(asset);
            }
        };
        return TextAssetLoader;
    }());
    TSE.TextAssetLoader = TextAssetLoader;
})(TSE || (TSE = {}));
var TSE;
(function (TSE) {
    var SoundEffect = (function () {
        function SoundEffect(assetPath, loop) {
            this._player = new Audio(assetPath);
            this._player.loop = loop;
        }
        Object.defineProperty(SoundEffect.prototype, "loop", {
            get: function () {
                return this._player.loop;
            },
            set: function (value) {
                this._player.loop = value;
            },
            enumerable: false,
            configurable: true
        });
        SoundEffect.prototype.destroy = function () {
            this._player = undefined;
        };
        SoundEffect.prototype.play = function () {
            if (!this._player.paused) {
                this.stop();
            }
            this._player.play();
        };
        SoundEffect.prototype.pause = function () {
            this._player.pause();
        };
        SoundEffect.prototype.stop = function () {
            this._player.pause();
            this._player.currentTime = 0;
        };
        return SoundEffect;
    }());
    TSE.SoundEffect = SoundEffect;
    var AudioManager = (function () {
        function AudioManager() {
        }
        AudioManager.loadSoundFile = function (name, assetPath, loop) {
            AudioManager._soundEffects[name] = new SoundEffect(assetPath, loop);
        };
        AudioManager.playSound = function (name) {
            if (AudioManager._soundEffects[name] !== undefined) {
                AudioManager._soundEffects[name].play();
            }
        };
        AudioManager.pauseSound = function (name) {
            if (AudioManager._soundEffects[name] !== undefined) {
                AudioManager._soundEffects[name].pause();
            }
        };
        AudioManager.pauseAll = function () {
            for (var sfx in AudioManager._soundEffects) {
                AudioManager._soundEffects[sfx].pause();
            }
        };
        AudioManager.stopSound = function (name) {
            if (AudioManager._soundEffects[name] !== undefined) {
                AudioManager._soundEffects[name].stop();
            }
        };
        AudioManager.stopAll = function () {
            for (var sfx in AudioManager._soundEffects) {
                AudioManager._soundEffects[sfx].stop();
            }
        };
        AudioManager._soundEffects = {};
        return AudioManager;
    }());
    TSE.AudioManager = AudioManager;
})(TSE || (TSE = {}));
var TSE;
(function (TSE) {
    var BaseBehavior = (function () {
        function BaseBehavior(data) {
            this._data = data;
            this.name = this._data.name;
        }
        BaseBehavior.prototype.setOwner = function (owner) {
            this._owner = owner;
        };
        BaseBehavior.prototype.updateReady = function () {
        };
        BaseBehavior.prototype.update = function (time) {
        };
        BaseBehavior.prototype.apply = function (userData) {
        };
        return BaseBehavior;
    }());
    TSE.BaseBehavior = BaseBehavior;
})(TSE || (TSE = {}));
var TSE;
(function (TSE) {
    var BehaviorManager = (function () {
        function BehaviorManager() {
        }
        BehaviorManager.registerBuilder = function (builder) {
            BehaviorManager._registeredBuilders[builder.type] = builder;
        };
        BehaviorManager.extractBehavior = function (json) {
            if (json.type != undefined) {
                if (BehaviorManager._registeredBuilders[String(json.type)] !== undefined) {
                    return BehaviorManager._registeredBuilders[String(json.type)].buildFromJson(json);
                }
                console.log(json.name);
                console.log(json.type);
                throw new Error("Component mananger error - type is missing or builder is not registered for this type.");
            }
        };
        BehaviorManager._registeredBuilders = {};
        return BehaviorManager;
    }());
    TSE.BehaviorManager = BehaviorManager;
})(TSE || (TSE = {}));
var TSE;
(function (TSE) {
    var KeyboardMovementBehaviorData = (function () {
        function KeyboardMovementBehaviorData() {
            this.speed = 0.1;
        }
        KeyboardMovementBehaviorData.prototype.setFromJson = function (json) {
            if (json.name === undefined) {
                throw new Error("Name must be defined in behavior data.");
            }
            this.name = String(json.name);
            if (json.name !== undefined) {
                this.speed = Number(json.speed);
            }
        };
        return KeyboardMovementBehaviorData;
    }());
    TSE.KeyboardMovementBehaviorData = KeyboardMovementBehaviorData;
    var KeyboardMovementBehaviorBuilder = (function () {
        function KeyboardMovementBehaviorBuilder() {
        }
        Object.defineProperty(KeyboardMovementBehaviorBuilder.prototype, "type", {
            get: function () {
                return "keyboardMovement";
            },
            enumerable: false,
            configurable: true
        });
        KeyboardMovementBehaviorBuilder.prototype.buildFromJson = function (json) {
            var data = new KeyboardMovementBehaviorData();
            data.setFromJson(json);
            return new KeyboardMovementBehavior(data);
        };
        return KeyboardMovementBehaviorBuilder;
    }());
    TSE.KeyboardMovementBehaviorBuilder = KeyboardMovementBehaviorBuilder;
    var KeyboardMovementBehavior = (function (_super) {
        __extends(KeyboardMovementBehavior, _super);
        function KeyboardMovementBehavior(data) {
            var _this = _super.call(this, data) || this;
            _this.speed = 0.1;
            _this.speed = data.speed;
            return _this;
        }
        KeyboardMovementBehavior.prototype.update = function (time) {
            if (TSE.InputManager.isKeyDown(TSE.Keys.LEFT)) {
                this._owner.transform.position.x -= this.speed;
            }
            if (TSE.InputManager.isKeyDown(TSE.Keys.RIGHT)) {
                this._owner.transform.position.x += this.speed;
            }
            if (TSE.InputManager.isKeyDown(TSE.Keys.UP)) {
                this._owner.transform.position.y -= this.speed;
            }
            if (TSE.InputManager.isKeyDown(TSE.Keys.DOWN)) {
                this._owner.transform.position.y += this.speed;
            }
            _super.prototype.update.call(this, time);
        };
        return KeyboardMovementBehavior;
    }(TSE.BaseBehavior));
    TSE.KeyboardMovementBehavior = KeyboardMovementBehavior;
    TSE.BehaviorManager.registerBuilder(new KeyboardMovementBehaviorBuilder());
})(TSE || (TSE = {}));
var TSE;
(function (TSE) {
    var MouseClickBehaviorData = (function () {
        function MouseClickBehaviorData() {
        }
        MouseClickBehaviorData.prototype.setFromJson = function (json) {
            if (json.name === undefined) {
                throw new Error("Name must be defined n behavior data.");
            }
            this.name = String(json.name);
            if (json.width === undefined) {
                throw new Error("Width must be defined n behavior data.");
            }
            else {
                this.width = Number(json.width);
            }
            if (json.height === undefined) {
                throw new Error("height must be defined n behavior data.");
            }
            else {
                this.height = Number(json.height);
            }
            if (json.messageCode === undefined) {
                throw new Error("messageCode must be defined n behavior data.");
            }
            else {
                this.messageCode = String(json.messageCode);
            }
        };
        return MouseClickBehaviorData;
    }());
    TSE.MouseClickBehaviorData = MouseClickBehaviorData;
    var MouseClickBehaviorBuilder = (function () {
        function MouseClickBehaviorBuilder() {
        }
        Object.defineProperty(MouseClickBehaviorBuilder.prototype, "type", {
            get: function () {
                return "mouseClick";
            },
            enumerable: false,
            configurable: true
        });
        MouseClickBehaviorBuilder.prototype.buildFromJson = function (json) {
            var data = new MouseClickBehaviorData();
            data.setFromJson(json);
            return new MouseClickBehavior(data);
        };
        return MouseClickBehaviorBuilder;
    }());
    TSE.MouseClickBehaviorBuilder = MouseClickBehaviorBuilder;
    var MouseClickBehavior = (function (_super) {
        __extends(MouseClickBehavior, _super);
        function MouseClickBehavior(data) {
            var _this = _super.call(this, data) || this;
            _this._width = data.width;
            _this._height = data.height;
            _this._messageCode = data.messageCode;
            TSE.Message.subscribe("MOUSE_UP", _this);
            return _this;
        }
        MouseClickBehavior.prototype.onMessage = function (message) {
            if (message.code === "MOUSE_UP") {
                if (!this._owner.isVisible) {
                    return;
                }
                var context = message.context;
                var worldPos = this._owner.getWorldPosition();
                var extentsX = worldPos.x + this._width;
                var extentsY = worldPos.y + this._height;
                if (context.position.x >= worldPos.x && context.position.x <= extentsX &&
                    context.position.y >= worldPos.y && context.position.y <= extentsY) {
                    TSE.Message.send(this._messageCode, this);
                }
            }
        };
        return MouseClickBehavior;
    }(TSE.BaseBehavior));
    TSE.MouseClickBehavior = MouseClickBehavior;
    TSE.BehaviorManager.registerBuilder(new MouseClickBehaviorBuilder());
})(TSE || (TSE = {}));
var TSE;
(function (TSE) {
    var PlayerBehaviorData = (function () {
        function PlayerBehaviorData() {
            this.acceleration = new TSE.Vector2(0, 920);
        }
        PlayerBehaviorData.prototype.setFromJson = function (json) {
            if (json.name === undefined) {
                throw new Error("Name must be defined in behavior data.");
            }
            this.name = String(json.name);
            if (json.acceleration !== undefined) {
                this.acceleration.setFromJson(json.acceleration);
            }
            if (json.animatedSpriteName === undefined) {
                throw new Error("animatedSpriteName must be defined in behavior data.");
            }
            else {
                this.animatedSpriteName = String(json.animatedSpriteName);
            }
            if (json.playerCollisionComponent === undefined) {
                throw new Error("playerCollisionComponent must be defined in behavior data.");
            }
            else {
                this.playerCollisionComponent = String(json.playerCollisionComponent);
            }
            if (json.groundCollisionComponent === undefined) {
                throw new Error("groundCollisionComponent must be defined in behavior data.");
            }
            else {
                this.groundCollisionComponent = String(json.groundCollisionComponent);
            }
            if (json.scoreCollisionComponent === undefined) {
                throw new Error("scoreCollisionComponent must be defined in behavior data.");
            }
            else {
                this.scoreCollisionComponent = String(json.scoreCollisionComponent);
            }
        };
        return PlayerBehaviorData;
    }());
    TSE.PlayerBehaviorData = PlayerBehaviorData;
    var PlayerBehaviorBuilder = (function () {
        function PlayerBehaviorBuilder() {
        }
        Object.defineProperty(PlayerBehaviorBuilder.prototype, "type", {
            get: function () {
                return "player";
            },
            enumerable: false,
            configurable: true
        });
        PlayerBehaviorBuilder.prototype.buildFromJson = function (json) {
            var data = new PlayerBehaviorData();
            data.setFromJson(json);
            return new PlayerBehavior(data);
        };
        return PlayerBehaviorBuilder;
    }());
    TSE.PlayerBehaviorBuilder = PlayerBehaviorBuilder;
    var PlayerBehavior = (function (_super) {
        __extends(PlayerBehavior, _super);
        function PlayerBehavior(data) {
            var _this = _super.call(this, data) || this;
            _this._velocity = TSE.Vector2.zero;
            _this._isAlive = true;
            _this._isPlaying = false;
            _this._initialPosition = TSE.Vector3.zero;
            _this._score = 0;
            _this._highScore = 0;
            _this._pipeNames = ["pipe1Collision_end", "pipe1Collision_middle_top", "pipe1Collision_endneg", "pipe1Collision_middle_bottom",
                "pipe2Collision_end", "pipe2Collision_middle_top", "pipe2Collision_endneg", "pipe2Collision_middle_bottom",
                "pipe3Collision_end", "pipe3Collision_middle_top", "pipe3Collision_endneg", "pipe3Collision_middle_bottom"];
            _this._acceleration = data.acceleration;
            _this._playerCollisionComponent = data.playerCollisionComponent;
            _this._groundCollisionComponent = data.groundCollisionComponent;
            _this._scoreCollisionComponent = data.scoreCollisionComponent;
            _this._animatedSpriteName = data.animatedSpriteName;
            TSE.Message.subscribe("MOUSE_DOWN", _this);
            TSE.Message.subscribe("COLLISION_ENTRY", _this);
            TSE.Message.subscribe("GAME_READY", _this);
            TSE.Message.subscribe("GAME_RESET", _this);
            TSE.Message.subscribe("GAME_START", _this);
            TSE.Message.subscribe("PLAYER_DIED", _this);
            return _this;
        }
        PlayerBehavior.prototype.updateReady = function () {
            _super.prototype.updateReady.call(this);
            this._sprite = this._owner.getComponentByName(this._animatedSpriteName);
            if (this._sprite === undefined) {
                throw new Error("AnimatedSpriteComponent named '" + this._animatedSpriteName + "' is not attached to the owner of this component.");
            }
            this._sprite.setFrame(0);
            this._initialPosition.copyFrom(this._owner.transform.position);
        };
        PlayerBehavior.prototype.update = function (time) {
            var seconds = time / 1000;
            if (this._isPlaying) {
                this._velocity.add(this._acceleration.clone().scale(seconds));
            }
            if (this._velocity.y > 400) {
                this._velocity.y = 400;
            }
            if (this._owner.transform.position.y < -13) {
                this._owner.transform.position.y = -13;
                this._velocity.y = 0;
            }
            this._owner.transform.position.add(this._velocity.clone().scale(seconds).toVector3());
            if (this._velocity.y < 0) {
                this._owner.transform.rotation.z -= Math.degToRad(600.0) * seconds;
                if (this._owner.transform.rotation.z < Math.degToRad(-20)) {
                    this._owner.transform.rotation.z = Math.degToRad(-20);
                }
            }
            if (this.isFalling() || !this._isAlive) {
                this._owner.transform.rotation.z += Math.degToRad(480.0) * seconds;
                if (this._owner.transform.rotation.z > Math.degToRad(90)) {
                    this._owner.transform.rotation.z = Math.degToRad(90);
                }
            }
            if (this.shouldNotFlap()) {
                this._sprite.stop();
            }
            else {
                if (!this._sprite.isPlaying) {
                    this._sprite.play();
                }
            }
            _super.prototype.update.call(this, time);
        };
        PlayerBehavior.prototype.onMessage = function (message) {
            switch (message.code) {
                case "MOUSE_DOWN":
                    this.onFlap();
                    break;
                case "COLLISION_ENTRY":
                    var data = message.context;
                    if (data.a.name !== this._playerCollisionComponent && data.b.name !== this._playerCollisionComponent) {
                        return;
                    }
                    if (data.a.name === this._groundCollisionComponent || data.b.name == this._groundCollisionComponent) {
                        this.die();
                        this.decelerate();
                    }
                    else if (this._pipeNames.indexOf(data.a.name) !== -1 || this._pipeNames.indexOf(data.b.name) !== -1) {
                        this.die();
                    }
                    else if (data.a.name === this._scoreCollisionComponent || data.b.name === this._scoreCollisionComponent) {
                        if (this._isAlive && this._isPlaying) {
                            this.setScore(this._score + 1);
                            TSE.AudioManager.playSound("ting");
                        }
                    }
                    break;
                case "GAME_RESET":
                    TSE.Message.send("GAME_HIDE", this);
                    TSE.Message.send("RESET_HIDE", this);
                    TSE.Message.send("SPLASH_HIDE", this);
                    TSE.Message.send("TUTORIAL_SHOW", this);
                    this.reset();
                    break;
                case "GAME_START":
                    TSE.Message.send("GAME_SHOW", this);
                    TSE.Message.send("RESET_HIDE", this);
                    TSE.Message.send("SPLASH_HIDE", this);
                    TSE.Message.send("TUTORIAL_HIDE", this);
                    this._isPlaying = true;
                    this._isAlive = true;
                    this.start();
                    break;
                case "GAME_READY":
                    TSE.Message.send("RESET_HIDE", this);
                    TSE.Message.send("TUTORIAL_HIDE", this);
                    TSE.Message.send("GAME_HIDE", this);
                    TSE.Message.send("SPLASH_SHOW", this);
                    break;
                case "PLAYER_DIED":
                    TSE.Message.send("RESET_SHOW", this);
                    break;
            }
        };
        PlayerBehavior.prototype.isFalling = function () {
            return this._velocity.y > 220.0;
        };
        PlayerBehavior.prototype.shouldNotFlap = function () {
            return !this._isPlaying || this._velocity.y > 220.0 || !this._isAlive;
        };
        PlayerBehavior.prototype.die = function () {
            if (this._isAlive) {
                this._isAlive = false;
                TSE.AudioManager.playSound("dead");
                TSE.Message.send("PLAYER_DIED", this);
            }
        };
        PlayerBehavior.prototype.reset = function () {
            this._isAlive = true;
            this._isPlaying = false;
            this._sprite.owner.transform.position.copyFrom(this._initialPosition);
            this._sprite.owner.transform.rotation.z = 0;
            this.setScore(0);
            this._velocity.set(0, 0);
            this._acceleration.set(0, 920);
            this._sprite.play();
        };
        PlayerBehavior.prototype.start = function () {
            this._isPlaying = true;
            TSE.Message.send("PLAYER_RESET", this);
        };
        PlayerBehavior.prototype.decelerate = function () {
            this._acceleration.y = 0;
            this._velocity.y = 0;
        };
        PlayerBehavior.prototype.onFlap = function () {
            if (this._isAlive && this._isPlaying) {
                this._velocity.y = -280;
                TSE.AudioManager.playSound("flap");
            }
        };
        PlayerBehavior.prototype.setScore = function (score) {
            this._score = score;
            TSE.Message.send("counterText:SetText", this, this._score);
            TSE.Message.send("scoreText:SetText", this, this._score);
            if (this._score > this._highScore) {
                this._highScore = this._score;
                TSE.Message.send("bestText:SetText", this, this._highScore);
            }
        };
        return PlayerBehavior;
    }(TSE.BaseBehavior));
    TSE.PlayerBehavior = PlayerBehavior;
    TSE.BehaviorManager.registerBuilder(new PlayerBehaviorBuilder());
})(TSE || (TSE = {}));
var TSE;
(function (TSE) {
    var RotationBehaviorData = (function () {
        function RotationBehaviorData() {
            this.rotation = TSE.Vector3.zero;
        }
        RotationBehaviorData.prototype.setFromJson = function (json) {
            if (json.name === undefined) {
                throw new Error("Name must be defined in behavior data.");
            }
            this.name = String(json.name);
            if (json.rotation !== undefined) {
                this.rotation.setFromJson(json.rotation);
            }
        };
        return RotationBehaviorData;
    }());
    TSE.RotationBehaviorData = RotationBehaviorData;
    var RotationBehaviorBuilder = (function () {
        function RotationBehaviorBuilder() {
        }
        Object.defineProperty(RotationBehaviorBuilder.prototype, "type", {
            get: function () {
                return "rotation";
            },
            enumerable: false,
            configurable: true
        });
        RotationBehaviorBuilder.prototype.buildFromJson = function (json) {
            var data = new RotationBehaviorData();
            data.setFromJson(json);
            return new RotationBehavior(data);
        };
        return RotationBehaviorBuilder;
    }());
    TSE.RotationBehaviorBuilder = RotationBehaviorBuilder;
    var RotationBehavior = (function (_super) {
        __extends(RotationBehavior, _super);
        function RotationBehavior(data) {
            var _this = _super.call(this, data) || this;
            _this._rotation = data.rotation;
            return _this;
        }
        RotationBehavior.prototype.update = function (time) {
            _super.prototype.update.call(this, time);
        };
        return RotationBehavior;
    }(TSE.BaseBehavior));
    TSE.RotationBehavior = RotationBehavior;
    TSE.BehaviorManager.registerBuilder(new RotationBehaviorBuilder());
})(TSE || (TSE = {}));
var TSE;
(function (TSE) {
    var ScrollBehaviorData = (function () {
        function ScrollBehaviorData() {
            this.velocity = TSE.Vector2.zero;
            this.minPosition = TSE.Vector2.zero;
            this.resetPosition = TSE.Vector2.zero;
        }
        ScrollBehaviorData.prototype.setFromJson = function (json) {
            if (json.name === undefined) {
                throw new Error("Name must be defined in behavior data.");
            }
            this.name = String(json.name);
            if (json.startMessage !== undefined) {
                this.startMessage = String(json.startMessage);
            }
            if (json.stopMessage !== undefined) {
                this.stopMessage = String(json.stopMessage);
            }
            if (json.resetMessage !== undefined) {
                this.resetMessage = String(json.resetMessage);
            }
            if (json.velocity !== undefined) {
                this.velocity.setFromJson(json.velocity);
            }
            else {
                throw new Error("ScrollBehaviorData requires property 'velocity' to be defined!");
            }
            if (json.minPosition !== undefined) {
                this.minPosition.setFromJson(json.minPosition);
            }
            else {
                throw new Error("ScrollBehaviorData requires property 'minPosition' to be defined!");
            }
            if (json.resetPosition !== undefined) {
                this.resetPosition.setFromJson(json.resetPosition);
            }
            else {
                throw new Error("ScrollBehaviorData requires property 'resetPosition' to be defined!");
            }
            if (json.minResetY !== undefined) {
                this.minResetY = Number(json.minResetY);
            }
            else {
            }
            if (json.maxResetY !== undefined) {
                this.maxResetY = Number(json.maxResetY);
            }
            else {
            }
        };
        return ScrollBehaviorData;
    }());
    TSE.ScrollBehaviorData = ScrollBehaviorData;
    var ScrollBehaviorBuilder = (function () {
        function ScrollBehaviorBuilder() {
        }
        Object.defineProperty(ScrollBehaviorBuilder.prototype, "type", {
            get: function () {
                return "scroll";
            },
            enumerable: false,
            configurable: true
        });
        ScrollBehaviorBuilder.prototype.buildFromJson = function (json) {
            var data = new ScrollBehaviorData();
            data.setFromJson(json);
            return new ScrollBehavior(data);
        };
        return ScrollBehaviorBuilder;
    }());
    TSE.ScrollBehaviorBuilder = ScrollBehaviorBuilder;
    var ScrollBehavior = (function (_super) {
        __extends(ScrollBehavior, _super);
        function ScrollBehavior(data) {
            var _this = _super.call(this, data) || this;
            _this._velocity = TSE.Vector2.zero;
            _this._minPosition = TSE.Vector2.zero;
            _this._resetPosition = TSE.Vector2.zero;
            _this._isScrolling = false;
            _this._initialPosition = TSE.Vector2.zero;
            _this._velocity.copyFrom(data.velocity);
            _this._minPosition.copyFrom(data.minPosition);
            _this._resetPosition.copyFrom(data.resetPosition);
            _this._startMessage = data.startMessage;
            _this._stopMessage = data.stopMessage;
            _this._resetMessage = data.resetMessage;
            if (data.minResetY !== undefined) {
                _this._minResetY = data.minResetY;
            }
            if (data.maxResetY !== undefined) {
                _this._maxResetY = data.maxResetY;
            }
            return _this;
        }
        ScrollBehavior.prototype.updateReady = function () {
            _super.prototype.updateReady.call(this);
            if (this._startMessage !== undefined) {
                TSE.Message.subscribe(this._startMessage, this);
            }
            if (this._stopMessage !== undefined) {
                TSE.Message.subscribe(this._stopMessage, this);
            }
            if (this._resetMessage !== undefined) {
                TSE.Message.subscribe(this._resetMessage, this);
            }
            this._initialPosition.copyFrom(this._owner.transform.position.toVector2());
        };
        ScrollBehavior.prototype.update = function (time) {
            if (this._isScrolling) {
                this.tempVector = this._velocity.clone().scale(time / 1000).toVector3();
                this.tempVector.x = -2;
                this._owner.transform.position.add(this.tempVector);
                if (this._owner.transform.position.x < -330) {
                    this._owner.transform.position.x = -330;
                }
                var scrollY_1 = this._minResetY !== undefined && this._maxResetY !== undefined;
                if (this._owner.transform.position.x <= this._minPosition.x &&
                    (scrollY_1 || (!scrollY_1 && this._owner.transform.position.y <= this._minPosition.y))) {
                    this.reset();
                }
            }
        };
        ScrollBehavior.prototype.onMessage = function (message) {
            if (message.code === this._startMessage) {
                this._isScrolling = true;
            }
            else if (message.code === this._stopMessage) {
                this._isScrolling = false;
            }
            else if (message.code === this._resetMessage) {
                this.initial();
            }
        };
        ScrollBehavior.prototype.reset = function () {
            if (this._minResetY !== undefined && this._maxResetY !== undefined) {
                this._owner.transform.position.set(this._resetPosition.x, this.getRandomY());
            }
            else {
                this._owner.transform.position.copyFrom(this._resetPosition.toVector3());
            }
        };
        ScrollBehavior.prototype.getRandomY = function () {
            return Math.floor(Math.random() * (this._maxResetY - this._minResetY + 1)) + this._minResetY;
        };
        ScrollBehavior.prototype.initial = function () {
            this._owner.transform.position.copyFrom(this._initialPosition.toVector3());
        };
        return ScrollBehavior;
    }(TSE.BaseBehavior));
    TSE.ScrollBehavior = ScrollBehavior;
    TSE.BehaviorManager.registerBuilder(new ScrollBehaviorBuilder());
})(TSE || (TSE = {}));
var TSE;
(function (TSE) {
    var VisibilityOnMessageBehaviorData = (function () {
        function VisibilityOnMessageBehaviorData() {
        }
        VisibilityOnMessageBehaviorData.prototype.setFromJson = function (json) {
            if (json.messageCode === undefined) {
                throw new Error("VisibilityOnMessageBehaviorData requires 'messageCode' to be defined.");
            }
            else {
                this.messageCode = String(json.messageCode);
            }
            if (json.visible === undefined) {
                throw new Error("VisibilityOnMessageBehaviorData requires 'visible' to be defined.");
            }
            else {
                this.visible = Boolean(json.visible);
            }
        };
        return VisibilityOnMessageBehaviorData;
    }());
    TSE.VisibilityOnMessageBehaviorData = VisibilityOnMessageBehaviorData;
    var VisibilityOnMessageBehaviorBuilder = (function () {
        function VisibilityOnMessageBehaviorBuilder() {
        }
        Object.defineProperty(VisibilityOnMessageBehaviorBuilder.prototype, "type", {
            get: function () {
                return "visibilityOnMessage";
            },
            enumerable: false,
            configurable: true
        });
        VisibilityOnMessageBehaviorBuilder.prototype.buildFromJson = function (json) {
            var data = new VisibilityOnMessageBehaviorData();
            data.setFromJson(json);
            return new VisibilityOnMessageBehavior(data);
        };
        return VisibilityOnMessageBehaviorBuilder;
    }());
    TSE.VisibilityOnMessageBehaviorBuilder = VisibilityOnMessageBehaviorBuilder;
    var VisibilityOnMessageBehavior = (function (_super) {
        __extends(VisibilityOnMessageBehavior, _super);
        function VisibilityOnMessageBehavior(data) {
            var _this = _super.call(this, data) || this;
            _this._messageCode = data.messageCode;
            _this._visible = data.visible;
            TSE.Message.subscribe(_this._messageCode, _this);
            return _this;
        }
        VisibilityOnMessageBehavior.prototype.onMessage = function (message) {
            if (message.code === this._messageCode) {
                this._owner.isVisible = this._visible;
            }
        };
        return VisibilityOnMessageBehavior;
    }(TSE.BaseBehavior));
    TSE.VisibilityOnMessageBehavior = VisibilityOnMessageBehavior;
    TSE.BehaviorManager.registerBuilder(new VisibilityOnMessageBehaviorBuilder());
})(TSE || (TSE = {}));
var TSE;
(function (TSE) {
    var CollisionData = (function () {
        function CollisionData(time, a, b) {
            this.time = time;
            this.a = a;
            this.b = b;
        }
        return CollisionData;
    }());
    TSE.CollisionData = CollisionData;
    var CollisionManager = (function () {
        function CollisionManager() {
        }
        CollisionManager.registerCollisionComponent = function (component) {
            CollisionManager._components.push(component);
        };
        CollisionManager.unRegisterCollisionComponent = function (component) {
            var index = CollisionManager._components.indexOf(component);
            if (index !== -1) {
                CollisionManager._components.slice(index, 1);
            }
        };
        CollisionManager.clear = function () {
            CollisionManager._components.length = 0;
        };
        CollisionManager.update = function (time) {
            CollisionManager._totalTime += time;
            for (var c = 0; c < CollisionManager._components.length; ++c) {
                var comp = CollisionManager._components[c];
                for (var o = 0; o < CollisionManager._components.length; ++o) {
                    var other = CollisionManager._components[o];
                    if (comp === other) {
                        continue;
                    }
                    if (comp.isStatic && other.isStatic) {
                        continue;
                    }
                    if (comp.shape.intersect(other.shape)) {
                        var exists = false;
                        for (var d = 0; d < CollisionManager._collisionData.length; ++d) {
                            var data = CollisionManager._collisionData[d];
                            if ((data.a === comp && data.b === other) || (data.a === other || data.b === comp)) {
                                comp.onCollisionUpdate(other);
                                other.onCollisionUpdate(comp);
                                data.time = CollisionManager._totalTime;
                                exists = true;
                                break;
                            }
                        }
                        if (!exists) {
                            var col = new CollisionData(CollisionManager._totalTime, comp, other);
                            comp.onCollisionEntry(other);
                            other.onCollisionEntry(comp);
                            TSE.Message.sendPriority("COLLISION_ENTRY", undefined, col);
                            CollisionManager._collisionData.push(col);
                        }
                    }
                }
            }
            var removeData = [];
            for (var d = 0; d < CollisionManager._collisionData.length; ++d) {
                var data = CollisionManager._collisionData[d];
                if (data.time !== CollisionManager._totalTime) {
                    removeData.push(data);
                }
            }
            while (removeData.length !== 0) {
                var data = removeData.shift();
                var index = CollisionManager._collisionData.indexOf(removeData[0]);
                CollisionManager._collisionData.splice(index, 1);
                data.a.onCollisionExit(data.b);
                data.a.onCollisionExit(data.a);
                TSE.Message.sendPriority("COLLISION_EXIT", undefined, data);
            }
        };
        CollisionManager._totalTime = 0;
        CollisionManager._components = [];
        CollisionManager._collisionData = [];
        return CollisionManager;
    }());
    TSE.CollisionManager = CollisionManager;
})(TSE || (TSE = {}));
var TSE;
(function (TSE) {
    var ComponentManager = (function () {
        function ComponentManager() {
        }
        ComponentManager.registerBuilder = function (builder) {
            ComponentManager._registeredBuilders[builder.type] = builder;
        };
        ComponentManager.extractComponent = function (json) {
            if (json.type !== undefined) {
                if (ComponentManager._registeredBuilders[String(json.type)] !== undefined) {
                    return ComponentManager._registeredBuilders[String(json.type)].buildFromJson(json);
                }
                throw new Error("Component mamanger error - type is missing or buildwer is not registered for this type.");
            }
        };
        ComponentManager._registeredBuilders = {};
        return ComponentManager;
    }());
    TSE.ComponentManager = ComponentManager;
})(TSE || (TSE = {}));
var TSE;
(function (TSE) {
    var BaseComponent = (function () {
        function BaseComponent(data) {
            this._data = data;
            this.name = data.name;
        }
        Object.defineProperty(BaseComponent.prototype, "owner", {
            get: function () {
                return this._owner;
            },
            enumerable: false,
            configurable: true
        });
        BaseComponent.prototype.setOwner = function (owner) {
            this._owner = owner;
        };
        BaseComponent.prototype.load = function () {
        };
        BaseComponent.prototype.updateReady = function () {
        };
        BaseComponent.prototype.update = function (time) {
        };
        BaseComponent.prototype.render = function (shader) {
        };
        return BaseComponent;
    }());
    TSE.BaseComponent = BaseComponent;
})(TSE || (TSE = {}));
var TSE;
(function (TSE) {
    var SpriteComponenetData = (function () {
        function SpriteComponenetData() {
            this.origin = TSE.Vector3.zero;
        }
        SpriteComponenetData.prototype.setFromJson = function (json) {
            if (json.name !== undefined) {
                this.name = String(json.name);
            }
            if (json.width !== undefined) {
                this.width = Number(json.width);
            }
            if (json.height !== undefined) {
                this.height = Number(json.height);
            }
            if (json.materialName !== undefined) {
                this.materialName = String(json.materialName);
            }
            if (json.origin !== undefined) {
                this.origin.setFromJson(json.origin);
            }
        };
        return SpriteComponenetData;
    }());
    TSE.SpriteComponenetData = SpriteComponenetData;
    var SpriteComponentBuilder = (function () {
        function SpriteComponentBuilder() {
        }
        Object.defineProperty(SpriteComponentBuilder.prototype, "type", {
            get: function () {
                return "sprite";
            },
            enumerable: false,
            configurable: true
        });
        SpriteComponentBuilder.prototype.buildFromJson = function (json) {
            var data = new SpriteComponenetData();
            data.setFromJson(json);
            return new SpriteComponent(data);
        };
        return SpriteComponentBuilder;
    }());
    TSE.SpriteComponentBuilder = SpriteComponentBuilder;
    var SpriteComponent = (function (_super) {
        __extends(SpriteComponent, _super);
        function SpriteComponent(data) {
            var _this = _super.call(this, data) || this;
            _this._width = data.width;
            _this._height = data.height;
            _this._sprite = new TSE.Sprite(data.name, data.materialName, _this._width, _this._height);
            if (!data.origin.equals(TSE.Vector3.zero)) {
                _this._sprite.origin.copyFrom(data.origin);
            }
            return _this;
        }
        SpriteComponent.prototype.load = function () {
            this._sprite.load();
        };
        SpriteComponent.prototype.render = function (shader) {
            this._sprite.draw(shader, this.owner.worldMatrix);
            _super.prototype.render.call(this, shader);
        };
        return SpriteComponent;
    }(TSE.BaseComponent));
    TSE.SpriteComponent = SpriteComponent;
    TSE.ComponentManager.registerBuilder(new SpriteComponentBuilder());
})(TSE || (TSE = {}));
var TSE;
(function (TSE) {
    var AnimatedSpriteComponenetData = (function (_super) {
        __extends(AnimatedSpriteComponenetData, _super);
        function AnimatedSpriteComponenetData() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this.frameSequence = [];
            _this.autoPlay = true;
            _this.frameTime = 33;
            return _this;
        }
        AnimatedSpriteComponenetData.prototype.setFromJson = function (json) {
            _super.prototype.setFromJson.call(this, json);
            if (json.autoPlay !== undefined) {
                this.autoPlay = Boolean(json.autoPlay);
            }
            if (json.frameWidth === undefined) {
                throw new Error("AnimatedSpriteComponentData requires 'frameWidth' to be defined.");
            }
            else {
                this.frameWidth = Number(json.frameWidth);
            }
            if (json.frameHeight === undefined) {
                throw new Error("AnimatedSpriteComponentData requires 'frameHeight' to be defined.");
            }
            else {
                this.frameHeight = Number(json.frameHeight);
            }
            if (json.frameCount === undefined) {
                throw new Error("AnimatedSpriteComponentData requires 'frameCount' to be defined.");
            }
            else {
                this.frameCount = Number(json.frameCount);
            }
            if (json.frameSequence === undefined) {
                throw new Error("AnimatedSpriteComponentData requires 'frameSequence' to be defined.");
            }
            else {
                this.frameSequence = json.frameSequence;
            }
            if (json.frameTime === undefined) {
                throw new Error("AnimatedSpriteComponentData requires 'frameTime' to be defined.");
            }
            else {
                this.frameTime = Number(json.frameTime);
            }
        };
        return AnimatedSpriteComponenetData;
    }(TSE.SpriteComponenetData));
    TSE.AnimatedSpriteComponenetData = AnimatedSpriteComponenetData;
    var AnimatedSpriteComponentBuilder = (function () {
        function AnimatedSpriteComponentBuilder() {
        }
        Object.defineProperty(AnimatedSpriteComponentBuilder.prototype, "type", {
            get: function () {
                return "animatedSprite";
            },
            enumerable: false,
            configurable: true
        });
        AnimatedSpriteComponentBuilder.prototype.buildFromJson = function (json) {
            var data = new AnimatedSpriteComponenetData();
            data.setFromJson(json);
            return new AnimatedSpriteComponent(data);
        };
        return AnimatedSpriteComponentBuilder;
    }());
    TSE.AnimatedSpriteComponentBuilder = AnimatedSpriteComponentBuilder;
    var AnimatedSpriteComponent = (function (_super) {
        __extends(AnimatedSpriteComponent, _super);
        function AnimatedSpriteComponent(data) {
            var _this = _super.call(this, data) || this;
            _this._autoPlay = data.autoPlay;
            var spriteInfo = new TSE.AnimatedSpriteInfo();
            spriteInfo.name = data.name;
            spriteInfo.materialName = data.materialName;
            spriteInfo.width = data.width;
            spriteInfo.height = data.height;
            spriteInfo.frameWidth = data.frameWidth;
            spriteInfo.frameHeight = data.frameHeight;
            spriteInfo.frameCount = data.frameCount;
            spriteInfo.frameSequence = data.frameSequence;
            spriteInfo.frameTime = data.frameTime;
            _this._sprite = new TSE.AnimatedSprite(spriteInfo);
            if (!data.origin.equals(TSE.Vector3.zero)) {
                _this._sprite.origin.copyFrom(data.origin);
            }
            return _this;
        }
        Object.defineProperty(AnimatedSpriteComponent.prototype, "isPlaying", {
            get: function () {
                return this._sprite.isPlaying;
            },
            enumerable: false,
            configurable: true
        });
        AnimatedSpriteComponent.prototype.load = function () {
            this._sprite.load();
        };
        AnimatedSpriteComponent.prototype.updateRead = function () {
            if (!this._autoPlay) {
                this._sprite.stop();
            }
        };
        AnimatedSpriteComponent.prototype.update = function (time) {
            this._sprite.update(time);
            _super.prototype.update.call(this, time);
        };
        AnimatedSpriteComponent.prototype.render = function (shader) {
            this._sprite.draw(shader, this.owner.worldMatrix);
            _super.prototype.render.call(this, shader);
        };
        AnimatedSpriteComponent.prototype.play = function () {
            this._sprite.play();
        };
        AnimatedSpriteComponent.prototype.stop = function () {
            this._sprite.stop();
        };
        AnimatedSpriteComponent.prototype.setFrame = function (frameNumber) {
            this._sprite.setFrame(frameNumber);
        };
        return AnimatedSpriteComponent;
    }(TSE.BaseComponent));
    TSE.AnimatedSpriteComponent = AnimatedSpriteComponent;
    TSE.ComponentManager.registerBuilder(new AnimatedSpriteComponentBuilder());
})(TSE || (TSE = {}));
var TSE;
(function (TSE) {
    var BitmapTextComponentData = (function () {
        function BitmapTextComponentData() {
            this.origin = TSE.Vector3.zero;
        }
        BitmapTextComponentData.prototype.setFromJson = function (json) {
            if (json.name !== undefined) {
                this.name = String(json.name);
            }
            if (json.fontName !== undefined) {
                this.fontName = String(json.fontName);
            }
            if (json.text !== undefined) {
                this.text = String(json.text);
            }
            if (json.origin !== undefined) {
                this.origin.setFromJson(json.origin);
            }
        };
        return BitmapTextComponentData;
    }());
    TSE.BitmapTextComponentData = BitmapTextComponentData;
    var BitmapTextComponentBuilder = (function () {
        function BitmapTextComponentBuilder() {
        }
        Object.defineProperty(BitmapTextComponentBuilder.prototype, "type", {
            get: function () {
                return "bitmapText";
            },
            enumerable: false,
            configurable: true
        });
        BitmapTextComponentBuilder.prototype.buildFromJson = function (json) {
            var data = new BitmapTextComponentData();
            data.setFromJson(json);
            return new BitmapTextComponent(data);
        };
        return BitmapTextComponentBuilder;
    }());
    TSE.BitmapTextComponentBuilder = BitmapTextComponentBuilder;
    var BitmapTextComponent = (function (_super) {
        __extends(BitmapTextComponent, _super);
        function BitmapTextComponent(data) {
            var _this = _super.call(this, data) || this;
            _this._fontName = data.fontName;
            _this._bitmapText = new TSE.BitmapText(_this.name, _this._fontName);
            if (!data.origin.equals(TSE.Vector3.zero)) {
                _this._bitmapText.origin.copyFrom(data.origin);
            }
            _this._bitmapText.text = data.text;
            TSE.Message.subscribe(_this.name + ":SetText", _this);
            return _this;
        }
        BitmapTextComponent.prototype.load = function () {
            this._bitmapText.load();
        };
        BitmapTextComponent.prototype.update = function (time) {
            this._bitmapText.update(time);
        };
        BitmapTextComponent.prototype.render = function (shader) {
            this._bitmapText.draw(shader, this.owner.worldMatrix);
            _super.prototype.render.call(this, shader);
        };
        BitmapTextComponent.prototype.onMessage = function (message) {
            if (message.code === this.name + ":SetText") {
                this._bitmapText.text = String(message.context);
            }
        };
        return BitmapTextComponent;
    }(TSE.BaseComponent));
    TSE.BitmapTextComponent = BitmapTextComponent;
    TSE.ComponentManager.registerBuilder(new BitmapTextComponentBuilder());
})(TSE || (TSE = {}));
var TSE;
(function (TSE) {
    var CollisionComponentData = (function () {
        function CollisionComponentData() {
            this.static = true;
        }
        CollisionComponentData.prototype.setFromJson = function (json) {
            if (json.name !== undefined) {
                this.name = String(json.name);
            }
            if (json.static !== undefined) {
                this.static = Boolean(json.static);
            }
            if (json.shape === undefined) {
                throw new Error("CollisionComponenetData requires 'shape' to be present.");
            }
            else {
                if (json.shape.type === undefined) {
                    throw new Error("CollsiionComponentData requires 'shape.type' to be present.");
                }
                var shapeType = String(json.shape.type).toLowerCase();
                switch (shapeType) {
                    case "rectangle":
                        this.shape = new TSE.Rectangle2D();
                        break;
                    case "circle":
                        this.shape = new TSE.Circle2D();
                        break;
                    default:
                        throw new Error("Unsupported shape type: '" + shapeType + ";.");
                }
            }
            this.shape.setFromJson(json.shape);
        };
        return CollisionComponentData;
    }());
    TSE.CollisionComponentData = CollisionComponentData;
    var CollisionComponentBuilder = (function () {
        function CollisionComponentBuilder() {
        }
        Object.defineProperty(CollisionComponentBuilder.prototype, "type", {
            get: function () {
                return "collision";
            },
            enumerable: false,
            configurable: true
        });
        CollisionComponentBuilder.prototype.buildFromJson = function (json) {
            var data = new CollisionComponentData();
            data.setFromJson(json);
            return new CollisionComponent(data);
        };
        return CollisionComponentBuilder;
    }());
    TSE.CollisionComponentBuilder = CollisionComponentBuilder;
    var CollisionComponent = (function (_super) {
        __extends(CollisionComponent, _super);
        function CollisionComponent(data) {
            var _this = _super.call(this, data) || this;
            _this._debugMaterialName = "redborder";
            _this._shape = data.shape;
            _this._static = data.static;
            return _this;
        }
        Object.defineProperty(CollisionComponent.prototype, "shape", {
            get: function () {
                return this._shape;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(CollisionComponent.prototype, "isStatic", {
            get: function () {
                return this._static;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(CollisionComponent.prototype, "debugWidth", {
            set: function (width) {
                this._debugWidth = width;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(CollisionComponent.prototype, "debugHeight", {
            set: function (height) {
                this._debugHeight = height;
            },
            enumerable: false,
            configurable: true
        });
        CollisionComponent.prototype.load = function () {
            _super.prototype.load.call(this);
            this._shape.position.copyFrom(this.owner.getWorldPosition().toVector2().subtract(this._shape.offset));
            if (this._shape instanceof TSE.Rectangle2D) {
                this.debugHeight = this._shape.height;
                this.debugWidth = this._shape.width;
            }
            this._debugSprite = new TSE.Sprite("debugSprite", this._debugMaterialName, this._debugWidth, this._debugHeight);
            this._debugSprite.origin.copyFrom(this._shape.origin.toVector3());
            this._debugSprite.load();
            TSE.CollisionManager.registerCollisionComponent(this);
        };
        CollisionComponent.prototype.update = function (time) {
            if (this.owner.name === "duck") {
                this._shape.origin.x = 0.5;
                this._shape.origin.y = 0.5;
                this._shape.position.copyFrom(this.owner.getWorldPosition().toVector2().subtract(this._shape.offset));
            }
            else {
                this._shape.position.copyFrom(this.owner.getWorldPosition().toVector2().subtract(this._shape.offset));
            }
            this._debugSprite.origin.copyFrom(this.owner.getWorldPosition().subtract(this._shape.offset.toVector3()));
            _super.prototype.update.call(this, time);
        };
        CollisionComponent.prototype.render = function (shader) {
            _super.prototype.render.call(this, shader);
        };
        CollisionComponent.prototype.onCollisionEntry = function (other) {
        };
        CollisionComponent.prototype.onCollisionUpdate = function (other) {
        };
        CollisionComponent.prototype.onCollisionExit = function (other) {
        };
        return CollisionComponent;
    }(TSE.BaseComponent));
    TSE.CollisionComponent = CollisionComponent;
    TSE.ComponentManager.registerBuilder(new CollisionComponentBuilder());
})(TSE || (TSE = {}));
var TSE;
(function (TSE) {
    var GLUtilities = (function () {
        function GLUtilities() {
        }
        GLUtilities.initialize = function (elementId) {
            var canvas;
            if (elementId !== undefined) {
                canvas = document.getElementById(elementId);
                if (canvas === undefined) {
                    throw new Error("cannot find a canvas element neamed:" + elementId);
                }
            }
            else {
                canvas = document.createElement("canvas");
                document.body.appendChild(canvas);
            }
            TSE.gl = canvas.getContext("webgl");
            if (TSE.gl === undefined || TSE.gl == null) {
                if (TSE.gl === undefined || TSE.gl == null) {
                    throw new Error("Unable to initialize WebGL!");
                }
            }
            return canvas;
        };
        return GLUtilities;
    }());
    TSE.GLUtilities = GLUtilities;
})(TSE || (TSE = {}));
var TSE;
(function (TSE) {
    var AttributeInfo = (function () {
        function AttributeInfo() {
        }
        return AttributeInfo;
    }());
    TSE.AttributeInfo = AttributeInfo;
    var GLBuffer = (function () {
        function GLBuffer(dataType, targetBufferType, mode) {
            if (dataType === void 0) { dataType = TSE.gl.FLOAT; }
            if (targetBufferType === void 0) { targetBufferType = TSE.gl.ARRAY_BUFFER; }
            if (mode === void 0) { mode = TSE.gl.TRIANGLES; }
            this._data = [];
            this._attributes = [];
            this._totalOffset = 0;
            this._elementSize = 0;
            this._dataType = dataType;
            this._targetBufferType = targetBufferType;
            this._mode = mode;
            switch (this._dataType) {
                case TSE.gl.FLOAT:
                case TSE.gl.INT:
                case TSE.gl.UNSIGNED_INT:
                    this._typeSize = 4;
                    break;
                case TSE.gl.SHORT:
                case TSE.gl.UNSIGNED_SHORT:
                    this._typeSize = 2;
                    break;
                case TSE.gl.BYTE:
                case TSE.gl.UNSIGNED_BYTE:
                    this._typeSize = 1;
                    break;
                default:
                    throw new Error("Unrecognized data type: " + dataType.toString());
            }
            this._buffer = TSE.gl.createBuffer();
        }
        GLBuffer.prototype.destroy = function () {
            TSE.gl.deleteBuffer(this._buffer);
        };
        GLBuffer.prototype.bind = function (normalized) {
            if (normalized === void 0) { normalized = false; }
            TSE.gl.bindBuffer(this._targetBufferType, this._buffer);
            if (this._hasAttributeLocation) {
                for (var _i = 0, _a = this._attributes; _i < _a.length; _i++) {
                    var it = _a[_i];
                    TSE.gl.vertexAttribPointer(it.location, it.size, this._dataType, normalized, this._stride, it.offset * this._typeSize);
                    TSE.gl.enableVertexAttribArray(it.location);
                }
            }
        };
        GLBuffer.prototype.unbind = function () {
            for (var _i = 0, _a = this._attributes; _i < _a.length; _i++) {
                var it = _a[_i];
                TSE.gl.disableVertexAttribArray(it.location);
            }
            TSE.gl.bindBuffer(this._targetBufferType, undefined);
        };
        GLBuffer.prototype.addAttributeLocation = function (info) {
            this._hasAttributeLocation = true;
            info.offset = this._elementSize;
            this._attributes.push(info);
            this._elementSize += info.size;
            this._stride = this._elementSize * this._typeSize;
        };
        GLBuffer.prototype.setData = function (data) {
            this.clearData();
            this.pushBackData(data);
        };
        GLBuffer.prototype.pushBackData = function (data) {
            for (var _i = 0, data_1 = data; _i < data_1.length; _i++) {
                var d = data_1[_i];
                this._data.push(d);
            }
        };
        GLBuffer.prototype.clearData = function () {
            this._data.length = 0;
        };
        GLBuffer.prototype.upload = function () {
            TSE.gl.bindBuffer(this._targetBufferType, this._buffer);
            var bufferData;
            switch (this._dataType) {
                case TSE.gl.FLOAT:
                    bufferData = new Float32Array(this._data);
                    break;
                case TSE.gl.INT:
                    bufferData = new Int32Array(this._data);
                    break;
                case TSE.gl.UNSIGNED_INT:
                    bufferData = new Uint32Array(this._data);
                    break;
                case TSE.gl.SHORT:
                    bufferData = new Int16Array(this._data);
                    break;
                case TSE.gl.UNSIGNED_SHORT:
                    bufferData = new Uint16Array(this._data);
                    break;
                case TSE.gl.BYTE:
                    bufferData = new Int16Array(this._data);
                    break;
                case TSE.gl.UNSIGNED_BYTE:
                    bufferData = new Uint8Array(this._data);
                    break;
            }
            TSE.gl.bufferData(this._targetBufferType, bufferData, TSE.gl.STATIC_DRAW);
        };
        GLBuffer.prototype.draw = function () {
            if (this._targetBufferType === TSE.gl.ARRAY_BUFFER) {
                TSE.gl.drawArrays(this._mode, 0, this._data.length / this._elementSize);
            }
            else if (this._targetBufferType === TSE.gl.ELEMENT_ARRAY_BUFFER) {
                TSE.gl.drawElements(this._mode, this._data.length, this._dataType, 0);
            }
        };
        return GLBuffer;
    }());
    TSE.GLBuffer = GLBuffer;
})(TSE || (TSE = {}));
var TSE;
(function (TSE) {
    var Shader = (function () {
        function Shader(name) {
            this._attributes = {};
            this._uniforms = {};
            this._name = name;
        }
        Object.defineProperty(Shader.prototype, "name", {
            get: function () {
                return this._name;
            },
            enumerable: false,
            configurable: true
        });
        Shader.prototype.use = function () {
            TSE.gl.useProgram(this._program);
        };
        Shader.prototype.getAttributeLocation = function (name) {
            if (this._attributes[name] === undefined) {
                console.log(this._attributes);
                throw new Error('Unable to find attribute named:' + name + " All attributes:" + this._attributes[0]);
            }
            return this._attributes[name];
        };
        Shader.prototype.getUniformLocation = function (name) {
            if (this._uniforms[name] === undefined) {
                console.log(this._uniforms);
                throw new Error('Unable to find uniform named:' + name + " All attributes:");
            }
            return this._uniforms[name];
        };
        Shader.prototype.load = function (vertexSource, fragmentSource) {
            var vertexShader = this.loadShader(vertexSource, TSE.gl.VERTEX_SHADER);
            var fragmentShader = this.loadShader(fragmentSource, TSE.gl.FRAGMENT_SHADER);
            this.createProgram(vertexShader, fragmentShader);
            this.detectAttributes();
            this.detectUniforms();
        };
        Shader.prototype.loadShader = function (source, shaderType) {
            var shader = TSE.gl.createShader(shaderType);
            TSE.gl.shaderSource(shader, source);
            TSE.gl.compileShader(shader);
            var error = TSE.gl.getShaderInfoLog(shader).trim();
            if (error !== "") {
                throw new Error("Error compiling shader: " + this._name + ":" + error);
            }
            return shader;
        };
        Shader.prototype.createProgram = function (vertexShader, fragmentShader) {
            this._program = TSE.gl.createProgram();
            TSE.gl.attachShader(this._program, vertexShader);
            TSE.gl.attachShader(this._program, fragmentShader);
            TSE.gl.linkProgram(this._program);
            var error = TSE.gl.getProgramInfoLog(this._program).trim();
            if (error !== "") {
                throw new Error("Error linking shader: " + this._name + ":" + error);
            }
        };
        Shader.prototype.detectAttributes = function () {
            var attributeCount = TSE.gl.getProgramParameter(this._program, TSE.gl.ACTIVE_ATTRIBUTES);
            for (var i = 0; i < attributeCount; ++i) {
                var info = TSE.gl.getActiveAttrib(this._program, i);
                if (!info) {
                    break;
                }
                this._attributes[info.name] = TSE.gl.getAttribLocation(this._program, info.name);
            }
        };
        Shader.prototype.detectUniforms = function () {
            var uniformCount = TSE.gl.getProgramParameter(this._program, TSE.gl.ACTIVE_UNIFORMS);
            for (var i = 0; i < uniformCount; ++i) {
                var info = TSE.gl.getActiveUniform(this._program, i);
                if (!info) {
                    break;
                }
                this._uniforms[info.name] = TSE.gl.getUniformLocation(this._program, info.name);
            }
        };
        return Shader;
    }());
    TSE.Shader = Shader;
})(TSE || (TSE = {}));
var TSE;
(function (TSE) {
    var BasicShader = (function (_super) {
        __extends(BasicShader, _super);
        function BasicShader() {
            var _this = _super.call(this, "basic") || this;
            _this.load(_this.getVertexSource(), _this.getFragmentSource());
            return _this;
        }
        BasicShader.prototype.getVertexSource = function () {
            return "\n\t\t\tattribute vec3 a_position;\n\t\t\tattribute vec2 a_texCoord;\n\n\t\t\tuniform mat4 u_projection;\n\t\t\tuniform mat4 u_model;\n\n\t\t\tvarying vec2 v_texCoord;\n\n\t\t\tvoid main() {\n\t\t\t\tgl_Position = u_projection * u_model * vec4(a_position, 1.0);\n\t\t\t\tv_texCoord = a_texCoord;\n\t\t\t}\n\t\t\t";
        };
        BasicShader.prototype.getFragmentSource = function () {
            return "\n\t\t\tprecision mediump float;\n\n\t\t\tuniform vec4 u_tint;\n\t\t\tuniform sampler2D u_diffuse; \n\n\t\t\tvarying vec2 v_texCoord;\n\t\t\t\n\t\t\tvoid main() {\n\t\t\t\tgl_FragColor = u_tint * texture2D(u_diffuse, v_texCoord);\n\t\t\t}\n\t\t\t";
        };
        return BasicShader;
    }(TSE.Shader));
    TSE.BasicShader = BasicShader;
})(TSE || (TSE = {}));
var TSE;
(function (TSE) {
    var Sprite = (function () {
        function Sprite(name, materialName, width, height) {
            if (width === void 0) { width = 50; }
            if (height === void 0) { height = 50; }
            this._origin = TSE.Vector3.zero;
            this._name = name;
            this._width = width;
            this._height = height;
            this._materialName = materialName;
            this._material = TSE.MaterialManager.getMaterial(this._materialName);
        }
        Object.defineProperty(Sprite.prototype, "name", {
            get: function () {
                return this._name;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(Sprite.prototype, "origin", {
            get: function () {
                return this._origin;
            },
            set: function (value) {
                this._origin = value;
                this.recalculateVertices();
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(Sprite.prototype, "width", {
            get: function () {
                return this._width;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(Sprite.prototype, "height", {
            get: function () {
                return this._height;
            },
            enumerable: false,
            configurable: true
        });
        Sprite.prototype.destroy = function () {
            this._buffer.destroy();
            TSE.MaterialManager.releaseMaterial(this._materialName);
            this._material = undefined;
            this._materialName = undefined;
        };
        Sprite.prototype.load = function () {
            this._buffer = new TSE.GLBuffer();
            var positionAttribute = new TSE.AttributeInfo();
            positionAttribute.location = 0;
            positionAttribute.size = 3;
            this._buffer.addAttributeLocation(positionAttribute);
            var texCoordAttribute = new TSE.AttributeInfo();
            texCoordAttribute.location = 1;
            texCoordAttribute.size = 2;
            this._buffer.addAttributeLocation(texCoordAttribute);
            this.calculateVertices();
        };
        Sprite.prototype.update = function (time) {
        };
        Sprite.prototype.draw = function (shader, model) {
            var modelLocation = shader.getUniformLocation("u_model");
            TSE.gl.uniformMatrix4fv(modelLocation, false, model.toFloat32Array());
            var colorLocation = shader.getUniformLocation("u_tint");
            TSE.gl.uniform4fv(colorLocation, this._material.tint.toFloat32Array());
            if (this._material.diffuseTexture !== undefined) {
                this._material.diffuseTexture.activateAndBind(0);
                var diffuseLocation = shader.getUniformLocation("u_diffuse");
                TSE.gl.uniform1i(diffuseLocation, 0);
            }
            else {
                console.log("texture diffuse is undefined");
            }
            this._buffer.bind();
            this._buffer.draw();
        };
        Sprite.prototype.calculateVertices = function () {
            var minX = -(this._width * this._origin.x);
            var maxX = this._width * (1.0 - this._origin.x);
            var minY = -(this._height * this._origin.y);
            var maxY = this._height * (1.0 - this._origin.y);
            this._vertices = [
                new TSE.Vertex(minX, minY, 0, 0, 0),
                new TSE.Vertex(minX, maxY, 0, 0, 1.0),
                new TSE.Vertex(maxX, maxY, 0, 1.0, 1.0),
                new TSE.Vertex(maxX, maxY, 0, 1.0, 1.0),
                new TSE.Vertex(maxX, minY, 0, 1.0, 0),
                new TSE.Vertex(minX, minY, 0, 0, 0)
            ];
            for (var _i = 0, _a = this._vertices; _i < _a.length; _i++) {
                var v = _a[_i];
                this._buffer.pushBackData(v.toArray());
            }
            this._buffer.upload();
            this._buffer.unbind();
        };
        Sprite.prototype.recalculateVertices = function () {
            var minX = -(this._width * this._origin.x);
            var maxX = this._width * (1.0 - this._origin.x);
            var minY = -(this._height * this._origin.y);
            var maxY = this._height * (1.0 - this._origin.y);
            this._vertices[0].position.set(minX, minY);
            this._vertices[1].position.set(minX, maxY);
            this._vertices[2].position.set(maxX, maxY);
            this._vertices[3].position.set(maxX, maxY);
            this._vertices[4].position.set(maxX, minY);
            this._vertices[5].position.set(minX, minY);
            this._buffer.clearData();
            for (var _i = 0, _a = this._vertices; _i < _a.length; _i++) {
                var v = _a[_i];
                this._buffer.pushBackData(v.toArray());
            }
            this._buffer.upload();
            this._buffer.unbind();
        };
        return Sprite;
    }());
    TSE.Sprite = Sprite;
})(TSE || (TSE = {}));
var TSE;
(function (TSE) {
    var UVInfo = (function () {
        function UVInfo(min, max) {
            this.min = min;
            this.max = max;
        }
        return UVInfo;
    }());
    var AnimatedSpriteInfo = (function () {
        function AnimatedSpriteInfo() {
            this.width = 100;
            this.height = 100;
            this.frameWidth = 10;
            this.frameHeight = 10;
            this.frameCount = 1;
            this.frameSequence = [];
            this.frameTime = 60;
        }
        return AnimatedSpriteInfo;
    }());
    TSE.AnimatedSpriteInfo = AnimatedSpriteInfo;
    var AnimatedSprite = (function (_super) {
        __extends(AnimatedSprite, _super);
        function AnimatedSprite(info) {
            var _this = _super.call(this, info.name, info.materialName, info.width, info.height) || this;
            _this._currentFrame = 0;
            _this._frameUVs = [];
            _this._frameTime = 33;
            _this._currentTime = 0;
            _this._assetLoaded = false;
            _this._assetWidth = 2;
            _this._assetHeight = 2;
            _this._isPlaying = true;
            _this._frameHeight = info.frameHeight;
            _this._frameWidth = info.frameWidth;
            _this._frameCount = info.frameCount;
            _this._frameSequence = info.frameSequence;
            _this._frameTime = info.frameTime;
            TSE.Message.subscribe(TSE.MESSAGE_ASSET_LOADER_ASSET_LOADED + _this._material.diffuseTextureName, _this);
            return _this;
        }
        Object.defineProperty(AnimatedSprite.prototype, "isPlaying", {
            get: function () {
                return this._isPlaying;
            },
            enumerable: false,
            configurable: true
        });
        AnimatedSprite.prototype.destroy = function () {
            _super.prototype.destroy.call(this);
        };
        AnimatedSprite.prototype.play = function () {
            this._isPlaying = true;
        };
        AnimatedSprite.prototype.stop = function () {
            this._isPlaying = false;
        };
        AnimatedSprite.prototype.setFrame = function (frameNumber) {
            if (frameNumber >= this._frameCount) {
                throw new Error("Frame is out of range:" + frameNumber + ", frame count:" + this._frameCount);
            }
            this._currentFrame = frameNumber;
        };
        AnimatedSprite.prototype.onMessage = function (message) {
            if (message.code === TSE.MESSAGE_ASSET_LOADER_ASSET_LOADED + this._material.diffuseTextureName) {
                this._assetLoaded = true;
                var asset = message.context;
                this._assetHeight = asset.height;
                this._assetWidth = asset.width;
                this.calculateUVs();
            }
        };
        AnimatedSprite.prototype.load = function () {
            _super.prototype.load.call(this);
            if (!this._assetLoaded) {
                this.setupFromMaterial();
            }
        };
        AnimatedSprite.prototype.update = function (time) {
            if (!this._assetLoaded) {
                this.setupFromMaterial();
                return;
            }
            if (!this._isPlaying) {
                return;
            }
            this._currentTime += time;
            if (this._currentTime > this._frameTime) {
                this._currentFrame++;
                this._currentTime = 0;
                if (this._currentFrame >= this._frameSequence.length) {
                    this._currentFrame = 0;
                }
                var frameUVs = this._frameSequence[this._currentFrame];
                this._vertices[0].texCoords.copyFrom(this._frameUVs[frameUVs].min);
                this._vertices[1].texCoords = new TSE.Vector2(this._frameUVs[frameUVs].min.x, this._frameUVs[frameUVs].max.y);
                this._vertices[2].texCoords.copyFrom(this._frameUVs[frameUVs].max);
                this._vertices[3].texCoords.copyFrom(this._frameUVs[frameUVs].max);
                this._vertices[4].texCoords = new TSE.Vector2(this._frameUVs[frameUVs].max.x, this._frameUVs[frameUVs].min.y);
                this._vertices[5].texCoords.copyFrom(this._frameUVs[frameUVs].min);
                this._vertices[0].texCoords = new TSE.Vector2(0 + 0.333 * frameUVs, 0);
                this._vertices[1].texCoords = new TSE.Vector2(0 + 0.333 * frameUVs, 1);
                this._vertices[2].texCoords = new TSE.Vector2(0.333 * (frameUVs + 1), 1);
                this._vertices[5].texCoords = new TSE.Vector2(0 + 0.333 * frameUVs, 0);
                this._vertices[3].texCoords = new TSE.Vector2(0.33 * (frameUVs + 1), 1);
                this._vertices[4].texCoords = new TSE.Vector2(0.33 * (frameUVs + 1), 0);
                this._buffer.clearData();
                for (var _i = 0, _a = this._vertices; _i < _a.length; _i++) {
                    var v = _a[_i];
                    this._buffer.pushBackData(v.toArray());
                }
                this._buffer.upload();
                this._buffer.unbind();
            }
            _super.prototype.update.call(this, time);
        };
        AnimatedSprite.prototype.calculateUVs = function () {
            var totalWidth = 0;
            var xValue = 0;
            var yValue = 0;
            for (var i = 0; i < this._frameCount; i++) {
                totalWidth += this._frameWidth;
                if (totalWidth > this._assetWidth) {
                    yValue++;
                    totalWidth = 0;
                    xValue = 0;
                }
                var u = (xValue * this._frameWidth) / this._assetWidth;
                var v = (yValue * this._frameHeight) / this._assetHeight;
                var min = new TSE.Vector2(u, v);
                var uMax = ((xValue * this._frameWidth) + this._frameWidth) / this._assetWidth;
                var vMax = ((yValue * this._frameHeight) + this._frameHeight) / this._assetHeight;
                var max = new TSE.Vector2(uMax, vMax);
                this._frameUVs.push(new UVInfo(min, max));
                xValue++;
            }
        };
        AnimatedSprite.prototype.setupFromMaterial = function () {
            if (!this._assetLoaded) {
                var material = TSE.MaterialManager.getMaterial(this._materialName);
                if (material.diffuseTexture.isLoaded) {
                    if (TSE.AssetManager.isAssetLoaded(material.diffuseTextureName)) {
                        this._assetHeight = material.diffuseTexture.height;
                        this._assetHeight = material.diffuseTexture.width;
                        this._assetLoaded = true;
                        this.calculateUVs();
                    }
                }
            }
        };
        return AnimatedSprite;
    }(TSE.Sprite));
    TSE.AnimatedSprite = AnimatedSprite;
})(TSE || (TSE = {}));
var TSE;
(function (TSE) {
    var FontUtilities = (function () {
        function FontUtilities() {
        }
        FontUtilities.extractFieldValue = function (field) {
            return field.split("=")[1];
        };
        return FontUtilities;
    }());
    var FontGlyph = (function () {
        function FontGlyph() {
        }
        FontGlyph.fromFields = function (fields) {
            var glyph = new FontGlyph();
            glyph.id = Number(FontUtilities.extractFieldValue(fields[1]));
            glyph.x = Number(FontUtilities.extractFieldValue(fields[2]));
            glyph.y = Number(FontUtilities.extractFieldValue(fields[3]));
            glyph.width = Number(FontUtilities.extractFieldValue(fields[4]));
            glyph.height = Number(FontUtilities.extractFieldValue(fields[5]));
            glyph.xOffset = Number(FontUtilities.extractFieldValue(fields[6]));
            glyph.yOffset = Number(FontUtilities.extractFieldValue(fields[7]));
            glyph.xAdvance = Number(FontUtilities.extractFieldValue(fields[8]));
            glyph.page = Number(FontUtilities.extractFieldValue(fields[9]));
            glyph.channel = Number(FontUtilities.extractFieldValue(fields[10]));
            return glyph;
        };
        return FontGlyph;
    }());
    TSE.FontGlyph = FontGlyph;
    var BitmapFont = (function () {
        function BitmapFont(name, fontFile) {
            this._assetLoaded = false;
            this._glyphs = {};
            this._name = name;
            this._fontFileName = fontFile;
        }
        Object.defineProperty(BitmapFont.prototype, "name", {
            get: function () {
                return this._name;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(BitmapFont.prototype, "size", {
            get: function () {
                return this._size;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(BitmapFont.prototype, "imageWidth", {
            get: function () {
                return this._imageWidth;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(BitmapFont.prototype, "imageHeight", {
            get: function () {
                return this._imageHeight;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(BitmapFont.prototype, "textureName", {
            get: function () {
                return this._imageFile;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(BitmapFont.prototype, "isLoaded", {
            get: function () {
                return this._assetLoaded;
            },
            enumerable: false,
            configurable: true
        });
        BitmapFont.prototype.load = function () {
            var asset = TSE.AssetManager.getAsset(this._fontFileName);
            if (asset !== undefined) {
                this.processFontFile(asset.data);
            }
            else {
                TSE.Message.subscribe(TSE.MESSAGE_ASSET_LOADER_ASSET_LOADED + this._fontFileName, this);
            }
        };
        BitmapFont.prototype.onMessage = function (message) {
            if (message.code === TSE.MESSAGE_ASSET_LOADER_ASSET_LOADED + this._fontFileName) {
                this.processFontFile(message.context.data);
            }
        };
        BitmapFont.prototype.getGlyph = function (char) {
            var code = char.charCodeAt(0);
            code = this._glyphs[code] === undefined ? 63 : code;
            return this._glyphs[code];
        };
        BitmapFont.prototype.measureText = function (text) {
            var size = TSE.Vector2.zero;
            var maxX = 0;
            var x = 0;
            var y = 0;
            for (var _i = 0, text_1 = text; _i < text_1.length; _i++) {
                var c = text_1[_i];
                switch (c) {
                    case "\n":
                        if (x > maxX) {
                            maxX = x;
                        }
                        x = 0;
                        y += this._size;
                        break;
                    default:
                        x += this.getGlyph(String(x)).xAdvance;
                        break;
                }
            }
            size.set(x, y);
            return size;
        };
        BitmapFont.prototype.processFontFile = function (content) {
            var charCount = 0;
            var lines = content.split("\n");
            for (var _i = 0, lines_1 = lines; _i < lines_1.length; _i++) {
                var line = lines_1[_i];
                var data = line.replace(/\s\s+/g, ' ');
                var fields = data.split(" ");
                switch (fields[0]) {
                    case "info":
                        this._size = Number(FontUtilities.extractFieldValue(fields[2]));
                        break;
                    case "common":
                        this._imageWidth = Number(FontUtilities.extractFieldValue(fields[3]));
                        this._imageHeight = Number(FontUtilities.extractFieldValue(fields[4]));
                        break;
                    case "page":
                        {
                            var id = Number(FontUtilities.extractFieldValue(fields[1]));
                            this._imageFile = FontUtilities.extractFieldValue(fields[2]);
                            this._imageFile = this._imageFile.replace(/"/g, "");
                            this._imageFile = ("assets/fonts/" + this._imageFile).trim();
                        }
                        break;
                    case "chars":
                        charCount = Number(FontUtilities.extractFieldValue(fields[1]));
                        charCount++;
                        break;
                    case "char":
                        {
                            var glyph = FontGlyph.fromFields(fields);
                            this._glyphs[glyph.id] = glyph;
                        }
                        break;
                }
            }
            var actualGlyphCount = 0;
            var keys = Object.keys(this._glyphs);
            for (var _a = 0, keys_1 = keys; _a < keys_1.length; _a++) {
                var key = keys_1[_a];
                if (this._glyphs.hasOwnProperty(key)) {
                    actualGlyphCount++;
                }
            }
            if (actualGlyphCount === undefined) {
                throw new Error("Font file reported extistence of ${charCount} glyphs, but only ${actualGlyphcount} were found.");
            }
            this._assetLoaded = true;
        };
        return BitmapFont;
    }());
    TSE.BitmapFont = BitmapFont;
})(TSE || (TSE = {}));
var TSE;
(function (TSE) {
    var Color = (function () {
        function Color(r, g, b, a) {
            if (r === void 0) { r = 255; }
            if (g === void 0) { g = 255; }
            if (b === void 0) { b = 255; }
            if (a === void 0) { a = 255; }
            this._r = r;
            this._g = g;
            this._b = b;
            this._a = a;
        }
        Object.defineProperty(Color.prototype, "r", {
            get: function () {
                return this._r;
            },
            set: function (value) {
                this._r = value;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(Color.prototype, "rFloat", {
            get: function () {
                return this._r / 255.0;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(Color.prototype, "g", {
            get: function () {
                return this._r;
            },
            set: function (value) {
                this._g = value;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(Color.prototype, "gFloat", {
            get: function () {
                return this._g / 255.0;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(Color.prototype, "b", {
            get: function () {
                return this._b;
            },
            set: function (value) {
                this._b = value;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(Color.prototype, "bFloat", {
            get: function () {
                return this._b / 255.0;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(Color.prototype, "a", {
            get: function () {
                return this._a;
            },
            set: function (value) {
                this._a = value;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(Color.prototype, "aFloat", {
            get: function () {
                return this._a / 255.0;
            },
            enumerable: false,
            configurable: true
        });
        Color.prototype.toArray = function () {
            return [this._r, this._g, this._b, this._a];
        };
        Color.prototype.toFloatArray = function () {
            return [this._r / 255.0, this._g / 255.0, this._b / 255.0, this._a / 255.0];
        };
        Color.prototype.toFloat32Array = function () {
            return new Float32Array(this.toFloatArray());
        };
        Color.white = function () {
            return new Color(255, 255, 255, 255);
        };
        Color.black = function () {
            return new Color(0, 0, 0, 255);
        };
        Color.red = function () {
            return new Color(255, 0, 0, 255);
        };
        Color.green = function () {
            return new Color(0, 255, 0, 255);
        };
        Color.blue = function () {
            return new Color(0, 0, 255, 255);
        };
        return Color;
    }());
    TSE.Color = Color;
})(TSE || (TSE = {}));
var TSE;
(function (TSE) {
    var Material = (function () {
        function Material(name, diffuseTextureName, tint) {
            this._name = name;
            this._diffuseTextureName = diffuseTextureName;
            this._tint = tint;
            if (this._diffuseTextureName !== undefined) {
                this._diffuseTexture = TSE.TextureManager.getTexture(this._diffuseTextureName);
            }
        }
        Object.defineProperty(Material.prototype, "name", {
            get: function () {
                return this._name;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(Material.prototype, "diffuseTextureName", {
            get: function () {
                return this._diffuseTextureName;
            },
            set: function (value) {
                if (this._diffuseTexture !== undefined) {
                    TSE.TextureManager.releaseTexture(this._diffuseTextureName);
                }
                this._diffuseTextureName = value;
                if (this._diffuseTexture !== undefined) {
                    this._diffuseTexture = TSE.TextureManager.getTexture(this._diffuseTextureName);
                }
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(Material.prototype, "diffuseTexture", {
            get: function () {
                return this._diffuseTexture;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(Material.prototype, "tint", {
            get: function () {
                return this._tint;
            },
            enumerable: false,
            configurable: true
        });
        Material.prototype.destroy = function () {
            TSE.TextureManager.releaseTexture(this.diffuseTextureName);
            this._diffuseTexture = undefined;
        };
        return Material;
    }());
    TSE.Material = Material;
})(TSE || (TSE = {}));
var TSE;
(function (TSE) {
    var MaterialReferenceNode = (function () {
        function MaterialReferenceNode(material) {
            this.referenceCount = 1;
            this.material = material;
        }
        return MaterialReferenceNode;
    }());
    var MaterialManager = (function () {
        function MaterialManager() {
        }
        MaterialManager.registerMaterial = function (material) {
            if (MaterialManager._materials[material.name] === undefined) {
                MaterialManager._materials[material.name] = new MaterialReferenceNode(material);
            }
        };
        MaterialManager.getMaterial = function (materialName) {
            if (MaterialManager._materials[materialName] === undefined) {
                return undefined;
            }
            else {
                MaterialManager._materials[materialName].referenceCount++;
                return MaterialManager._materials[materialName].material;
            }
        };
        MaterialManager.releaseMaterial = function (materialName) {
            if (MaterialManager._materials[materialName] === undefined) {
                console.warn("Cannot release a material which has not been registered.");
            }
            else {
                MaterialManager._materials[materialName].referenceCount--;
                if (MaterialManager._materials[materialName].referenceCount < 1) {
                    MaterialManager._materials[materialName].material.destroy();
                    MaterialManager._materials[materialName].material = undefined;
                    delete MaterialManager._materials[materialName];
                }
            }
        };
        MaterialManager._materials = {};
        return MaterialManager;
    }());
    TSE.MaterialManager = MaterialManager;
})(TSE || (TSE = {}));
var TSE;
(function (TSE) {
    var LEVEL = 0;
    var BORDER = 0;
    var TEMP_IMAGE_DATA = new Uint8Array([255, 255, 255, 255]);
    var Texture = (function () {
        function Texture(name, width, height) {
            if (width === void 0) { width = 1; }
            if (height === void 0) { height = 1; }
            this._isLoaded = false;
            this._name = name;
            this._width = width;
            this._height = height;
            this._handle = TSE.gl.createTexture();
            this.bind();
            TSE.gl.texImage2D(TSE.gl.TEXTURE_2D, LEVEL, TSE.gl.RGBA, 1, 1, BORDER, TSE.gl.RGBA, TSE.gl.UNSIGNED_BYTE, TEMP_IMAGE_DATA);
            var asset = TSE.AssetManager.getAsset(this.name);
            if (asset !== undefined) {
                this.loadTextureFromAsset(asset);
            }
            else {
                TSE.Message.subscribe(TSE.MESSAGE_ASSET_LOADER_ASSET_LOADED + this._name, this);
            }
        }
        Object.defineProperty(Texture.prototype, "name", {
            get: function () {
                return this._name;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(Texture.prototype, "isLoaded", {
            get: function () {
                return this._isLoaded;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(Texture.prototype, "width", {
            get: function () {
                return this._width;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(Texture.prototype, "height", {
            get: function () {
                return this._height;
            },
            enumerable: false,
            configurable: true
        });
        Texture.prototype.destroy = function () {
            TSE.gl.deleteTexture(this._handle);
        };
        Texture.prototype.activateAndBind = function (textureUnit) {
            if (textureUnit === void 0) { textureUnit = 0; }
            TSE.gl.activeTexture(TSE.gl.TEXTURE0 + textureUnit);
            this.bind();
        };
        Texture.prototype.bind = function () {
            TSE.gl.bindTexture(TSE.gl.TEXTURE_2D, this._handle);
        };
        Texture.prototype.unbind = function () {
            TSE.gl.bindTexture(TSE.gl.TEXTURE_2D, undefined);
        };
        Texture.prototype.onMessage = function (message) {
            if (message.code === TSE.MESSAGE_ASSET_LOADER_ASSET_LOADED + this._name) {
                this.loadTextureFromAsset(message.context);
            }
        };
        Texture.prototype.loadTextureFromAsset = function (asset) {
            this._width = asset.width;
            this._height = asset.height;
            this.bind();
            TSE.gl.texImage2D(TSE.gl.TEXTURE_2D, LEVEL, TSE.gl.RGBA, TSE.gl.RGBA, TSE.gl.UNSIGNED_BYTE, asset.data);
            if (this.isPowerof2()) {
                TSE.gl.generateMipmap(TSE.gl.TEXTURE_2D);
            }
            else {
                TSE.gl.texParameteri(TSE.gl.TEXTURE_2D, TSE.gl.TEXTURE_WRAP_S, TSE.gl.CLAMP_TO_EDGE);
                TSE.gl.texParameteri(TSE.gl.TEXTURE_2D, TSE.gl.TEXTURE_WRAP_T, TSE.gl.CLAMP_TO_EDGE);
            }
            TSE.gl.texParameteri(TSE.gl.TEXTURE_2D, TSE.gl.TEXTURE_MIN_FILTER, TSE.gl.NEAREST);
            TSE.gl.texParameteri(TSE.gl.TEXTURE_2D, TSE.gl.TEXTURE_MAG_FILTER, TSE.gl.NEAREST);
            this._isLoaded = true;
        };
        Texture.prototype.isPowerof2 = function () {
            return (this.isValuePowerOf2(this._width) && this.isValuePowerOf2(this.height));
        };
        Texture.prototype.isValuePowerOf2 = function (value) {
            return (value & (value - 1)) == 0;
        };
        return Texture;
    }());
    TSE.Texture = Texture;
})(TSE || (TSE = {}));
var TSE;
(function (TSE) {
    var TextureReferenceNode = (function () {
        function TextureReferenceNode(texture) {
            this.referenceCount = 1;
            this.texture = texture;
        }
        return TextureReferenceNode;
    }());
    var TextureManager = (function () {
        function TextureManager() {
        }
        TextureManager.getTexture = function (textureName) {
            if (TextureManager._textures[textureName] === undefined) {
                var texture = new TSE.Texture(textureName);
                TextureManager._textures[textureName] = new TextureReferenceNode(texture);
            }
            else {
                TextureManager._textures[textureName].referenceCount++;
            }
            return TextureManager._textures[textureName].texture;
        };
        TextureManager.releaseTexture = function (textureName) {
            if (TextureManager._textures[textureName] === undefined) {
                console.warn('a testure named ' + textureName + ' does not exist and cannot be released.');
            }
            else {
                TextureManager._textures[textureName].referenceCount--;
                if (TextureManager._textures[textureName].referenceCount < 1) {
                    TextureManager._textures[textureName].texture.destroy();
                    TextureManager._textures[textureName] = undefined;
                    delete TextureManager._textures[textureName];
                }
            }
        };
        TextureManager._textures = {};
        return TextureManager;
    }());
    TSE.TextureManager = TextureManager;
})(TSE || (TSE = {}));
var TSE;
(function (TSE) {
    var Vertex = (function () {
        function Vertex(x, y, z, tu, tv) {
            if (x === void 0) { x = 0; }
            if (y === void 0) { y = 0; }
            if (z === void 0) { z = 0; }
            if (tu === void 0) { tu = 0; }
            if (tv === void 0) { tv = 0; }
            this.position = TSE.Vector3.zero;
            this.texCoords = TSE.Vector2.zero;
            this.position.x = x;
            this.position.y = y;
            this.position.z = z;
            this.texCoords.x = tu;
            this.texCoords.y = tv;
        }
        Vertex.prototype.toArray = function () {
            var array = [];
            array = array.concat(this.position.toArray());
            array = array.concat(this.texCoords.toArray());
            return array;
        };
        Vertex.prototype.toFloat32Array = function () {
            return new Float32Array(this.toArray());
        };
        return Vertex;
    }());
    TSE.Vertex = Vertex;
})(TSE || (TSE = {}));
var TSE;
(function (TSE) {
    var BitmapFontManager = (function () {
        function BitmapFontManager() {
        }
        BitmapFontManager.addFont = function (name, fontFileName) {
            BitmapFontManager._fonts[name] = new TSE.BitmapFont(name, fontFileName);
        };
        BitmapFontManager.getFont = function (name) {
            if (BitmapFontManager._fonts[name] === undefined) {
                throw new Error("A font named " + name + " does not exist.");
            }
            return BitmapFontManager._fonts[name];
        };
        BitmapFontManager.load = function () {
            var keys = Object.keys(BitmapFontManager._fonts);
            for (var _i = 0, keys_2 = keys; _i < keys_2.length; _i++) {
                var key = keys_2[_i];
                BitmapFontManager._fonts[key].load();
            }
        };
        BitmapFontManager.updateReady = function () {
            var keys = Object.keys(BitmapFontManager._fonts);
            for (var _i = 0, keys_3 = keys; _i < keys_3.length; _i++) {
                var key = keys_3[_i];
                if (!BitmapFontManager._fonts[key].isLoaded) {
                    console.debug("Font " + key + " is still laoding...");
                    return false;
                }
            }
            console.debug("All fonts are loaded.");
            return true;
        };
        BitmapFontManager._fonts = {};
        return BitmapFontManager;
    }());
    TSE.BitmapFontManager = BitmapFontManager;
})(TSE || (TSE = {}));
var TSE;
(function (TSE) {
    var BitmapText = (function () {
        function BitmapText(name, fontName) {
            this._isDirty = false;
            this._origin = TSE.Vector3.zero;
            this._vertices = [];
            this._name = name;
            this._fontName = fontName;
        }
        Object.defineProperty(BitmapText.prototype, "name", {
            get: function () {
                return this._name;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(BitmapText.prototype, "text", {
            get: function () {
                return this._text;
            },
            set: function (value) {
                if (this._text !== value) {
                    this._text = value;
                    this._isDirty = true;
                }
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(BitmapText.prototype, "origin", {
            get: function () {
                return this._origin;
            },
            set: function (value) {
                this._origin = value;
                this.calculateVertices();
            },
            enumerable: false,
            configurable: true
        });
        BitmapText.prototype.destroy = function () {
            this._buffer.destroy();
            this._material.destroy();
            this._material = undefined;
        };
        BitmapText.prototype.load = function () {
            this._bitmapFont = TSE.BitmapFontManager.getFont(this._fontName);
            this._material = new TSE.Material('BITMAP_FONT_${this.name}', this._bitmapFont.textureName, TSE.Color.white());
            this._buffer = new TSE.GLBuffer();
            var positionAttribute = new TSE.AttributeInfo();
            positionAttribute.location = 0;
            positionAttribute.size = 3;
            this._buffer.addAttributeLocation(positionAttribute);
            var texCoordAttribute = new TSE.AttributeInfo();
            texCoordAttribute.location = 1;
            texCoordAttribute.size = 2;
            this._buffer.addAttributeLocation(texCoordAttribute);
        };
        BitmapText.prototype.update = function (time) {
            if (this._isDirty && this._bitmapFont.isLoaded) {
                this.calculateVertices();
                this._isDirty = false;
            }
        };
        BitmapText.prototype.draw = function (shader, model) {
            var modelLocation = shader.getUniformLocation("u_model");
            TSE.gl.uniformMatrix4fv(modelLocation, false, model.toFloat32Array());
            var colorLocation = shader.getUniformLocation("u_tint");
            TSE.gl.uniform4fv(colorLocation, this._material.tint.toFloat32Array());
            if (this._material.diffuseTexture !== undefined) {
                this._material.diffuseTexture.activateAndBind(0);
                var diffuseLocation = shader.getUniformLocation("u_diffuse");
                TSE.gl.uniform1i(diffuseLocation, 0);
            }
            this._buffer.bind();
            this._buffer.draw();
        };
        BitmapText.prototype.calculateVertices = function () {
            this._vertices.length = 0;
            this._buffer.clearData();
            var x = 0;
            var y = 0;
            for (var _i = 0, _a = this._text; _i < _a.length; _i++) {
                var c = _a[_i];
                if (c === "\n") {
                    x = 0;
                    y += this._bitmapFont.size;
                    continue;
                }
                var g = this._bitmapFont.getGlyph(c);
                var minX = x + g.xOffset;
                var minY = y + g.yOffset;
                var maxX = minX + g.width;
                var maxY = minY + g.height;
                var minu = g.x / this._bitmapFont.imageWidth;
                var minv = g.y / this._bitmapFont.imageHeight;
                var maxu = (g.x + g.width) / this._bitmapFont.imageWidth;
                var maxv = (g.y + g.height) / this._bitmapFont.imageHeight;
                this._vertices.push(new TSE.Vertex(minX, minY, 0, minu, minv));
                this._vertices.push(new TSE.Vertex(minX, maxY, 0, minu, maxv));
                this._vertices.push(new TSE.Vertex(maxX, maxY, 0, maxu, maxv));
                this._vertices.push(new TSE.Vertex(maxX, maxY, 0, maxu, maxv));
                this._vertices.push(new TSE.Vertex(maxX, minY, 0, maxu, minv));
                this._vertices.push(new TSE.Vertex(minX, minY, 0, minu, minv));
                x += g.xAdvance;
            }
            for (var _b = 0, _c = this._vertices; _b < _c.length; _b++) {
                var v = _c[_b];
                this._buffer.pushBackData(v.toArray());
            }
            this._buffer.upload();
            this._buffer.unbind();
        };
        return BitmapText;
    }());
    TSE.BitmapText = BitmapText;
})(TSE || (TSE = {}));
var TSE;
(function (TSE) {
    var Circle2D = (function () {
        function Circle2D() {
            this.position = TSE.Vector2.zero;
            this.origin = TSE.Vector2.zero;
        }
        Object.defineProperty(Circle2D.prototype, "offset", {
            get: function () {
                return new TSE.Vector2(this.radius + (this.radius * this.origin.x), this.radius + (this.radius * this.origin.y));
            },
            enumerable: false,
            configurable: true
        });
        Circle2D.prototype.setFromJson = function (json) {
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
        };
        Circle2D.prototype.intersect = function (other) {
            if (other instanceof Circle2D) {
                var distance = Math.abs(TSE.Vector2.distance(other.position, this.position));
                var radiusLengths = this.radius + other.radius;
                if (distance <= radiusLengths) {
                    return true;
                }
            }
            if (other instanceof TSE.Rectangle2D) {
                var deltaX = this.position.x - Math.max(other.position.x, Math.min(this.position.x, other.position.x + other.width));
                var deltaY = this.position.y - Math.max(other.position.y, Math.min(this.position.y, other.position.y + other.height));
                if ((deltaX * deltaX + deltaY * deltaY) < (this.radius * this.radius)) {
                    return true;
                }
            }
            return false;
        };
        Circle2D.prototype.pointInShape = function (point) {
            var absDistance = Math.abs(TSE.Vector2.distance(this.position, point));
            if (absDistance <= this.radius) {
                return true;
            }
            return false;
        };
        return Circle2D;
    }());
    TSE.Circle2D = Circle2D;
})(TSE || (TSE = {}));
var TSE;
(function (TSE) {
    var Rectangle2D = (function () {
        function Rectangle2D(x, y, width, height) {
            if (x === void 0) { x = 0; }
            if (y === void 0) { y = 0; }
            if (width === void 0) { width = 0; }
            if (height === void 0) { height = 0; }
            this.position = TSE.Vector2.zero;
            this.origin = TSE.Vector2.zero;
            this.position.x = x;
            this.position.y = y;
            this.width = width;
            this.height = height;
        }
        Object.defineProperty(Rectangle2D.prototype, "offset", {
            get: function () {
                return new TSE.Vector2((this.width * this.origin.x), (this.height * this.origin.y));
            },
            enumerable: false,
            configurable: true
        });
        Rectangle2D.prototype.setFromJson = function (json) {
            if (json.position !== undefined) {
                this.position.setFromJson(json.position);
            }
            if (json.offset !== undefined) {
                this.offset.setFromJson(json.offset);
            }
            if (json.origin !== undefined) {
                this.origin.setFromJson(json.origin);
            }
            if (json.width === undefined) {
                throw new Error("Rectangle2D requires width to be present.");
            }
            this.width = Number(json.width);
            if (json.height === undefined) {
                throw new Error("Rectangle2D requires width to be present.");
            }
            this.height = Number(json.height);
        };
        Rectangle2D.prototype.intersect = function (other) {
            if (other instanceof Rectangle2D) {
                var a = this.getExtents(this);
                var b = this.getExtents(other);
                return (a.position.x <= b.width && a.width >= b.position.x) && (a.position.y <= b.height && a.height >= b.position.y);
            }
            if (other instanceof TSE.Circle2D) {
                var deltaX = other.position.x - Math.max(this.position.x, Math.min(other.position.x, this.position.x + this.width));
                var deltaY = other.position.y - Math.max(this.position.y, Math.min(other.position.y, this.position.y + this.height));
                if ((deltaX * deltaX + deltaY * deltaY) < (other.radius * other.radius)) {
                    return true;
                }
            }
            return false;
        };
        Rectangle2D.prototype.pointInShape = function (point) {
            var x = this.width < 0 ? this.position.x - this.width : this.position.x;
            var y = this.width < 0 ? this.position.y - this.width : this.position.y;
            var extentX = this.width < 0 ? this.position.x : this.position.x + this.width;
            var extentY = this.width < 0 ? this.position.y : this.position.y + this.width;
            if (point.x >= x && point.x <= extentX && point.y >= y && point.y <= extentY) {
                return true;
            }
            return false;
        };
        Rectangle2D.prototype.getExtents = function (shape) {
            var x = shape.width < 0 ? shape.position.x + shape.width : shape.position.x;
            var y = shape.height < 0 ? shape.position.y + shape.height : shape.position.y;
            var extentX = shape.width < 0 ? shape.position.x : shape.position.x + shape.width;
            var extentY = shape.height < 0 ? shape.position.y : shape.position.y + shape.height;
            return new Rectangle2D(x, y, extentX, extentY);
        };
        return Rectangle2D;
    }());
    TSE.Rectangle2D = Rectangle2D;
})(TSE || (TSE = {}));
var TSE;
(function (TSE) {
    var Vector2 = (function () {
        function Vector2(x, y) {
            if (x === void 0) { x = 0; }
            if (y === void 0) { y = 0; }
            this._x = x;
            this._y = y;
        }
        Object.defineProperty(Vector2.prototype, "x", {
            get: function () {
                return this._x;
            },
            set: function (value) {
                this._x = value;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(Vector2.prototype, "y", {
            get: function () {
                return this._y;
            },
            set: function (value) {
                this._y = value;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(Vector2, "zero", {
            get: function () {
                return new Vector2();
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(Vector2, "one", {
            get: function () {
                return new Vector2(1, 1);
            },
            enumerable: false,
            configurable: true
        });
        Vector2.distance = function (a, b) {
            var diff = a.clone().subtract(b);
            return Math.sqrt(diff.x * diff.x + diff.y * diff.y);
        };
        Vector2.prototype.copyFrom = function (v) {
            this._x = v._x;
            this._y = v._y;
        };
        Vector2.prototype.toArray = function () {
            return [this._x, this._y];
        };
        Vector2.prototype.toFloat32Array = function () {
            return new Float32Array(this.toArray());
        };
        Vector2.prototype.toVector3 = function () {
            return new TSE.Vector3(this._x, this._y, 0);
        };
        Vector2.prototype.set = function (x, y) {
            if (x !== undefined) {
                this._x = x;
            }
            if (y !== undefined) {
                this._y = y;
            }
        };
        Vector2.prototype.setFromJson = function (json) {
            if (json.x !== undefined) {
                this._x = Number(json.x);
            }
            if (json.y !== undefined) {
                this._y = Number(json.y);
            }
        };
        Vector2.prototype.add = function (v) {
            this._x += v._x;
            this._y += v._y;
            return this;
        };
        Vector2.prototype.subtract = function (v) {
            this._x -= v._x;
            this._y -= v._y;
            return this;
        };
        Vector2.prototype.multiply = function (v) {
            this._x *= v._x;
            this._y *= v._y;
            return this;
        };
        Vector2.prototype.divide = function (v) {
            this._x /= v._x;
            this._y /= v._y;
            return this;
        };
        Vector2.prototype.scale = function (scale) {
            this._x *= scale;
            this._y *= scale;
            return this;
        };
        Vector2.prototype.clone = function () {
            return new Vector2(this._x, this._y);
        };
        return Vector2;
    }());
    TSE.Vector2 = Vector2;
})(TSE || (TSE = {}));
var TSE;
(function (TSE) {
    var Keys;
    (function (Keys) {
        Keys[Keys["LEFT"] = 37] = "LEFT";
        Keys[Keys["UP"] = 38] = "UP";
        Keys[Keys["RIGHT"] = 39] = "RIGHT";
        Keys[Keys["DOWN"] = 40] = "DOWN";
    })(Keys = TSE.Keys || (TSE.Keys = {}));
    var MouseContext = (function () {
        function MouseContext(leftDown, rightDown, position) {
            this.leftDown = leftDown;
            this.rightDown = rightDown;
            this.position = position;
        }
        return MouseContext;
    }());
    TSE.MouseContext = MouseContext;
    var InputManager = (function () {
        function InputManager() {
        }
        InputManager.initialize = function (viewport) {
            for (var i = 0; i < 255; ++i) {
                InputManager._keys[i] = false;
            }
            window.addEventListener("keydown", InputManager.onKeyDown);
            window.addEventListener("keyup", InputManager.onKeyUp);
            viewport.addEventListener("mousemove", InputManager.onMouseMove);
            viewport.addEventListener("mousedown", InputManager.onMouseDown);
            viewport.addEventListener("mouseup", InputManager.onMouseUp);
        };
        InputManager.isKeyDown = function (key) {
            return InputManager._keys[key];
        };
        InputManager.getMousePosition = function () {
            return new TSE.Vector2(InputManager._mouseX, InputManager._mouseY);
        };
        InputManager.setResolutionScale = function (scale) {
            InputManager._resolutionScale.copyFrom(scale);
        };
        InputManager.onKeyDown = function (event) {
            InputManager._keys[event.keyCode] = true;
            return true;
        };
        InputManager.onKeyUp = function (event) {
            InputManager._keys[event.keyCode] = false;
            return true;
        };
        InputManager.onMouseMove = function (event) {
            InputManager._previousMouseX = InputManager._mouseX;
            InputManager._previousMouseY = InputManager._mouseY;
            var rect = event.target.getBoundingClientRect();
            InputManager._mouseX = (event.clientX - Math.round(rect.left)) * (1 / InputManager._resolutionScale.x);
            InputManager._mouseY = (event.clientY - Math.round(rect.top)) * (1 / InputManager._resolutionScale.y);
        };
        InputManager.onMouseDown = function (event) {
            if (event.button === 0) {
                this._leftDown = true;
            }
            else if (event.button === 2) {
                this._rightDown = true;
            }
            TSE.Message.send("MOUSE_DOWN", this, new MouseContext(InputManager._leftDown, InputManager._rightDown, InputManager.getMousePosition()));
        };
        InputManager.onMouseUp = function (event) {
            if (event.button === 0) {
                this._leftDown = false;
            }
            else if (event.button === 2) {
                this._rightDown = false;
            }
            TSE.Message.send("MOUSE_UP", this, new MouseContext(InputManager._leftDown, InputManager._rightDown, InputManager.getMousePosition()));
        };
        InputManager._keys = [];
        InputManager._leftDown = false;
        InputManager._rightDown = false;
        InputManager._resolutionScale = TSE.Vector2.zero;
        return InputManager;
    }());
    TSE.InputManager = InputManager;
})(TSE || (TSE = {}));
Math.clamp = function (value, min, max) {
    if (value < min) {
        return min;
    }
    if (value > max) {
        return max;
    }
    return value;
};
Math.degToRad = function (degrees) {
    return degrees * Math.PI / 180.0;
};
Math.radToDeg = function (degrees) {
    return degrees * 180.0 / Math.PI;
};
var TSE;
(function (TSE) {
    var Matrix4x4 = (function () {
        function Matrix4x4() {
            this._data = [];
            this._data = [
                1, 0, 0, 0,
                0, 1, 0, 0,
                0, 0, 1, 0,
                0, 0, 0, 1
            ];
        }
        Object.defineProperty(Matrix4x4.prototype, "data", {
            get: function () {
                return this._data;
            },
            enumerable: false,
            configurable: true
        });
        Matrix4x4.identity = function () {
            return new Matrix4x4();
        };
        Matrix4x4.orthographic = function (left, right, bottom, top, nearClip, farClip) {
            var m = new Matrix4x4();
            var lr = 1.0 / (left - right);
            var bt = 1.0 / (bottom - top);
            var nf = 1.0 / (nearClip - farClip);
            m._data[0] = -2.0 * lr;
            m._data[5] = -2.0 * bt;
            m._data[11] = 2.0 * nf;
            m._data[12] = (left + right) * lr;
            m._data[13] = (top + bottom) * bt;
            m._data[14] = (farClip + nearClip) * nf;
            return m;
        };
        Matrix4x4.translation = function (position) {
            var m = new Matrix4x4();
            m._data[12] = position.x;
            m._data[13] = position.y;
            m._data[14] = position.z;
            return m;
        };
        Matrix4x4.rotationX = function (angleInRadians) {
            var m = new Matrix4x4();
            var c = Math.cos(angleInRadians);
            var s = Math.sin(angleInRadians);
            m._data[5] = c;
            m._data[6] = s;
            m._data[9] = -s;
            m._data[10] = c;
            return m;
        };
        Matrix4x4.rotationY = function (angleInRadians) {
            var m = new Matrix4x4();
            var c = Math.cos(angleInRadians);
            var s = Math.sin(angleInRadians);
            m._data[0] = c;
            m._data[2] = -s;
            m._data[8] = s;
            m._data[10] = c;
            return m;
        };
        Matrix4x4.rotationZ = function (angleInRadians) {
            var m = new Matrix4x4();
            var c = Math.cos(angleInRadians);
            var s = Math.sin(angleInRadians);
            m._data[0] = c;
            m._data[1] = s;
            m._data[4] = -s;
            m._data[5] = c;
            return m;
        };
        Matrix4x4.rotationXYZ = function (xRadians, yRadians, zRadians) {
            var rx = Matrix4x4.rotationX(xRadians);
            var ry = Matrix4x4.rotationY(yRadians);
            var rz = Matrix4x4.rotationZ(zRadians);
            return Matrix4x4.multiply(Matrix4x4.multiply(rz, ry), rx);
        };
        Matrix4x4.scale = function (scale) {
            var m = new Matrix4x4();
            m._data[0] = scale.x;
            m._data[5] = scale.y;
            m._data[10] = scale.z;
            return m;
        };
        Matrix4x4.multiply = function (a, b) {
            var m = new Matrix4x4();
            var b00 = b._data[0 * 4 + 0];
            var b01 = b._data[0 * 4 + 1];
            var b02 = b._data[0 * 4 + 2];
            var b03 = b._data[0 * 4 + 3];
            var b10 = b._data[1 * 4 + 0];
            var b11 = b._data[1 * 4 + 1];
            var b12 = b._data[1 * 4 + 2];
            var b13 = b._data[1 * 4 + 3];
            var b20 = b._data[2 * 4 + 0];
            var b21 = b._data[2 * 4 + 1];
            var b22 = b._data[2 * 4 + 2];
            var b23 = b._data[2 * 4 + 3];
            var b30 = b._data[3 * 4 + 0];
            var b31 = b._data[3 * 4 + 1];
            var b32 = b._data[3 * 4 + 2];
            var b33 = b._data[3 * 4 + 3];
            var a00 = a._data[0 * 4 + 0];
            var a01 = a._data[0 * 4 + 1];
            var a02 = a._data[0 * 4 + 2];
            var a03 = a._data[0 * 4 + 3];
            var a10 = a._data[1 * 4 + 0];
            var a11 = a._data[1 * 4 + 1];
            var a12 = a._data[1 * 4 + 2];
            var a13 = a._data[1 * 4 + 3];
            var a20 = a._data[2 * 4 + 0];
            var a21 = a._data[2 * 4 + 1];
            var a22 = a._data[2 * 4 + 2];
            var a23 = a._data[2 * 4 + 3];
            var a30 = a._data[3 * 4 + 0];
            var a31 = a._data[3 * 4 + 1];
            var a32 = a._data[3 * 4 + 2];
            var a33 = a._data[3 * 4 + 3];
            m._data[0] = b00 * a00 + b01 * a10 + b02 * a20 + b03 * a30;
            m._data[1] = b00 * a01 + b01 * a11 + b02 * a21 + b03 * a31;
            m._data[2] = b00 * a02 + b01 * a12 + b02 * a22 + b03 * a32;
            m._data[3] = b00 * a03 + b01 * a13 + b02 * a23 + b03 * a33;
            m._data[4] = b10 * a00 + b11 * a10 + b12 * a20 + b13 * a30;
            m._data[5] = b10 * a01 + b11 * a11 + b12 * a21 + b13 * a31;
            m._data[6] = b10 * a02 + b11 * a12 + b12 * a22 + b13 * a32;
            m._data[7] = b10 * a03 + b11 * a13 + b12 * a23 + b13 * a33;
            m._data[8] = b20 * a00 + b21 * a10 + b22 * a20 + b23 * a30;
            m._data[9] = b20 * a01 + b21 * a11 + b22 * a21 + b23 * a31;
            m._data[10] = b20 * a02 + b21 * a12 + b22 * a22 + b23 * a32;
            m._data[11] = b20 * a03 + b21 * a13 + b22 * a23 + b23 * a33;
            m._data[12] = b30 * a00 + b31 * a10 + b32 * a20 + b33 * a30;
            m._data[13] = b30 * a01 + b31 * a11 + b32 * a21 + b33 * a31;
            m._data[14] = b30 * a02 + b31 * a12 + b32 * a22 + b33 * a32;
            m._data[15] = b30 * a03 + b31 * a13 + b32 * a23 + b33 * a33;
            return m;
        };
        Matrix4x4.prototype.toFloat32Array = function () {
            return new Float32Array(this._data);
        };
        Matrix4x4.prototype.copyFrom = function (matrix) {
            for (var i = 0; i < 16; ++i) {
                this._data[i] = matrix._data[i];
            }
        };
        return Matrix4x4;
    }());
    TSE.Matrix4x4 = Matrix4x4;
})(TSE || (TSE = {}));
var TSE;
(function (TSE) {
    var Transform = (function () {
        function Transform() {
            this.position = TSE.Vector3.zero;
            this.rotation = TSE.Vector3.zero;
            this.scale = TSE.Vector3.one;
        }
        Transform.prototype.copyFrom = function (transform) {
            this.position.copyFrom(transform.position);
            this.rotation.copyFrom(transform.rotation);
            this.scale.copyFrom(transform.scale);
        };
        Transform.prototype.getTransformationMatrix = function () {
            var translation = TSE.Matrix4x4.translation(this.position);
            var rotation = TSE.Matrix4x4.rotationXYZ(this.rotation.x, this.rotation.y, this.rotation.z);
            var scale = TSE.Matrix4x4.scale(this.scale);
            return TSE.Matrix4x4.multiply(TSE.Matrix4x4.multiply(translation, rotation), scale);
        };
        Transform.prototype.setFromJson = function (json) {
            if (json.position !== undefined) {
                this.position.setFromJson(json.position);
            }
            if (json.rotation !== undefined) {
                this.rotation.setFromJson(json.rotation);
            }
            if (json.scale !== undefined) {
                this.scale.setFromJson(json.scale);
            }
        };
        return Transform;
    }());
    TSE.Transform = Transform;
})(TSE || (TSE = {}));
var TSE;
(function (TSE) {
    var Vector3 = (function () {
        function Vector3(x, y, z) {
            if (x === void 0) { x = 0; }
            if (y === void 0) { y = 0; }
            if (z === void 0) { z = 0; }
            this._x = x;
            this._y = y;
            this._z = z;
        }
        Object.defineProperty(Vector3.prototype, "x", {
            get: function () {
                return this._x;
            },
            set: function (value) {
                this._x = value;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(Vector3.prototype, "y", {
            get: function () {
                return this._y;
            },
            set: function (value) {
                this._y = value;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(Vector3.prototype, "z", {
            get: function () {
                return this._z;
            },
            set: function (value) {
                this._z = value;
            },
            enumerable: false,
            configurable: true
        });
        Vector3.prototype.set = function (x, y, z) {
            if (x !== undefined) {
                this._x = x;
            }
            if (y !== undefined) {
                this._y = y;
            }
            if (z !== undefined) {
                this._z = z;
            }
        };
        Vector3.prototype.equals = function (v) {
            return (this.x === v.x && this.y === v.y && this.z === v.z);
        };
        Object.defineProperty(Vector3, "zero", {
            get: function () {
                return new Vector3();
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(Vector3, "one", {
            get: function () {
                return new Vector3(1, 1, 1);
            },
            enumerable: false,
            configurable: true
        });
        Vector3.distance = function (a, b) {
            var diff = a.clone().subtract(b);
            return Math.sqrt(diff.x * diff.x + diff.y * diff.y + diff.z * diff.z);
        };
        Vector3.prototype.toArray = function () {
            return [this._x, this._y, this._z];
        };
        Vector3.prototype.toFloat32Array = function () {
            return new Float32Array(this.toArray());
        };
        Vector3.prototype.copyFrom = function (vector) {
            this._x = vector._x;
            this._y = vector._y;
            this._z = vector._z;
        };
        Vector3.prototype.setFromJson = function (json) {
            if (json.x !== undefined) {
                this._x = Number(json.x);
            }
            if (json.y !== undefined) {
                this._y = Number(json.y);
            }
            if (json.z !== undefined) {
                this._z = Number(json.z);
            }
        };
        Vector3.prototype.add = function (v) {
            this._x += v._x;
            this._y += v._y;
            this._z += v._z;
            return this;
        };
        Vector3.prototype.subtract = function (v) {
            this._x -= v._x;
            this._y -= v._y;
            this._z -= v._z;
            return this;
        };
        Vector3.prototype.multiply = function (v) {
            this._x *= v._x;
            this._y *= v._y;
            this._z *= v._z;
            return this;
        };
        Vector3.prototype.divide = function (v) {
            this._x /= v._x;
            this._y /= v._y;
            this._z /= v._z;
            return this;
        };
        Vector3.prototype.clone = function () {
            return new Vector3(this._x, this._y, this._z);
        };
        Vector3.prototype.toVector2 = function () {
            return new TSE.Vector2(this._x, this._y);
        };
        return Vector3;
    }());
    TSE.Vector3 = Vector3;
})(TSE || (TSE = {}));
var TSE;
(function (TSE) {
    var MessagePriority;
    (function (MessagePriority) {
        MessagePriority[MessagePriority["NORMAL"] = 0] = "NORMAL";
        MessagePriority[MessagePriority["HIGH"] = 1] = "HIGH";
    })(MessagePriority = TSE.MessagePriority || (TSE.MessagePriority = {}));
    var Message = (function () {
        function Message(code, sender, context, priority) {
            if (priority === void 0) { priority = MessagePriority.NORMAL; }
            this.code = code;
            this.sender = sender;
            this.context = context;
            this.priority = priority;
        }
        Message.send = function (code, sender, context) {
            TSE.MessageBus.post(new Message(code, sender, context, MessagePriority.NORMAL));
        };
        Message.sendPriority = function (code, sender, context) {
            TSE.MessageBus.post(new Message(code, sender, context, MessagePriority.HIGH));
        };
        Message.subscribe = function (code, handler) {
            TSE.MessageBus.addSubscription(code, handler);
        };
        Message.unsubscribe = function (code, handler) {
            TSE.MessageBus.removeSubscription(code, handler);
        };
        return Message;
    }());
    TSE.Message = Message;
})(TSE || (TSE = {}));
var TSE;
(function (TSE) {
    var MessageBus = (function () {
        function MessageBus() {
        }
        MessageBus.addSubscription = function (code, handler) {
            if (MessageBus._subscriptions[code] === undefined) {
                MessageBus._subscriptions[code] = [];
            }
            if (MessageBus._subscriptions[code].indexOf(handler) !== -1) {
                console.warn("Attempting to add a duplicate handler to code: " + code + ". subscription not added.");
            }
            else {
                MessageBus._subscriptions[code].push(handler);
            }
        };
        MessageBus.removeSubscription = function (code, handler) {
            if (MessageBus._subscriptions[code] === undefined) {
                console.warn("Cannot unsubscribe handler from code: " + code + " because that code is not subscribed to.");
                return;
            }
            var nodeIndex = MessageBus._subscriptions[code].indexOf(handler);
            if (nodeIndex !== -1) {
                MessageBus._subscriptions[code].splice(nodeIndex, 1);
            }
        };
        MessageBus.post = function (message) {
            var handlers = MessageBus._subscriptions[message.code];
            if (handlers === undefined) {
                return;
            }
            for (var _i = 0, handlers_1 = handlers; _i < handlers_1.length; _i++) {
                var h = handlers_1[_i];
                if (message.priority === TSE.MessagePriority.HIGH) {
                    h.onMessage(message);
                }
                else {
                    MessageBus._normalMessageQueue.push(new TSE.MessageSubscriptionNode(message, h));
                }
            }
        };
        MessageBus.update = function (time) {
            if (MessageBus._normalMessageQueue.length === 0) {
                return;
            }
            var messageLimit = Math.min(MessageBus._normalQueueMessagePerUpdate, MessageBus._normalMessageQueue.length);
            for (var i = 0; i < messageLimit; ++i) {
                var node = MessageBus._normalMessageQueue.pop();
                node.handler.onMessage(node.message);
            }
        };
        MessageBus._subscriptions = {};
        MessageBus._normalQueueMessagePerUpdate = 10;
        MessageBus._normalMessageQueue = [];
        return MessageBus;
    }());
    TSE.MessageBus = MessageBus;
})(TSE || (TSE = {}));
var TSE;
(function (TSE) {
    var MessageSubscriptionNode = (function () {
        function MessageSubscriptionNode(message, handler) {
            this.message = message;
            this.handler = handler;
        }
        return MessageSubscriptionNode;
    }());
    TSE.MessageSubscriptionNode = MessageSubscriptionNode;
})(TSE || (TSE = {}));
var TSE;
(function (TSE) {
    var Scene = (function () {
        function Scene() {
            this._root = new TSE.SimObject(0, "__ROOT__", this);
        }
        Object.defineProperty(Scene.prototype, "root", {
            get: function () {
                return this._root;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(Scene.prototype, "isLoaded", {
            get: function () {
                return this._root.isLoaded;
            },
            enumerable: false,
            configurable: true
        });
        Scene.prototype.addObject = function (object) {
            this._root.addChild(object);
        };
        Scene.prototype.getObjectByName = function (name) {
            return this._root.getObjectByName(name);
        };
        Scene.prototype.load = function () {
            this._root.load();
        };
        Scene.prototype.update = function (time) {
            this._root.update(time);
        };
        Scene.prototype.render = function (shader) {
            this._root.render(shader);
        };
        return Scene;
    }());
    TSE.Scene = Scene;
})(TSE || (TSE = {}));
var TSE;
(function (TSE) {
    var SimObject = (function () {
        function SimObject(id, name, scene) {
            this._children = [];
            this._isLoaded = false;
            this._components = [];
            this._behaviors = [];
            this._isVisible = true;
            this._localMatrix = TSE.Matrix4x4.identity();
            this._worldMatrix = TSE.Matrix4x4.identity();
            this.transform = new TSE.Transform();
            this._id = id;
            this.name = name;
            this._scene = scene;
        }
        Object.defineProperty(SimObject.prototype, "id", {
            get: function () {
                return this._id;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(SimObject.prototype, "parent", {
            get: function () {
                return this._parent;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(SimObject.prototype, "worldMatrix", {
            get: function () {
                return this._worldMatrix;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(SimObject.prototype, "isLoaded", {
            get: function () {
                return this._isLoaded;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(SimObject.prototype, "isVisible", {
            get: function () {
                return this._isVisible;
            },
            set: function (value) {
                this._isVisible = value;
            },
            enumerable: false,
            configurable: true
        });
        SimObject.prototype.addChild = function (child) {
            child._parent = this;
            this._children.push(child);
            this.onAdded(this._scene);
        };
        SimObject.prototype.removeChild = function (child) {
            var index = this._children.indexOf(child);
            if (index !== -1) {
                child._parent = undefined;
                this._children.splice(index, 1);
            }
        };
        SimObject.prototype.getComponentByName = function (name) {
            for (var _i = 0, _a = this._components; _i < _a.length; _i++) {
                var component = _a[_i];
                if (component.name === name) {
                    return component;
                }
            }
            for (var _b = 0, _c = this._children; _b < _c.length; _b++) {
                var child = _c[_b];
                var component = child.getComponentByName(name);
                if (component !== undefined) {
                    return component;
                }
            }
            return undefined;
        };
        SimObject.prototype.getBehaviorByName = function (name) {
            for (var _i = 0, _a = this._behaviors; _i < _a.length; _i++) {
                var behavior = _a[_i];
                if (behavior.name === name) {
                    return behavior;
                }
            }
            for (var _b = 0, _c = this._children; _b < _c.length; _b++) {
                var child = _c[_b];
                var behavior = child.getBehaviorByName(name);
                if (behavior !== undefined) {
                    return behavior;
                }
            }
            return undefined;
        };
        SimObject.prototype.getObjectByName = function (name) {
            if (this.name === name) {
                return this;
            }
            for (var _i = 0, _a = this._children; _i < _a.length; _i++) {
                var child = _a[_i];
                var result = child.getObjectByName(name);
                if (result !== undefined) {
                    return result;
                }
            }
        };
        SimObject.prototype.addComponent = function (component) {
            this._components.push(component);
            component.setOwner(this);
        };
        SimObject.prototype.addBehavior = function (behavior) {
            this._behaviors.push(behavior);
            behavior.setOwner(this);
        };
        SimObject.prototype.load = function () {
            this._isLoaded = true;
            for (var _i = 0, _a = this._components; _i < _a.length; _i++) {
                var c = _a[_i];
                c.load();
            }
            for (var _b = 0, _c = this._children; _b < _c.length; _b++) {
                var c = _c[_b];
                c.load();
            }
        };
        SimObject.prototype.updateReady = function () {
            for (var _i = 0, _a = this._components; _i < _a.length; _i++) {
                var c = _a[_i];
                c.updateReady();
            }
            for (var _b = 0, _c = this._behaviors; _b < _c.length; _b++) {
                var b = _c[_b];
                b.updateReady();
            }
            for (var _d = 0, _e = this._children; _d < _e.length; _d++) {
                var c = _e[_d];
                c.updateReady();
            }
        };
        SimObject.prototype.update = function (time) {
            this._localMatrix = this.transform.getTransformationMatrix();
            this.updateWorldMatrix((this._parent !== undefined) ? this._parent.worldMatrix : undefined);
            for (var _i = 0, _a = this._components; _i < _a.length; _i++) {
                var c = _a[_i];
                c.update(time);
            }
            for (var _b = 0, _c = this._behaviors; _b < _c.length; _b++) {
                var b = _c[_b];
                b.update(time);
            }
            for (var _d = 0, _e = this._children; _d < _e.length; _d++) {
                var c = _e[_d];
                c.update(time);
            }
        };
        SimObject.prototype.render = function (shader) {
            if (!this._isVisible) {
                return;
            }
            for (var _i = 0, _a = this._components; _i < _a.length; _i++) {
                var c = _a[_i];
                c.render(shader);
            }
            for (var _b = 0, _c = this._children; _b < _c.length; _b++) {
                var c = _c[_b];
                c.render(shader);
            }
        };
        SimObject.prototype.getWorldPosition = function () {
            return new TSE.Vector3(this.worldMatrix.data[12], this.worldMatrix.data[13], this.worldMatrix.data[14]);
        };
        SimObject.prototype.onAdded = function (scene) {
            this._scene = scene;
        };
        SimObject.prototype.updateWorldMatrix = function (parentWorldMatrix) {
            if (parentWorldMatrix !== undefined) {
                this._worldMatrix = TSE.Matrix4x4.multiply(parentWorldMatrix, this._localMatrix);
            }
            else {
                this._worldMatrix.copyFrom(this._localMatrix);
            }
        };
        return SimObject;
    }());
    TSE.SimObject = SimObject;
})(TSE || (TSE = {}));
var TSE;
(function (TSE) {
    var ZoneState;
    (function (ZoneState) {
        ZoneState[ZoneState["UNINITIALIZED"] = 0] = "UNINITIALIZED";
        ZoneState[ZoneState["LOADING"] = 1] = "LOADING";
        ZoneState[ZoneState["UPDATING"] = 2] = "UPDATING";
    })(ZoneState = TSE.ZoneState || (TSE.ZoneState = {}));
    var Zone = (function () {
        function Zone(id, name, description) {
            this._state = ZoneState.UNINITIALIZED;
            this._globalID = -1;
            this._id = id;
            this._name = name;
            this._description = description;
            this._scene = new TSE.Scene();
        }
        Object.defineProperty(Zone.prototype, "id", {
            get: function () {
                return this._id;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(Zone.prototype, "name", {
            get: function () {
                return this._name;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(Zone.prototype, "description", {
            get: function () {
                return this._description;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(Zone.prototype, "scene", {
            get: function () {
                return this._scene;
            },
            enumerable: false,
            configurable: true
        });
        Zone.prototype.initialize = function (zoneData) {
            if (zoneData.objects === undefined) {
                throw new Error("zone initialization error: objects not present.");
            }
            for (var o in zoneData.objects) {
                var obj = zoneData.objects[o];
                this.loadSimObject(obj, this._scene.root);
            }
        };
        Zone.prototype.load = function () {
            this._state = ZoneState.LOADING;
            this._scene.load();
            this._scene.root.updateReady();
            this._state = ZoneState.UPDATING;
        };
        Zone.prototype.unload = function () {
        };
        Zone.prototype.update = function (time) {
            if (this._state === ZoneState.UPDATING) {
                this._scene.update(time);
            }
        };
        Zone.prototype.render = function (shader) {
            if (this._state === ZoneState.UPDATING) {
                this._scene.render(shader);
            }
        };
        Zone.prototype.onActivated = function () {
        };
        Zone.prototype.onDeactivated = function () {
        };
        Zone.prototype.loadSimObject = function (dataSection, parent) {
            var name;
            if (dataSection.name !== undefined) {
                name = String(dataSection.name);
            }
            this._globalID++;
            var simObject = new TSE.SimObject(this._globalID, name, this._scene);
            if (dataSection.transform !== undefined) {
                simObject.transform.setFromJson(dataSection.transform);
            }
            if (dataSection.components !== undefined) {
                for (var c in dataSection.components) {
                    var data = dataSection.components[c];
                    var component = TSE.ComponentManager.extractComponent(data);
                    simObject.addComponent(component);
                }
            }
            if (dataSection.behaviors !== undefined) {
                for (var b in dataSection.behaviors) {
                    var data = dataSection.behaviors[b];
                    var behavior = TSE.BehaviorManager.extractBehavior(data);
                    simObject.addBehavior(behavior);
                }
            }
            if (dataSection.children !== undefined) {
                for (var o in dataSection.children) {
                    var obj = dataSection.children[o];
                    this.loadSimObject(obj, simObject);
                }
            }
            if (parent !== undefined) {
                parent.addChild(simObject);
            }
        };
        return Zone;
    }());
    TSE.Zone = Zone;
})(TSE || (TSE = {}));
var TSE;
(function (TSE) {
    var ZoneManager = (function () {
        function ZoneManager() {
        }
        ZoneManager.initialize = function () {
            ZoneManager._inst = new ZoneManager();
            ZoneManager._registeredZones[0] = "assets/zones/testZone.json";
        };
        ZoneManager.changeZone = function (id) {
            if (ZoneManager._activeZone !== undefined) {
                ZoneManager._activeZone.onDeactivated();
                ZoneManager._activeZone.unload();
                ZoneManager._activeZone = undefined;
            }
            if (ZoneManager._registeredZones[id] !== undefined) {
                if (TSE.AssetManager.isAssetLoaded(ZoneManager._registeredZones[id])) {
                    var asset = TSE.AssetManager.getAsset(ZoneManager._registeredZones[id]);
                    ZoneManager.loadZone(asset);
                }
                else {
                    TSE.Message.subscribe(TSE.MESSAGE_ASSET_LOADER_ASSET_LOADED + ZoneManager._registeredZones[id], ZoneManager._inst);
                    TSE.AssetManager.loadAsset(ZoneManager._registeredZones[id]);
                }
            }
            else {
                throw new Error("Zone id:" + id.toString() + "does not exist.");
            }
        };
        ZoneManager.update = function (time) {
            if (ZoneManager._activeZone !== undefined) {
                ZoneManager._activeZone.update(time);
            }
        };
        ZoneManager.render = function (shader) {
            if (ZoneManager._activeZone !== undefined) {
                ZoneManager._activeZone.render(shader);
            }
        };
        ZoneManager.prototype.onMessage = function (message) {
            if (message.code.indexOf(TSE.MESSAGE_ASSET_LOADER_ASSET_LOADED) !== -1) {
                var asset = message.context;
                ZoneManager.loadZone(asset);
            }
        };
        ZoneManager.loadZone = function (asset) {
            var zoneData = asset.data;
            var zoneId;
            if (zoneData.id === undefined) {
                throw new Error("Zone file format exception: Zone id not present.");
            }
            else {
                zoneId = Number(zoneData.id);
            }
            var zoneName;
            if (zoneData.name === undefined) {
                throw new Error("Zone file format exception: Zone name not present.");
            }
            else {
                zoneName = String(zoneData.name);
            }
            var zoneDescription;
            if (zoneData.description !== undefined) {
                zoneDescription = String(zoneData.description);
            }
            ZoneManager._activeZone = new TSE.Zone(zoneId, zoneName, zoneDescription);
            ZoneManager._activeZone.initialize(zoneData);
            ZoneManager._activeZone.onActivated();
            ZoneManager._activeZone.load();
            TSE.Message.send("GAME_READY", this);
        };
        ZoneManager._globalZoneID = -1;
        ZoneManager._registeredZones = {};
        return ZoneManager;
    }());
    TSE.ZoneManager = ZoneManager;
})(TSE || (TSE = {}));
//# sourceMappingURL=main.js.map