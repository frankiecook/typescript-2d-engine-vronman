var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var engine;
// the main entry piont to the program
window.onload = function () {
    engine = new TSE.Engine(320, 480);
    engine.start();
};
window.onresize = function () {
    engine.resize();
};
var TSE;
(function (TSE) {
    TSE.MESSAGE_ASSET_LOADER_ASSET_LOADED = "MESSAGE_ASSET_LOADER_ASSET_LOADED::";
    var AssetManager = /** @class */ (function () {
        // private - dont want to accidentally call it 
        function AssetManager() {
        }
        // register loaders
        AssetManager.initialize = function () {
            AssetManager._loaders.push(new TSE.ImageAssetLoader());
            AssetManager._loaders.push(new TSE.JsonAssetLoader());
            AssetManager._loaders.push(new TSE.TextAssetLoader());
        };
        // add a loader for us to use
        // asumes that the loader passed in is unique
        AssetManager.registerLoader = function (loader) {
            AssetManager._loaders.push(loader);
        };
        // send message to members that need to know when the asset is loaded
        AssetManager.onAssetLoaded = function (asset) {
            AssetManager._loadedAssets[asset.name] = asset;
            TSE.Message.send(TSE.MESSAGE_ASSET_LOADER_ASSET_LOADED + asset.name, this, asset);
        };
        AssetManager.loadAsset = function (assetName) {
            // grabs the extension by splitting the string between periods
            // randomname.txt ==> randomname '.' txt ==> txt
            var extension = assetName.split('.').pop().toLowerCase();
            for (var _i = 0, _a = AssetManager._loaders; _i < _a.length; _i++) {
                var l = _a[_i];
                // if we find something to handle then return
                if (l.supportedExtensions.indexOf(extension) !== -1) {
                    l.loadAsset(assetName);
                    return;
                }
            }
            console.warn("unable to load asset with extension " + extension + "because there is no loader associated with it.");
        };
        // if our dictionary has an asset with this name AND it's loaded return true
        AssetManager.isAssetLoaded = function (assetName) {
            return AssetManager._loadedAssets[assetName] !== undefined;
        };
        // if asset exists return asset, if not then load it and return undefined
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
        AssetManager._loadedAssets = {}; // access asset by name in dictionary
        return AssetManager;
    }());
    TSE.AssetManager = AssetManager;
})(TSE || (TSE = {}));
var TSE;
(function (TSE) {
    var ImageAsset = /** @class */ (function () {
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
    var ImageAssetLoader = /** @class */ (function () {
        function ImageAssetLoader() {
        }
        Object.defineProperty(ImageAssetLoader.prototype, "supportedExtensions", {
            // extensions that most browsers support
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
            image.src = assetName; // last thing to do
        };
        ImageAssetLoader.prototype.onImageLoaded = function (assetName, image) {
            console.log("onImageLoaded: assetName/image", assetName, image);
            var asset = new ImageAsset(assetName, image);
            TSE.AssetManager.onAssetLoaded(asset); // register into asset dictionary
        };
        return ImageAssetLoader;
    }());
    TSE.ImageAssetLoader = ImageAssetLoader;
})(TSE || (TSE = {}));
var TSE;
(function (TSE) {
    var JsonAsset = /** @class */ (function () {
        function JsonAsset(name, data) {
            this.name = name;
            this.data = data;
        }
        return JsonAsset;
    }());
    TSE.JsonAsset = JsonAsset;
    var JsonAssetLoader = /** @class */ (function () {
        function JsonAssetLoader() {
        }
        Object.defineProperty(JsonAssetLoader.prototype, "supportedExtensions", {
            // extensions that most browsers support
            get: function () {
                return ["json"];
            },
            enumerable: false,
            configurable: true
        });
        JsonAssetLoader.prototype.loadAsset = function (assetName) {
            // tell the browser to make a request for a browser
            // GET request is a type of request for said file
            var request = new XMLHttpRequest();
            request.open("GET", assetName);
            request.addEventListener("load", this.onJsonLoaded.bind(this, assetName, request));
            // send request
            request.send();
        };
        // JSON loaded event
        JsonAssetLoader.prototype.onJsonLoaded = function (assetName, request) {
            console.log("onJsonLoaded: assetName/request", assetName, request);
            // check if the request is fully loaded
            if (request.readyState === request.DONE) {
                // basic JSON parsing
                var json = JSON.parse(request.responseText);
                // responseText contains the string of the request file
                var asset = new JsonAsset(assetName, json);
                TSE.AssetManager.onAssetLoaded(asset); // register into asset dictionary
            }
        };
        return JsonAssetLoader;
    }());
    TSE.JsonAssetLoader = JsonAssetLoader;
})(TSE || (TSE = {}));
var TSE;
(function (TSE) {
    /**
     * Text Asset communicates with data for Bitmaps
     */
    var TextAsset = /** @class */ (function () {
        function TextAsset(name, data) {
            this.name = name;
            this.data = data;
        }
        return TextAsset;
    }());
    TSE.TextAsset = TextAsset;
    var TextAssetLoader = /** @class */ (function () {
        function TextAssetLoader() {
        }
        Object.defineProperty(TextAssetLoader.prototype, "supportedExtensions", {
            // asset loader supports one type
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
    var SoundEffect = /** @class */ (function () {
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
            // stop the audio if it hasn't finished
            if (!this._player.paused) {
                this.stop();
            }
            this._player.play();
        };
        SoundEffect.prototype.pause = function () {
            this._player.pause();
        };
        // no stop() function exists
        SoundEffect.prototype.stop = function () {
            this._player.pause();
            this._player.currentTime = 0;
        };
        return SoundEffect;
    }());
    TSE.SoundEffect = SoundEffect;
    var AudioManager = /** @class */ (function () {
        function AudioManager() {
        }
        // load sound files can be accessible from anywhere
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
    var BaseBehavior = /** @class */ (function () {
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
        /* Behavior should be applied to the attached object
        * any data can be passed in and the behavior should know how to handle
        */
        BaseBehavior.prototype.apply = function (userData) {
        };
        return BaseBehavior;
    }());
    TSE.BaseBehavior = BaseBehavior;
})(TSE || (TSE = {}));
var TSE;
(function (TSE) {
    var BehaviorManager = /** @class */ (function () {
        function BehaviorManager() {
        }
        BehaviorManager.registerBuilder = function (builder) {
            BehaviorManager._registeredBuilders[builder.type] = builder;
        };
        /**
         * looks at the componenet managers regeristerd builders
         */
        BehaviorManager.extractBehavior = function (json) {
            if (json.type != undefined) {
                if (BehaviorManager._registeredBuilders[String(json.type)] !== undefined) {
                    return BehaviorManager._registeredBuilders[String(json.type)].buildFromJson(json);
                }
                throw new Error("COMponent mamanger error - type is missing or builder is not registered for this type.");
            }
        };
        BehaviorManager._registeredBuilders = {};
        return BehaviorManager;
    }());
    TSE.BehaviorManager = BehaviorManager;
})(TSE || (TSE = {}));
/// <reference path="basebehavior.ts" />
/// <reference path="behaviormanager.ts" />
var TSE;
(function (TSE) {
    var KeyboardMovementBehaviorData = /** @class */ (function () {
        function KeyboardMovementBehaviorData() {
            this.speed = 0.1;
        }
        /* load information from json */
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
    var KeyboardMovementBehaviorBuilder = /** @class */ (function () {
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
    /* handles rotation behavior of objects */
    var KeyboardMovementBehavior = /** @class */ (function (_super) {
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
    // auto register
    TSE.BehaviorManager.registerBuilder(new KeyboardMovementBehaviorBuilder());
})(TSE || (TSE = {}));
/// <reference path="basebehavior.ts" />
/// <reference path="behaviormanager.ts" />
var TSE;
(function (TSE) {
    var PlayerBehaviorData = /** @class */ (function () {
        function PlayerBehaviorData() {
            this.acceleration = new TSE.Vector2(0, 920);
        }
        /* load information from json */
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
        };
        return PlayerBehaviorData;
    }());
    TSE.PlayerBehaviorData = PlayerBehaviorData;
    var PlayerBehaviorBuilder = /** @class */ (function () {
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
    /* handles rotation behavior of objects */
    var PlayerBehavior = /** @class */ (function (_super) {
        __extends(PlayerBehavior, _super);
        function PlayerBehavior(data) {
            var _this = _super.call(this, data) || this;
            _this._velocity = TSE.Vector2.zero;
            _this._isAlive = true;
            _this._isPlaying = false;
            _this._initialPosition = TSE.Vector3.zero;
            _this._pipeNames = ["pip1Collision_end", "pip1Collision_middle_top", "pip1Collision_middle_bottom"];
            _this._acceleration = data.acceleration;
            _this._playerCollisionComponent = data.playerCollisionComponent;
            _this._groundCollisionComponent = data.groundCollisionComponent;
            _this._animatedSpriteName = data.animatedSpriteName;
            TSE.Message.subscribe("MOUSE_DOWN", _this);
            TSE.Message.subscribe("COLLISION_ENTRY:" + _this._playerCollisionComponent, _this);
            TSE.Message.subscribe("GAME_RESET", _this);
            TSE.Message.subscribe("GAME_START", _this);
            return _this;
        }
        PlayerBehavior.prototype.updateReady = function () {
            _super.prototype.updateReady.call(this);
            // obtain a reference to the animated sprite
            this._sprite = this._owner.getComponentByName(this._animatedSpriteName);
            if (this._sprite === undefined) {
                throw new Error("AnimatedSpriteComponent named '" + this._animatedSpriteName + "' is not attached to the owner of this component.");
            }
            // Make sure the animation plays right away
            this._sprite.setFrame(0);
            this._initialPosition.copyFrom(this._owner.transform.position);
        };
        PlayerBehavior.prototype.update = function (time) {
            var seconds = time / 1000;
            if (this._isPlaying) {
                this._velocity.add(this._acceleration.clone().scale(seconds));
            }
            // limit max speed
            if (this._velocity.y > 400) {
                this._velocity.y = 400;
            }
            // Prevent flying too high
            if (this._owner.transform.position.y < -13) {
                this._owner.transform.position.y = -13;
                this._velocity.y = 0;
            }
            // apply velocity changes
            this._owner.transform.position.add(this._velocity.clone().scale(seconds).toVector3());
            // rotation checks
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
            // animation check
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
        // check which message is recievec
        PlayerBehavior.prototype.onMessage = function (message) {
            switch (message.code) {
                case "MOUSE_DOWN":
                    this.onFlap();
                    break;
                case "COLLISION_ENTRY":
                    +this._playerCollisionComponent;
                    var data = message.context;
                    // check if collision is with the ground
                    if (data.a.name === this._groundCollisionComponent || data.b.name == this._groundCollisionComponent) {
                        this.die();
                        this.decelerate();
                    }
                    // check that pipe exists
                    if (this._pipeNames.indexOf(data.a.name) !== -1 || this._pipeNames.indexOf(data.b.name) !== -1) {
                        this.die();
                    }
                    break;
                case "GAME_RESET":
                    this.reset();
                    break;
                case "GAME_START":
                    this.start();
                    break;
            }
        };
        // in a free fall state if velocity is at least 220
        PlayerBehavior.prototype.isFalling = function () {
            return this._velocity.y > 220.0;
        };
        PlayerBehavior.prototype.shouldNotFlap = function () {
            return this._isPlaying || this._velocity.y > 220.0 || !this._isAlive;
        };
        PlayerBehavior.prototype.die = function () {
            // send only once
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
        PlayerBehavior.prototype.onRestart = function (y) {
            this._owner.transform.rotation.z = 0;
            this._owner.transform.position.set(33, y);
            this._velocity.set(0, 0);
            this._acceleration.set(0, 920);
            this._isAlive = true;
            this._sprite.play();
        };
        return PlayerBehavior;
    }(TSE.BaseBehavior));
    TSE.PlayerBehavior = PlayerBehavior;
    // auto register
    TSE.BehaviorManager.registerBuilder(new PlayerBehaviorBuilder());
})(TSE || (TSE = {}));
/// <reference path="basebehavior.ts" />
/// <reference path="behaviormanager.ts" />
var TSE;
(function (TSE) {
    var RotationBehaviorData = /** @class */ (function () {
        function RotationBehaviorData() {
            this.rotation = TSE.Vector3.zero;
        }
        /* load information from json */
        RotationBehaviorData.prototype.setFromJson = function (json) {
            if (json.name === undefined) {
                throw new Error("Name must be defined in behavior data.");
            }
            this.name = String(json.name);
            // check if the rotation from json data exists and set
            if (json.rotation !== undefined) {
                this.rotation.setFromJson(json.rotation);
            }
        };
        return RotationBehaviorData;
    }());
    TSE.RotationBehaviorData = RotationBehaviorData;
    var RotationBehaviorBuilder = /** @class */ (function () {
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
    /* handles rotation behavior of objects */
    var RotationBehavior = /** @class */ (function (_super) {
        __extends(RotationBehavior, _super);
        function RotationBehavior(data) {
            var _this = _super.call(this, data) || this;
            _this._rotation = data.rotation;
            return _this;
        }
        RotationBehavior.prototype.update = function (time) {
            /* basic computation for rotation */
            this._owner.transform.rotation.add(this._rotation);
            _super.prototype.update.call(this, time);
        };
        return RotationBehavior;
    }(TSE.BaseBehavior));
    TSE.RotationBehavior = RotationBehavior;
    // auto register
    TSE.BehaviorManager.registerBuilder(new RotationBehaviorBuilder());
})(TSE || (TSE = {}));
var TSE;
(function (TSE) {
    var ScrollBehaviorData = /** @class */ (function () {
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
        };
        return ScrollBehaviorData;
    }());
    TSE.ScrollBehaviorData = ScrollBehaviorData;
    var ScrollBehaviorBuilder = /** @class */ (function () {
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
    var ScrollBehavior = /** @class */ (function (_super) {
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
            // update initial position
            // VECTOR 2 TEMPORARY
            this._initialPosition.copyFrom(this._owner.transform.position.toVector2());
        };
        ScrollBehavior.prototype.update = function (time) {
            if (this._isScrolling) {
                // scale time to be in seconds
                this._owner.transform.position.add(this._velocity.clone().scale(time / 1000).toVector3());
                if (this._owner.transform.position.x <= this._minPosition.x &&
                    this._owner.transform.position.y <= this._minPosition.y) {
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
            this._owner.transform.position.copyFrom(this._resetPosition.toVector3());
        };
        ScrollBehavior.prototype.initial = function () {
            this._owner.transform.position.copyFrom(this._resetPosition.toVector3());
        };
        return ScrollBehavior;
    }(TSE.BaseBehavior));
    TSE.ScrollBehavior = ScrollBehavior;
    // add behavior to manager
    TSE.BehaviorManager.registerBuilder(new ScrollBehaviorBuilder());
})(TSE || (TSE = {}));
var TSE;
(function (TSE) {
    var CollisionData = /** @class */ (function () {
        function CollisionData(time, a, b) {
            this.time = time;
            this.a = a;
            this.b = b;
        }
        return CollisionData;
    }());
    TSE.CollisionData = CollisionData;
    var CollisionManager = /** @class */ (function () {
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
        /**
         * check for collision with each collision component
         * @param time
         */
        CollisionManager.update = function (time) {
            // inefficient way of checking against all other components in the scene
            // okay solution for now [sweep type method instead]
            CollisionManager._totalTime += time;
            for (var c = 0; c < CollisionManager._components.length; ++c) {
                var comp = CollisionManager._components[c];
                for (var o = 0; o < CollisionManager._components.length; ++o) {
                    var other = CollisionManager._components[o];
                    // do not check against collisions with self
                    if (comp === other) {
                        continue;
                    }
                    // optimization
                    // if both shapes are static, stop detection
                    if (comp.isStatic && other.isStatic) {
                        continue;
                    }
                    // intercept check
                    if (comp.shape.intersect(other.shape)) {
                        // we have a collision!
                        var exists = false;
                        for (var d = 0; d < CollisionManager._collisionData.length; ++d) {
                            var data = CollisionManager._collisionData[d];
                            // two conditions for exisiting collision data
                            if ((data.a === comp && data.b === other) || (data.a === other || data.b === comp)) {
                                // we have exisitng data. update it.
                                // onCollisionUpdate
                                comp.onCollisionUpdate(other);
                                other.onCollisionUpdate(comp);
                                data.time = CollisionManager._totalTime;
                                exists = true;
                                break;
                            }
                        }
                        if (!exists) {
                            // create a new collision
                            var col = new CollisionData(CollisionManager._totalTime, comp, other);
                            comp.onCollisionEntry(other);
                            other.onCollisionEntry(comp);
                            // two messages to whoever is listening to this collision
                            TSE.Message.sendPriority("COLLISION_ENTRY:" + comp.name, this, col);
                            TSE.Message.sendPriority("COLLISION_ENTRY:" + other.name, this, col);
                            this._collisionData.push(col);
                        }
                    }
                }
            }
            /**
             * locate collisions from the previous frame and delete them
             */
            var removeData = [];
            for (var d = 0; d < CollisionManager._collisionData.length; ++d) {
                var data = CollisionManager._collisionData[d];
                if (data.time !== CollisionManager._totalTime) {
                    // old collision data
                    removeData.push(data);
                }
            }
            // remove the stale data
            while (removeData.length !== 0) {
                var data = removeData.shift();
                var index = CollisionManager._collisionData.indexOf(removeData[0]);
                CollisionManager._collisionData.splice(index, 1);
                data.a.onCollisionExit(data.b);
                data.a.onCollisionExit(data.a);
                TSE.Message.sendPriority("COLLISION_EXIT:" + data.a.name, this, data);
                TSE.Message.sendPriority("COLLISION_EXIT:" + data.b.name, this, data);
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
    var ComponentManager = /** @class */ (function () {
        function ComponentManager() {
        }
        ComponentManager.registerBuilder = function (builder) {
            ComponentManager._registeredBuilders[builder.type] = builder;
        };
        /**
         * looks at the componenet managers regeristerd builders
         */
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
    var BaseComponent = /** @class */ (function () {
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
/// <reference path="componentmanager.ts" />
var TSE;
(function (TSE) {
    var SpriteComponenetData = /** @class */ (function () {
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
            // set origin from json
            if (json.origin !== undefined) {
                this.origin.setFromJson(json.origin);
            }
        };
        return SpriteComponenetData;
    }());
    TSE.SpriteComponenetData = SpriteComponenetData;
    /**
     * construct a componenet using the data read from JSON
     * built indepedently of all pieces to allow for any number of componentst to be created
     */
    var SpriteComponentBuilder = /** @class */ (function () {
        function SpriteComponentBuilder() {
        }
        Object.defineProperty(SpriteComponentBuilder.prototype, "type", {
            // For whatever is looking at this, this is the type of the data
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
    var SpriteComponent = /** @class */ (function (_super) {
        __extends(SpriteComponent, _super);
        function SpriteComponent(data) {
            var _this = _super.call(this, data) || this;
            _this._width = data.width;
            _this._height = data.height;
            _this._sprite = new TSE.Sprite(name, data.materialName, _this._width, _this._height);
            // only run code if origin is default values
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
    // as soon as file is loaded, register
    TSE.ComponentManager.registerBuilder(new SpriteComponentBuilder());
})(TSE || (TSE = {}));
/// <reference path="componentmanager.ts" />
/// <reference path="basecomponent.ts" />
/// <reference path="spritecomponent.ts" />
var TSE;
(function (TSE) {
    var AnimatedSpriteComponenetData = /** @class */ (function (_super) {
        __extends(AnimatedSpriteComponenetData, _super);
        function AnimatedSpriteComponenetData() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this.frameSequence = [];
            _this.autoPlay = true;
            return _this;
        }
        // require all above properties to be present
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
        };
        return AnimatedSpriteComponenetData;
    }(TSE.SpriteComponenetData));
    TSE.AnimatedSpriteComponenetData = AnimatedSpriteComponenetData;
    /**
     * construct a componenet using the data read from JSON
     * built indepedently of all pieces to allow for any number of componentst to be created
     */
    var AnimatedSpriteComponentBuilder = /** @class */ (function () {
        function AnimatedSpriteComponentBuilder() {
        }
        Object.defineProperty(AnimatedSpriteComponentBuilder.prototype, "type", {
            // For whatever is looking at this, this is the type of the data
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
    var AnimatedSpriteComponent = /** @class */ (function (_super) {
        __extends(AnimatedSpriteComponent, _super);
        function AnimatedSpriteComponent(data) {
            var _this = _super.call(this, data) || this;
            _this._autoPlay = true;
            _this._autoPlay = data.autoPlay;
            _this._sprite = new TSE.AnimatedSprite(name, data.materialName, data.frameWidth, data.frameHeight, data.frameWidth, data.frameHeight, data.frameCount, data.frameSequence);
            // only run code if origin is default values
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
            // call stop on animation so it doesnt initiate
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
    // as soon as file is loaded, register
    TSE.ComponentManager.registerBuilder(new AnimatedSpriteComponentBuilder());
})(TSE || (TSE = {}));
var TSE;
(function (TSE) {
    var BitmapTextComponentData = /** @class */ (function () {
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
    var BitmapTextComponentBuilder = /** @class */ (function () {
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
    var BitmapTextComponent = /** @class */ (function (_super) {
        __extends(BitmapTextComponent, _super);
        function BitmapTextComponent(data) {
            var _this = _super.call(this, data) || this;
            _this._fontName = data.fontName;
            _this._bitmapText = new TSE.BitmapText(_this.name, _this._fontName);
            if (!data.origin.equals(TSE.Vector3.zero)) {
                _this._bitmapText.origin.copyFrom(data.origin);
            }
            _this._bitmapText.text = data.text;
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
        return BitmapTextComponent;
    }(TSE.BaseComponent));
    TSE.BitmapTextComponent = BitmapTextComponent;
    TSE.ComponentManager.registerBuilder(new BitmapTextComponentBuilder());
})(TSE || (TSE = {}));
/// <reference path="componentmanager.ts" />
var TSE;
(function (TSE) {
    var CollisionComponentData = /** @class */ (function () {
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
            // check if shape exists
            if (json.shape === undefined) {
                throw new Error("CollisionComponenetData requires 'shape' to be present.");
            }
            else {
                // check if type of shape exist (rectangle, circle, etc.)
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
    /**
     * construct a componenet using the data read from JSON
     * built indepedently of all pieces to allow for any number of componentst to be created
     */
    var CollisionComponentBuilder = /** @class */ (function () {
        function CollisionComponentBuilder() {
        }
        Object.defineProperty(CollisionComponentBuilder.prototype, "type", {
            // For whatever is looking at this, this is the type of the data
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
    var CollisionComponent = /** @class */ (function (_super) {
        __extends(CollisionComponent, _super);
        function CollisionComponent(data) {
            var _this = _super.call(this, data) || this;
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
        CollisionComponent.prototype.load = function () {
            _super.prototype.load.call(this);
            // TODO: update this to handle nested objects
            this._shape.position.copyFrom(this.owner.getWorldPosition().toVector2().subtract(this._shape.offset));
            // tell the collision manager that we exist
            TSE.CollisionManager.registerCollisionComponent(this);
        };
        /**
         * Grab the shape's position and add to the owner's transform position
         * @returns
         */
        CollisionComponent.prototype.update = function (time) {
            // TODO: update this to handle nested objects
            this._shape.position.copyFrom(this.owner.getWorldPosition().toVector2().subtract(this._shape.offset));
            _super.prototype.update.call(this, time);
        };
        //** Collsiion boxes do not render, except for debugging */
        CollisionComponent.prototype.render = function (shader) {
            //this._sprite.draw(shader, this.owner.worldMatrix);
            _super.prototype.render.call(this, shader);
        };
        CollisionComponent.prototype.onCollisionEntry = function (other) {
            console.log("onCollisionEntry: ", this, other);
        };
        CollisionComponent.prototype.onCollisionUpdate = function (other) {
            //console.log("onCollisionUpdate: ", this, other);
        };
        CollisionComponent.prototype.onCollisionExit = function (other) {
            console.log("onCollisionExit: ", this, other);
        };
        return CollisionComponent;
    }(TSE.BaseComponent));
    TSE.CollisionComponent = CollisionComponent;
    // as soon as file is loaded, register
    TSE.ComponentManager.registerBuilder(new CollisionComponentBuilder());
})(TSE || (TSE = {}));
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
            this._gameWidth = width;
            this._gameHeight = height;
        }
        Engine.prototype.start = function () {
            this._canvas = TSE.GLUtilities.initialize();
            // set width and height if exists
            if (this._gameWidth !== undefined && this._gameHeight !== undefined) {
                // px for CSS property
                this._canvas.style.width = this._gameWidth + "px";
                this._canvas.style.height = this._gameHeight + "px";
                this._canvas.width = this._gameWidth;
                this._canvas.height = this._gameHeight;
            }
            // initialize assets and zones
            TSE.AssetManager.initialize();
            TSE.InputManager.initialize();
            TSE.ZoneManager.initialize();
            // what color the webgl will be cleared to for every frame
            TSE.gl.clearColor(146 / 255, 206 / 255, 247 / 255, 1);
            TSE.gl.enable(TSE.gl.BLEND);
            TSE.gl.blendFunc(TSE.gl.SRC_ALPHA, TSE.gl.ONE_MINUS_SRC_ALPHA);
            this._basicShader = new TSE.BasicShader();
            this._basicShader.use();
            this._projection = TSE.Matrix4x4.orthographic(0, this._canvas.width, this._canvas.height, 0, -100.0, 100.0);
            // load fonts
            TSE.BitmapFontManager.addFont("default", "assets/fonts/text.txt");
            TSE.BitmapFontManager.load();
            // load materials
            TSE.MaterialManager.registerMaterial(new TSE.Material("leaves", "assets/textures/dk64-leaves.png", TSE.Color.white()));
            TSE.MaterialManager.registerMaterial(new TSE.Material("duck", "assets/textures/duck.png", TSE.Color.white()));
            TSE.MaterialManager.registerMaterial(new TSE.Material("grass", "assets/textures/grass.png", TSE.Color.white()));
            TSE.MaterialManager.registerMaterial(new TSE.Material("bg", "assets/textures/bg.png", TSE.Color.white()));
            TSE.MaterialManager.registerMaterial(new TSE.Material("end", "assets/textures/end.png", TSE.Color.white()));
            TSE.MaterialManager.registerMaterial(new TSE.Material("middle", "assets/textures/middle.png", TSE.Color.white()));
            TSE.AudioManager.loadSoundFile("flap", "assets/sounds/flap.mp3", false);
            TSE.AudioManager.loadSoundFile("ting", "assets/sounds/ting.mp3", false);
            TSE.AudioManager.loadSoundFile("dead", "assets/sounds/dead.mp3", false);
            // load
            this._projection = TSE.Matrix4x4.orthographic(0, this._canvas.width, this._canvas.height, 0, -100.0, 100.0);
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
                }
                // tells webgl to use the full range of the viewport
                TSE.gl.viewport(0, 0, this._canvas.width, this._canvas.height);
                // give webgl a reference for the maximum area of the screen
                TSE.gl.viewport(0, 0, TSE.gl.canvas.width, TSE.gl.canvas.height);
                this._projection = TSE.Matrix4x4.orthographic(0, this._canvas.width, this._canvas.height, 0, -100.0, 100.0);
            }
        };
        Engine.prototype.onMessage = function (message) {
            if (message.code === "MOUSE_UP") {
                var context = message.context;
                document.title = 'Pos: [String(context.position.x},${context.position.y}]';
            }
        };
        Engine.prototype.loop = function () {
            this.update();
            this.render();
            // runs about 60 fps, originally designed for animations 
            // .bind(this) is calling loop() for THIS instance of the engine
            requestAnimationFrame(this.loop.bind(this));
        };
        // operates on a game loop of its own but in a different state
        Engine.prototype.preloading = function () {
            // make sure to always update the message bus
            TSE.MessageBus.update(0);
            // bitmap fonts are 'system level' and need to be running for the engine to operate
            if (!TSE.BitmapFontManager.updateReady()) {
                requestAnimationFrame(this.preloading.bind(this));
                return;
            }
            // load up our zone TODO: make this configurable
            TSE.ZoneManager.changeZone(0);
            // kick off the loop
            this.loop();
        };
        Engine.prototype.update = function () {
            // calculate time
            // performance.now() is very accurate
            var delta = performance.now() - this._previousTime;
            TSE.MessageBus.update(delta);
            TSE.ZoneManager.update(delta);
            TSE.CollisionManager.update(delta);
            this._previousTime = performance.now();
        };
        Engine.prototype.render = function () {
            // clears the buffer that draws the next frame of color
            // potential weird effects??
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
    /**
     * Responsible for setting up a WebGL rendering context
     */
    var GLUtilities = /** @class */ (function () {
        function GLUtilities() {
        }
        /**
         * Initializes Webgl, potentially using the canvas with an assigned id matching the provided if it is defined
         * @param elementId The id of the element to search for
         */
        // static does not need an object of the class to be called
        // Example, GLUtilities.initialize();
        GLUtilities.initialize = function (elementId) {
            var canvas;
            if (elementId !== undefined) {
                // casting converts from one type to a similar type
                canvas = document.getElementById(elementId);
                if (canvas === undefined) {
                    throw new Error("cannot find a canvas element neamed:" + elementId);
                }
            }
            else {
                canvas = document.createElement("canvas");
                document.body.appendChild(canvas);
            }
            // check for canvas context in webgl
            TSE.gl = canvas.getContext("webgl");
            if (TSE.gl === undefined || TSE.gl == null) {
                // specifc to windows explorer
                //gl = canvas.getContext("experimental-webgl");
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
    // treating this class a struct because typescript/js does not have structs
    var AttributeInfo = /** @class */ (function () {
        function AttributeInfo() {
        }
        return AttributeInfo;
    }());
    TSE.AttributeInfo = AttributeInfo;
    var GLBuffer = /** @class */ (function () {
        /**
         * creates a new buffer
         * @param elementSize size of each element in this buffer
         * @param dataType the data type of this buffer. default: gl.FLOAT
         * @param targetBufferType buffer target type. can be either gl.ARRAY_BUFFER or gl.ELEMENT_ARRAY_BUFFER. Default: gl.ARRAY_BUFFER
         * @param mode drawing mode of this buffer. default: gl.TRIANGLES
         */
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
            // determine byte size
            // something you do no want to think about
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
        // normalized indicated if the data should be normalized
        GLBuffer.prototype.bind = function (normalized) {
            if (normalized === void 0) { normalized = false; }
            TSE.gl.bindBuffer(this._targetBufferType, this._buffer);
            // attributes hold information to pass into the buffer
            if (this._hasAttributeLocation) {
                for (var _i = 0, _a = this._attributes; _i < _a.length; _i++) {
                    var it = _a[_i];
                    TSE.gl.vertexAttribPointer(it.location, it.size, this._dataType, normalized, this._stride, it.offset * this._typeSize);
                    TSE.gl.enableVertexAttribArray(it.location);
                }
            }
        };
        GLBuffer.prototype.unbind = function () {
            // disable each attribute
            for (var _i = 0, _a = this._attributes; _i < _a.length; _i++) {
                var it = _a[_i];
                TSE.gl.disableVertexAttribArray(it.location);
            }
            TSE.gl.bindBuffer(this._targetBufferType, undefined);
        };
        /**
         * adds an attribute witht the provided information
         * @param info
         */
        GLBuffer.prototype.addAttributeLocation = function (info) {
            this._hasAttributeLocation = true;
            info.offset = this._elementSize;
            this._attributes.push(info);
            this._elementSize += info.size;
            // stride is equal to how big the element is times the size of the element
            this._stride = this._elementSize * this._typeSize;
        };
        /**
         * replaces the current data in this buffer with the provided data
         * @param data data to be loaded in this buffer
         */
        GLBuffer.prototype.setData = function (data) {
            this.clearData();
            this.pushBackData(data);
        };
        /**
         * add data to this buffer
         * @param data
         */
        GLBuffer.prototype.pushBackData = function (data) {
            for (var _i = 0, data_1 = data; _i < data_1.length; _i++) {
                var d = data_1[_i];
                this._data.push(d);
            }
        };
        /**
         * clears out all data in this buffer
         */
        GLBuffer.prototype.clearData = function () {
            this._data.length = 0;
        };
        /**
         * upload data to GPU (want to run this one time)
         */
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
        /**
         * draws the buffer
         */
        GLBuffer.prototype.draw = function () {
            if (this._targetBufferType === TSE.gl.ARRAY_BUFFER) {
                // total element count is length of data divided by the element size
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
    // can not create an instance of an abstract class
    var Shader = /** @class */ (function () {
        /**
         * creates a new shader
         * @param vertexSource source of vs
         * @param fragmentSource source of fs
         */
        function Shader(name) {
            this._attributes = {}; // hash pair
            this._uniforms = {};
            this._name = name;
        }
        Object.defineProperty(Shader.prototype, "name", {
            /**Name of the shader */
            get: function () {
                return this._name;
            },
            enumerable: false,
            configurable: true
        });
        /**
         * tell webgl we want to use the shader
         */
        Shader.prototype.use = function () {
            TSE.gl.useProgram(this._program);
        };
        /**
         * gets the location of an attribute witht the provided name
         */
        Shader.prototype.getAttributeLocation = function (name) {
            if (this._attributes[name] === undefined) {
                console.log(this._attributes);
                throw new Error('Unable to find attribute named:' + name + " All attributes:" + this._attributes[0]);
            }
            return this._attributes[name];
        };
        /**
     * gets the location of an uniform witht he provided name
     */
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
        // loads up one of the shaders and compiles it
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
            this._program = TSE.gl.createProgram(); // reserve a program for us
            TSE.gl.attachShader(this._program, vertexShader);
            TSE.gl.attachShader(this._program, fragmentShader);
            TSE.gl.linkProgram(this._program);
            var error = TSE.gl.getProgramInfoLog(this._program).trim();
            if (error !== "") {
                throw new Error("Error linking shader: " + this._name + ":" + error);
            }
        };
        /**
         * find all attributes and their respective locations
         */
        Shader.prototype.detectAttributes = function () {
            // retrives a count of all the attributes in shader
            var attributeCount = TSE.gl.getProgramParameter(this._program, TSE.gl.ACTIVE_ATTRIBUTES);
            for (var i = 0; i < attributeCount; ++i) {
                // attribute information
                var info = TSE.gl.getActiveAttrib(this._program, i);
                if (!info) {
                    break;
                }
                this._attributes[info.name] = TSE.gl.getAttribLocation(this._program, info.name);
            }
        };
        /**
         * find all uniforms and their respective locations
         */
        Shader.prototype.detectUniforms = function () {
            // retrives a count of all the attributes in shader
            var uniformCount = TSE.gl.getProgramParameter(this._program, TSE.gl.ACTIVE_UNIFORMS);
            for (var i = 0; i < uniformCount; ++i) {
                // attribute information
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
    var BasicShader = /** @class */ (function (_super) {
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
    /**
     * _vertices: need a copy of the vertex data for this sprite
     */
    var Sprite = /** @class */ (function () {
        function Sprite(name, materialName, width, height) {
            if (width === void 0) { width = 50; }
            if (height === void 0) { height = 50; }
            this._origin = TSE.Vector3.zero;
            this._name = name;
            this._width = width;
            this._height = height;
            this._materialName = materialName;
            this._material = TSE.MaterialManager.getMaterial(this._materialName);
            if (name === "grass") {
                console.log("GROUND SPRITE");
            }
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
                // when origin is set
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
            // position attribute is always known to be the first attribute
            // for the purpose of this tutorial we will set the lcoation to 0, not dynamic intentionally
            positionAttribute.location = 0; //this._shader.getAttributeLocation("a_position");
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
        // draw method of sprite changes to use a model instead of a position variable
        //
        Sprite.prototype.draw = function (shader, model) {
            // take in a model matrix
            var modelLocation = shader.getUniformLocation("u_model");
            TSE.gl.uniformMatrix4fv(modelLocation, false, model.toFloat32Array());
            // set uniforms
            var colorLocation = shader.getUniformLocation("u_tint");
            // 4fv takes a vector of information
            TSE.gl.uniform4fv(colorLocation, this._material.tint.toFloat32Array());
            // check if the material has a diffuseTexture
            if (this._material.diffuseTexture !== undefined) {
                this._material.diffuseTexture.activateAndBind(0);
                // set up the uniform to know what texture channel to pull
                var diffuseLocation = shader.getUniformLocation("u_diffuse");
                TSE.gl.uniform1i(diffuseLocation, 0);
            }
            else {
                console.log("texture diffuse is undefined");
            }
            // draw to screen
            //gl.bindBuffer(gl.ARRAY_BUFFER, this._buffer);
            this._buffer.bind();
            this._buffer.draw();
        };
        Sprite.prototype.calculateVertices = function () {
            // calculate offset from origin
            var minX = -(this._width * this._origin.x);
            var maxX = this._width * (1.0 - this._origin.x);
            var minY = -(this._height * this._origin.y);
            var maxY = this._height * (1.0 - this._origin.y);
            this._vertices = [
                // x, y, z	, u, v
                new TSE.Vertex(minX, minY, 0, 0, 0),
                new TSE.Vertex(minX, maxY, 0, 0, 1.0),
                new TSE.Vertex(maxX, maxY, 0, 1.0, 1.0),
                new TSE.Vertex(maxX, maxY, 0, 1.0, 1.0),
                new TSE.Vertex(maxX, minY, 0, 1.0, 0),
                new TSE.Vertex(minX, minY, 0, 0, 0)
            ];
            for (var _i = 0, _a = this._vertices; _i < _a.length; _i++) {
                var v = _a[_i];
                // hey webgl, we want to pass you info
                this._buffer.pushBackData(v.toArray());
            }
            this._buffer.upload();
            this._buffer.unbind();
        };
        Sprite.prototype.recalculateVertices = function () {
            // calculate offset from origin
            var minX = -(this._width * this._origin.x);
            var maxX = this._width * (1.0 - this._origin.x);
            var minY = -(this._height * this._origin.y);
            var maxY = this._height * (1.0 - this._origin.y);
            this._vertices[0].position.set(minX, minY);
            this._vertices[1].position.set(minX, maxY);
            this._vertices[2].position.set(maxX, maxY);
            // 3, 4, 5
            this._vertices[3].position.set(maxX, maxY);
            this._vertices[4].position.set(maxX, minY);
            this._vertices[5].position.set(minX, minY);
            this._buffer.clearData();
            for (var _i = 0, _a = this._vertices; _i < _a.length; _i++) {
                var v = _a[_i];
                // hey wgl, we want to pass you info
                this._buffer.pushBackData(v.toArray());
            }
            this._buffer.upload();
            this._buffer.unbind();
        };
        return Sprite;
    }());
    TSE.Sprite = Sprite;
})(TSE || (TSE = {}));
/// <reference path="sprite.ts" />
var TSE;
(function (TSE) {
    /**
     * stores the minimum and maximum UV coordinates
     */
    var UVInfo = /** @class */ (function () {
        function UVInfo(min, max) {
            this.min = min;
            this.max = max;
        }
        return UVInfo;
    }());
    /**
     * Represents a 2-dimensional animated sprite
     * @_frameHeight height of frame in sprite sheet
     * @_frameWidth width of rame in sprite sheet
     * @_frameCount current frame
     * @_frameSequence order of frames
     * @_currentFrame current frame for animation
     * @_frameUVs calculated and stored UVs for each frame
     * @_frameTime how long a frame lasts in ms
     * @_currentTime tracks the current time in update
     */
    var AnimatedSprite = /** @class */ (function (_super) {
        __extends(AnimatedSprite, _super);
        function AnimatedSprite(name, materialName, width, height, frameWidth, frameHeight, frameCount, frameSequence) {
            if (width === void 0) { width = 50; }
            if (height === void 0) { height = 50; }
            if (frameWidth === void 0) { frameWidth = 10; }
            if (frameHeight === void 0) { frameHeight = 10; }
            if (frameCount === void 0) { frameCount = 1; }
            if (frameSequence === void 0) { frameSequence = []; }
            var _this = _super.call(this, name, materialName, width, height) || this;
            _this._currentFrame = 0;
            _this._frameUVs = [];
            // TODO: make configurable
            _this._frameTime = 333;
            _this._currentTime = 0;
            _this._assetLoaded = false;
            _this._assetWidth = 2;
            _this._assetHeight = 2;
            _this._isPlaying = true;
            _this._frameHeight = frameHeight;
            _this._frameWidth = frameWidth;
            _this._frameCount = frameCount;
            _this._frameSequence = frameSequence;
            // message subscription is for calculating UVs
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
        // must wait until the asset has loaded to calculate UVs
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
            // boot out early if not animating
            if (!this._isPlaying) {
                return;
            }
            // update the current time
            this._currentTime += time;
            // if current time is beyond the frame time (ms) update the frame
            if (this._currentTime > this._frameTime) {
                this._currentFrame++;
                this._currentTime = 0;
                // don't let current frame exceed the frame length
                if (this._currentFrame >= this._frameSequence.length) {
                    this._currentFrame = 0;
                }
                // use the current frame in the frame sequence to copy UV data from
                var frameUVs = this._frameSequence[this._currentFrame];
                this._vertices[0].texCoords.copyFrom(this._frameUVs[frameUVs].min);
                this._vertices[1].texCoords = new TSE.Vector2(this._frameUVs[frameUVs].min.x, this._frameUVs[frameUVs].max.y);
                this._vertices[2].texCoords.copyFrom(this._frameUVs[frameUVs].max);
                // broken for some reason 4,3,5
                this._vertices[3].texCoords.copyFrom(this._frameUVs[frameUVs].max);
                this._vertices[4].texCoords = new TSE.Vector2(this._frameUVs[frameUVs].max.x, this._frameUVs[frameUVs].min.y);
                this._vertices[5].texCoords.copyFrom(this._frameUVs[frameUVs].min);
                this._vertices[0].texCoords = new TSE.Vector2(0 + 0.333 * frameUVs, 0);
                this._vertices[1].texCoords = new TSE.Vector2(0 + 0.333 * frameUVs, 1);
                this._vertices[2].texCoords = new TSE.Vector2(0.333 * (frameUVs + 1), 1);
                // broken for some reason 5,3,4
                this._vertices[5].texCoords = new TSE.Vector2(0 + 0.333 * frameUVs, 0);
                this._vertices[3].texCoords = new TSE.Vector2(0.33 * (frameUVs + 1), 1);
                this._vertices[4].texCoords = new TSE.Vector2(0.33 * (frameUVs + 1), 0);
                // update buffer
                this._buffer.clearData();
                for (var _i = 0, _a = this._vertices; _i < _a.length; _i++) {
                    var v = _a[_i];
                    // hey webgl, we want to pass you info
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
            // cylce through each frame
            for (var i = 0; i < this._frameCount; i++) {
                totalWidth += this._frameWidth;
                // track the y direction
                if (totalWidth > this._assetWidth) {
                    yValue++;
                    totalWidth = 0;
                    xValue = 0;
                }
                // normalize by the image size to get UV coordinates
                var u = (xValue * this._frameWidth) / this._assetWidth;
                var v = (yValue * this._frameHeight) / this._assetHeight;
                var min = new TSE.Vector2(u, v);
                // increment from the min position by the current frame widht and height
                var uMax = ((xValue * this._frameWidth) + this._frameWidth) / this._assetWidth;
                var vMax = ((yValue * this._frameHeight) + this._frameHeight) / this._assetHeight;
                var max = new TSE.Vector2(uMax, vMax);
                // store the calculated UV coordinates
                this._frameUVs.push(new UVInfo(min, max));
                xValue++;
            }
        };
        AnimatedSprite.prototype.setupFromMaterial = function () {
            // check if material's diffuse texture and asset are loaded
            if (!this._assetLoaded) {
                var material = TSE.MaterialManager.getMaterial(this._materialName);
                if (material.diffuseTexture.isLoaded) {
                    if (TSE.AssetManager.isAssetLoaded(material.diffuseTextureName)) {
                        // set values
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
    var FontUtilities = /** @class */ (function () {
        function FontUtilities() {
        }
        // extracts values that are after '=' sign
        FontUtilities.extractFieldValue = function (field) {
            return field.split("=")[1];
        };
        return FontUtilities;
    }());
    var FontGlyph = /** @class */ (function () {
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
    var BitmapFont = /** @class */ (function () {
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
            // get the asset
            var asset = TSE.AssetManager.getAsset(this._fontFileName);
            // if asset isn't loaded
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
            // Replace Unknown Characters with '?'
            var code = char.charCodeAt(0);
            code = this._glyphs[code] === undefined ? 63 : code;
            return this._glyphs[code];
        };
        /**
         * Returns a size that is representative of the dimensions of the text
         * accounts for new lines
         */
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
                        // grab the xAdvance value
                        x += this.getGlyph(String(x)).xAdvance;
                        break;
                }
            }
            size.set(x, y);
            return size;
        };
        /**
         * Lengthy process of file line by line
         * Lines have a type
         */
        BitmapFont.prototype.processFontFile = function (content) {
            var charCount = 0;
            var lines = content.split("\n");
            for (var _i = 0, lines_1 = lines; _i < lines_1.length; _i++) {
                var line = lines_1[_i];
                // Sanitize the line
                // use regular expression to replace any space with a single space
                var data = line.replace(/\s\s+/g, ' ');
                var fields = data.split(" ");
                // look at the type of line
                switch (fields[0]) {
                    case "info":
                        this._size = Number(FontUtilities.extractFieldValue(fields[2]));
                        break;
                    case "common":
                        this._imageWidth = Number(FontUtilities.extractFieldValue(fields[3]));
                        this._imageHeight = Number(FontUtilities.extractFieldValue(fields[4]));
                        break;
                    case "page":
                        // scope variable for clarity
                        {
                            var id = Number(FontUtilities.extractFieldValue(fields[1]));
                            this._imageFile = FontUtilities.extractFieldValue(fields[2]);
                            // strip quotes
                            this._imageFile = this._imageFile.replace(/"/g, "");
                            // prepend the path to the image name
                            this._imageFile = ("assets/fonts" + this._imageFile).trim();
                        }
                        break;
                    case "chars":
                        charCount = Number(FontUtilities.extractFieldValue(fields[1]));
                        // increment the expected count, the file's count is off by one
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
            // Verify the loaded glyphs
            var actualGlyphCount = 0;
            // only count properties
            // Object.keys returns all the properties of the passed in object
            var keys = Object.keys(this._glyphs);
            // make sure properties are not unwanted (inheritied, etc.)
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
    var Color = /** @class */ (function () {
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
        // default colors 
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
    var Material = /** @class */ (function () {
        function Material(name, diffuseTextureName, tint) {
            this._name = name;
            this._diffuseTextureName = diffuseTextureName;
            this._tint = tint;
            // reference to the texture for the material
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
            /**
             * check for reference before reassigning
             */
            set: function (value) {
                // if a reference exists then release the reference
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
        // destroy the material and undefine the reference
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
    /**
    * these classes behave similarly to the messageManager
    * keep track of references with a node
    * However, materials will be loaded elsewhere and then regestered after loading
    */
    var MaterialReferenceNode = /** @class */ (function () {
        function MaterialReferenceNode(material) {
            this.referenceCount = 1;
            this.material = material;
        }
        return MaterialReferenceNode;
    }());
    /**
     * Materials work differently from textures, because we load these from another location
     */
    var MaterialManager = /** @class */ (function () {
        function MaterialManager() {
        }
        MaterialManager.registerMaterial = function (material) {
            if (MaterialManager._materials[material.name] === undefined) {
                MaterialManager._materials[material.name] = new MaterialReferenceNode(material);
            }
        };
        MaterialManager.getMaterial = function (materialName) {
            // not enough information to actually load a material, so return that the material is undefined
            if (MaterialManager._materials[materialName] === undefined) {
                return undefined;
            }
            else {
                MaterialManager._materials[materialName].referenceCount++;
                return MaterialManager._materials[materialName].material;
            }
        };
        /**
         * Releases a reference of a material with the provided name and decrements the reference count.
         * If the material's reference count is 0, it is automatically released.
         * @param materialName The name of the material to be released.
         */
        MaterialManager.releaseMaterial = function (materialName) {
            // material existence check
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
    var BitmapFontManager = /** @class */ (function () {
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
        /**
        * Load any registered fonts
        */
        BitmapFontManager.load = function () {
            var keys = Object.keys(BitmapFontManager._fonts);
            for (var _i = 0, keys_2 = keys; _i < keys_2.length; _i++) {
                var key = keys_2[_i];
                BitmapFontManager._fonts[key].load();
            }
        };
        /**
         * Check if fonts are loaded
         */
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
/**
 * Drives the rendering of the text editor
 */
var TSE;
(function (TSE) {
    var BitmapText = /** @class */ (function () {
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
            // set up attributes
            var positionAttribute = new TSE.AttributeInfo();
            positionAttribute.location = 0;
            positionAttribute.size = 3;
            this._buffer.addAttributeLocation(positionAttribute);
            var texCoordAttribute = new TSE.AttributeInfo();
            texCoordAttribute.location = 0;
            texCoordAttribute.size = 3;
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
        /**
         * takes all the text and convertes it to images to be drawn
         */
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
                // points for vertices
                var minX = x + g.xOffset;
                var minY = y + g.yOffset;
                var maxX = minX + g.width;
                var maxY = minY + g.height;
                // texture coordinates
                // converts pixel space of the image to be range 0-1
                var minu = g.x / this._bitmapFont.imageWidth;
                var minv = g.y / this._bitmapFont.imageHeight;
                var maxu = (g.x + g.width) / this._bitmapFont.imageWidth;
                var maxv = (g.y + g.height) / this._bitmapFont.imageHeight;
                // quad creation for the images of letters
                /*this._vertices.push(new Vertex(minX, minY, 0, minu, minv));
                this._vertices.push(new Vertex(minX, maxY, 0, minu, maxv));
                this._vertices.push(new Vertex(maxX, maxY, 0, maxu, maxv));

                this._vertices.push(new Vertex(maxX, maxY, 0, maxu, maxv));
                this._vertices.push(new Vertex(maxX, minY, 0, maxu, minv));
                this._vertices.push(new Vertex(minX, minY, 0, minu, minv));*/
                minX = 0;
                minY = 0;
                maxX = 100;
                maxY = 100;
                minu = 0;
                minv = 0;
                maxu = 10;
                maxu = 10;
                this._vertices.push(new TSE.Vertex(minX, minY, 0, minu, minv));
                this._vertices.push(new TSE.Vertex(minX, maxY, 0, minu, maxv));
                this._vertices.push(new TSE.Vertex(maxX, maxY, 0, maxu, maxv));
                this._vertices.push(new TSE.Vertex(maxX, minY, 0, maxu, minv));
                this._vertices.push(new TSE.Vertex(minX, minY, 0, minu, minv));
                this._vertices.push(new TSE.Vertex(maxX, maxY, 0, maxu, maxv));
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
    var Circle2D = /** @class */ (function () {
        function Circle2D() {
            this.position = TSE.Vector2.zero;
            // temporary fix for boundary positions
            this.origin = TSE.Vector2.zero; // new Vector2(0.5, 0.5);
        }
        Object.defineProperty(Circle2D.prototype, "offset", {
            /**
             * retrieve offset value
             */
            get: function () {
                return new TSE.Vector2(this.radius + (this.radius * this.origin.x), this.radius + (this.radius * this.origin.y));
            },
            enumerable: false,
            configurable: true
        });
        /**
         * set values from json
         * @param json
         */
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
        // each individual shape is responsible for knowing how to collide with other shapes
        Circle2D.prototype.intersect = function (other) {
            // if the distance between both circles is less than the combines radius, then collsiion
            if (other instanceof Circle2D) {
                var distance = Math.abs(TSE.Vector2.distance(other.position, this.position));
                var radiusLengths = this.radius + other.radius;
                if (distance <= radiusLengths) {
                    return true;
                }
            }
            if (other instanceof TSE.Rectangle2D) {
                // check if any sides of the rectangle intersect with the circle
                var deltaX = this.position.x - Math.max(other.position.x, Math.min(this.position.x, other.position.x + other.width));
                var deltaY = this.position.y - Math.max(other.position.y, Math.min(this.position.y, other.position.y + other.height));
                if ((deltaX * deltaX + deltaY * deltaY) < (this.radius * this.radius)) {
                    return true;
                }
            }
            // no colision
            return false;
        };
        // check if a point is inside the shape
        Circle2D.prototype.pointInShape = function (point) {
            // calculate absolute distance
            var absDistance = Math.abs(TSE.Vector2.distance(this.position, point));
            if (absDistance <= this.radius) {
                return true;
            }
            // if shape is unknown then don't intersect
            return false;
        };
        return Circle2D;
    }());
    TSE.Circle2D = Circle2D;
})(TSE || (TSE = {}));
var TSE;
(function (TSE) {
    var Rectangle2D = /** @class */ (function () {
        function Rectangle2D() {
            this.position = TSE.Vector2.zero;
            // temporary fix for boundary positions
            this.origin = TSE.Vector2.zero;
        }
        Object.defineProperty(Rectangle2D.prototype, "offset", {
            /**
             * provide offset value
             */
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
            if (json.width === undefined) {
                throw new Error("Rectangle2D requires width to be present.");
            }
            this.width = Number(json.width);
            if (json.height === undefined) {
                throw new Error("Rectangle2D requires width to be present.");
            }
            this.height = Number(json.height);
        };
        // each individual shape is responsible for knowing how to collide with other shapes
        Rectangle2D.prototype.intersect = function (other) {
            // case when other shape is rectangle
            if (other instanceof Rectangle2D) {
                // check if any of the four corners of the bounding rectangle intersect
                return (this.pointInShape(other.position) ||
                    this.pointInShape(new TSE.Vector2(other.position.x + other.width, other.position.y)) ||
                    this.pointInShape(new TSE.Vector2(other.position.x + other.width, other.position.y + other.height)) ||
                    this.pointInShape(new TSE.Vector2(other.position.x, other.position.y + other.height)));
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
        // check if a point is inside the shape
        Rectangle2D.prototype.pointInShape = function (point) {
            var x = this.width < 0 ? this.position.x - this.width : this.position.x;
            var y = this.width < 0 ? this.position.y - this.width : this.position.y;
            var extentX = this.width < 0 ? this.position.x : this.position.x + this.width;
            var extentY = this.width < 0 ? this.position.y : this.position.y + this.width;
            if (point.x >= x && point.x <= extentX && point.y >= y && point.y <= extentY) {
                return true;
            }
            // if shape is unknown then don't intersect
            return false;
        };
        return Rectangle2D;
    }());
    TSE.Rectangle2D = Rectangle2D;
})(TSE || (TSE = {}));
var TSE;
(function (TSE) {
    var LEVEL = 0;
    var BORDER = 0;
    // default image data will represent a single white pixel
    // unit8aray is an array of 8bit integers
    var TEMP_IMAGE_DATA = new Uint8Array([255, 255, 255, 255]);
    var Texture = /** @class */ (function () {
        function Texture(name, width, height) {
            if (width === void 0) { width = 1; }
            if (height === void 0) { height = 1; }
            this._isLoaded = false;
            this._name = name;
            this._width = width;
            this._height = height;
            this._handle = TSE.gl.createTexture();
            this.bind();
            // loading raw data into texture
            TSE.gl.texImage2D(TSE.gl.TEXTURE_2D, LEVEL, TSE.gl.RGBA, 1, 1, BORDER, TSE.gl.RGBA, TSE.gl.UNSIGNED_BYTE, TEMP_IMAGE_DATA);
            // START asset loading
            // check if the texture already exists in an already loaded asset
            var asset = TSE.AssetManager.getAsset(this.name);
            // assets could potentially be loaded already in the cache
            if (asset !== undefined) {
                this.loadTextureFromAsset(asset);
            }
            else {
                // subscribe to listen for when a texture is loaded
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
        // avoid the memory leaksss.
        Texture.prototype.destroy = function () {
            TSE.gl.deleteTexture(this._handle);
        };
        /**
         * Our value textureUnit is telling WebGL what channel to activate the texture on
         * webgl has 32 texture units that can be referenced
         * unit value offsets from texture0
         */
        Texture.prototype.activateAndBind = function (textureUnit) {
            if (textureUnit === void 0) { textureUnit = 0; }
            TSE.gl.activeTexture(TSE.gl.TEXTURE0 + textureUnit);
            this.bind();
        };
        /**
         * binding tells WebGL what we what to use
         */
        Texture.prototype.bind = function () {
            TSE.gl.bindTexture(TSE.gl.TEXTURE_2D, this._handle);
        };
        // pass undefined to GL
        Texture.prototype.unbind = function () {
            TSE.gl.bindTexture(TSE.gl.TEXTURE_2D, undefined);
        };
        Texture.prototype.onMessage = function (message) {
            // if we receive a message saying that our asset has been loaded
            if (message.code === TSE.MESSAGE_ASSET_LOADER_ASSET_LOADED + this._name) {
                this.loadTextureFromAsset(message.context);
            }
        };
        Texture.prototype.loadTextureFromAsset = function (asset) {
            this._width = asset.width;
            this._height = asset.height;
            this.bind();
            // loading an image into the texture
            TSE.gl.texImage2D(TSE.gl.TEXTURE_2D, LEVEL, TSE.gl.RGBA, TSE.gl.RGBA, TSE.gl.UNSIGNED_BYTE, asset.data);
            if (this.isPowerof2()) {
                TSE.gl.generateMipmap(TSE.gl.TEXTURE_2D);
                console.log("MIPMAPS");
            }
            else {
                // do not generate a mip map and clamp wrapping to edge
                // S,T are equavalent to U,V
                TSE.gl.texParameteri(TSE.gl.TEXTURE_2D, TSE.gl.TEXTURE_WRAP_S, TSE.gl.CLAMP_TO_EDGE);
                TSE.gl.texParameteri(TSE.gl.TEXTURE_2D, TSE.gl.TEXTURE_WRAP_T, TSE.gl.CLAMP_TO_EDGE);
            }
            // TODO: set texture filtering based on configuration
            TSE.gl.texParameteri(TSE.gl.TEXTURE_2D, TSE.gl.TEXTURE_MIN_FILTER, TSE.gl.NEAREST);
            TSE.gl.texParameteri(TSE.gl.TEXTURE_2D, TSE.gl.TEXTURE_MAG_FILTER, TSE.gl.NEAREST);
            // ASSET IS LOADED
            this._isLoaded = true;
        };
        // if an image is not a power of 2 then specific filtering parameters need to be set
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
    /**
     * Texture manager keeps track of how many handlers are using a texture
     * if no handlers are using a texture, we can unload it
     */
    var TextureReferenceNode = /** @class */ (function () {
        function TextureReferenceNode(texture) {
            this.referenceCount = 1;
            this.texture = texture;
        }
        return TextureReferenceNode;
    }());
    var TextureManager = /** @class */ (function () {
        function TextureManager() {
        }
        TextureManager.getTexture = function (textureName) {
            // if texture doesn't exist then create a new one
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
                // if referenced 0 times then delete all references
                if (TextureManager._textures[textureName].referenceCount < 1) {
                    TextureManager._textures[textureName].texture.destroy();
                    TextureManager._textures[textureName] = undefined;
                    delete TextureManager._textures[textureName]; // delect from texture manager
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
    /**
     * Represents the data for a single vertex.
     * @postiion position of sprite in scene
     * @texCoords UV
     */
    var Vertex = /** @class */ (function () {
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
    /**
     * keys that exist outside of the Input Manager
     */
    var Keys;
    (function (Keys) {
        Keys[Keys["LEFT"] = 37] = "LEFT";
        Keys[Keys["UP"] = 38] = "UP";
        Keys[Keys["RIGHT"] = 39] = "RIGHT";
        Keys[Keys["DOWN"] = 40] = "DOWN";
    })(Keys = TSE.Keys || (TSE.Keys = {}));
    /**
     * context of the mouse for sending messages
     */
    var MouseContext = /** @class */ (function () {
        function MouseContext(leftDown, rightDown, position) {
            this.leftDown = leftDown;
            this.rightDown = rightDown;
            this.position = position;
        }
        return MouseContext;
    }());
    TSE.MouseContext = MouseContext;
    var InputManager = /** @class */ (function () {
        function InputManager() {
        }
        InputManager.initialize = function () {
            // default all keys to false, no input
            for (var i = 0; i < 255; ++i) {
                InputManager._keys[i] = false;
            }
            window.addEventListener("keydown", InputManager.onKeyDown);
            window.addEventListener("keyup", InputManager.onKeyUp);
            window.addEventListener("mousemove", InputManager.onMouseMove);
            window.addEventListener("mousedown", InputManager.onMouseDown);
            window.addEventListener("mouseup", InputManager.onMouseUp);
        };
        InputManager.isKeyDown = function (key) {
            return InputManager._keys[key];
        };
        InputManager.getMousePosition = function () {
            return new TSE.Vector2(InputManager._mouseX, InputManager._mouseY);
        };
        /**
         * Capture our key events
         */
        InputManager.onKeyDown = function (event) {
            InputManager._keys[event.keyCode] = true;
            return true;
            // temporarily disabling and returning true
            // cross browser way to say don't allow this event to be handled by anything else
            //event.preventDefault();
            //event.stopPropagation();
            //return false;
        };
        InputManager.onKeyUp = function (event) {
            InputManager._keys[event.keyCode] = false;
            return true;
            // temporarily disabling and returning true
            // cross browser way to say don't allow this event to be handled by anything else
            //event.preventDefault();
            //event.stopPropagation();
            //return false;
        };
        /**
         * capture the movement of the mouse
         */
        InputManager.onMouseMove = function (event) {
            InputManager._previousMouseX = InputManager._mouseX;
            InputManager._previousMouseY = InputManager._mouseY;
            InputManager._mouseX = event.clientX;
            InputManager._mouseY = event.clientY;
        };
        /**
         * capture mouse buttons
         */
        InputManager.onMouseDown = function (event) {
            // scrollwheel click is number 1
            if (event.button === 0) {
                this._leftDown = true;
            }
            else if (event.button === 2) {
                this._rightDown = true;
            }
            TSE.Message.send("MOUSE_DOWN", this, new MouseContext(InputManager._leftDown, InputManager._rightDown, InputManager.getMousePosition()));
        };
        InputManager.onMouseUp = function (event) {
            // scrollwheel click is number 1
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
        return InputManager;
    }());
    TSE.InputManager = InputManager;
})(TSE || (TSE = {}));
// Hack
// cast the object Math as an any and attach a function called clamp to it
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
    var Matrix4x4 = /** @class */ (function () {
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
        // static so that at any point in the code you can call for an identity matrix without needing an instance
        Matrix4x4.identity = function () {
            return new Matrix4x4();
        };
        // variables for the boundary of the projection space (frustum)
        Matrix4x4.orthographic = function (left, right, bottom, top, nearClip, farClip) {
            var m = new Matrix4x4();
            var lr = 1.0 / (left - right);
            var bt = 1.0 / (bottom - top);
            var nf = 1.0 / (nearClip - farClip);
            // voodoo magic
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
        /**
                         * Creates a rotation matrix on the X axis from the provided angle in radians.
                         * @param angleInRadians The angle in radians.
                         */
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
        /**
         * Creates a rotation matrix on the Y axis from the provided angle in radians.
         * @param angleInRadians The angle in radians.
         */
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
        /**
         * Creates a rotation matrix on the Z axis from the provided angle in radians.
         * @param angleInRadians The angle in radians.
         */
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
        /**
         * Creates a rotation matrix from the provided angles in radians.
         * @param xRadians The angle in radians on the X axis.
         * @param yRadians The angle in radians on the Y axis.
         * @param zRadians The angle in radians on the Z axis.
         */
        Matrix4x4.rotationXYZ = function (xRadians, yRadians, zRadians) {
            var rx = Matrix4x4.rotationX(xRadians);
            var ry = Matrix4x4.rotationY(yRadians);
            var rz = Matrix4x4.rotationZ(zRadians);
            // ZYX
            return Matrix4x4.multiply(Matrix4x4.multiply(rz, ry), rx);
        };
        Matrix4x4.scale = function (scale) {
            var m = new Matrix4x4();
            m._data[0] = scale.x;
            m._data[5] = scale.y;
            m._data[10] = scale.z;
            return m;
        };
        /**
         * ability to multiply matrices together
         */
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
    var Transform = /** @class */ (function () {
        function Transform() {
            this.position = TSE.Vector3.zero;
            this.rotation = TSE.Vector3.zero;
            this.scale = TSE.Vector3.one; // default for scale is always one
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
            // order of multiplication does matter
            // T * R * S is the order
            return TSE.Matrix4x4.multiply(TSE.Matrix4x4.multiply(translation, rotation), scale);
        };
        // set only the values that have been defined
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
    var Vector2 = /** @class */ (function () {
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
            // you DO NOT want to create this returned vector statically and simply return it
            // if you did, then the same reference would be used all over the code
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
        // set only the values that have been defined
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
    var Vector3 = /** @class */ (function () {
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
        /**
         * check ifthis vector is equal to the one passed in
         * @param v
         * @returns
         */
        Vector3.prototype.equals = function (v) {
            return (this.x === v.x && this.y === v.y && this.z === v.z);
        };
        Object.defineProperty(Vector3, "zero", {
            // you DO NOT want to create this returned vector statically and simply return it
            // if you did, then the same reference would be used all over the code
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
        // set only the values that have been defined
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
    // enums define a set of named constants
    var MessagePriority;
    (function (MessagePriority) {
        MessagePriority[MessagePriority["NORMAL"] = 0] = "NORMAL";
        MessagePriority[MessagePriority["HIGH"] = 1] = "HIGH";
    })(MessagePriority = TSE.MessagePriority || (TSE.MessagePriority = {}));
    var Message = /** @class */ (function () {
        // default MessagePriority is NORMAL
        function Message(code, sender, context, priority) {
            if (priority === void 0) { priority = MessagePriority.NORMAL; }
            this.code = code;
            this.sender = sender;
            this.context = context;
            this.priority = priority;
        }
        // send a normal priorty message
        Message.send = function (code, sender, context) {
            TSE.MessageBus.post(new Message(code, sender, context, MessagePriority.NORMAL));
        };
        // send a high priority message
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
    /**
     * Message Bus is our Message Manager
     *
     */
    var MessageBus = /** @class */ (function () {
        function MessageBus() {
        }
        // create a subscription for a particular handler
        MessageBus.addSubscription = function (code, handler) {
            if (MessageBus._subscriptions[code] === undefined) {
                MessageBus._subscriptions[code] = [];
            }
            // check if the handler and code combination already exists
            if (MessageBus._subscriptions[code].indexOf(handler) !== -1) {
                console.warn("Attempting to add a duplicate handler to code: " + code + ". subscription not added.");
            }
            else {
                MessageBus._subscriptions[code].push(handler);
            }
        };
        MessageBus.removeSubscription = function (code, handler) {
            // code and handler combination does not exist
            if (MessageBus._subscriptions[code] === undefined) {
                console.warn("Cannot unsubscribe handler from code: " + code + " because that code is not subscribed to.");
                return;
            }
            var nodeIndex = MessageBus._subscriptions[code].indexOf(handler);
            // if node as been found
            if (nodeIndex !== -1) {
                MessageBus._subscriptions[code].splice(nodeIndex, 1);
            }
        };
        /**
         *
         */
        MessageBus.post = function (message) {
            console.log("Message posted:", message);
            // check if we have any handlers for this code 'message'
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
                    // queue message to be sent out later
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
        // list of codes and IMessageHandlers that keeps track of our subscriptions
        MessageBus._subscriptions = {};
        // for performance reasons, we want to limit the number of messages being sent
        MessageBus._normalQueueMessagePerUpdate = 10;
        MessageBus._normalMessageQueue = [];
        return MessageBus;
    }());
    TSE.MessageBus = MessageBus;
})(TSE || (TSE = {}));
var TSE;
(function (TSE) {
    // acts a container to hold these two values
    var MessageSubscriptionNode = /** @class */ (function () {
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
    var Scene = /** @class */ (function () {
        function Scene() {
            // pass this so we automatically have the scene attached to the root object
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
        // should be used lightly if the scene holds a lot of objects due to recursive nature
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
    var SimObject = /** @class */ (function () {
        function SimObject(id, name, scene) {
            this._children = [];
            this._isLoaded = false;
            this._components = [];
            this._behaviors = [];
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
        SimObject.prototype.addChild = function (child) {
            child._parent = this;
            this._children.push(child);
            this.onAdded(this._scene);
        };
        // check to make sure the given child is actually a child of the object
        SimObject.prototype.removeChild = function (child) {
            var index = this._children.indexOf(child);
            if (index !== -1) {
                child._parent = undefined;
                this._children.splice(index, 1);
            }
        };
        /**
         * Recursively searches for component names
         */
        SimObject.prototype.getComponentByName = function (name) {
            for (var _i = 0, _a = this._components; _i < _a.length; _i++) {
                var component = _a[_i];
                //let result = child.getObjectByName(name);
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
        /**
         * Recursively searches for behavior names
         */
        SimObject.prototype.getBehaviorByName = function (name) {
            for (var _i = 0, _a = this._behaviors; _i < _a.length; _i++) {
                var behavior = _a[_i];
                //let result = child.getObjectByName(name);
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
        /**
         * recursively searches for the object
         */
        SimObject.prototype.getObjectByName = function (name) {
            // if the curren object is the one being searched for return it
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
        // add a behavior componenet to engine
        SimObject.prototype.addBehavior = function (behavior) {
            this._behaviors.push(behavior);
            behavior.setOwner(this);
        };
        SimObject.prototype.load = function () {
            this._isLoaded = true;
            // load all components
            for (var _i = 0, _a = this._components; _i < _a.length; _i++) {
                var c = _a[_i];
                c.load();
            }
            // recursively check that children are loaded
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
            // update behaviors
            for (var _b = 0, _c = this._behaviors; _b < _c.length; _b++) {
                var b = _c[_b];
                b.updateReady();
            }
            for (var _d = 0, _e = this._children; _d < _e.length; _d++) {
                var c = _e[_d];
                c.updateReady();
            }
        };
        /**
         * recursively update children
         */
        SimObject.prototype.update = function (time) {
            // matrix math, update matrices
            // getting the transformation matrix is not something you want to do on every cycle
            // if the parent is not undefined then pass the parent world matrix
            this._localMatrix = this.transform.getTransformationMatrix();
            this.updateWorldMatrix((this._parent !== undefined) ? this._parent.worldMatrix : undefined);
            for (var _i = 0, _a = this._components; _i < _a.length; _i++) {
                var c = _a[_i];
                c.update(time);
            }
            // update behaviors
            for (var _b = 0, _c = this._behaviors; _b < _c.length; _b++) {
                var b = _c[_b];
                b.update(time);
            }
            for (var _d = 0, _e = this._children; _d < _e.length; _d++) {
                var c = _e[_d];
                c.update(time);
            }
        };
        /**
         * recursivley update children
         */
        SimObject.prototype.render = function (shader) {
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
        // protected becuase if any classes override simobject then they should take advantage of this
        // called when a new child is added
        SimObject.prototype.onAdded = function (scene) {
            this._scene = scene;
        };
        // magic for object heirachy
        SimObject.prototype.updateWorldMatrix = function (parentWorldMatrix) {
            // if has a parent
            if (parentWorldMatrix !== undefined) {
                this._worldMatrix = TSE.Matrix4x4.multiply(parentWorldMatrix, this._localMatrix);
            }
            else {
                // use local transformation matrix
                this._worldMatrix.copyFrom(this._localMatrix);
            }
        };
        return SimObject;
    }());
    TSE.SimObject = SimObject;
})(TSE || (TSE = {}));
////< reference path="../world/zone.ts" />
/////<reference path="../world/zone.ts" />
//namespace TSE {
//	export class TestZone extends Zone {
//		private _parentObject: SimObject;
//		private _testObject: SimObject;
//		private _parentSprite: SpriteComponent;
//		private _testSprite: SpriteComponent;
//		public load(): void {
//			this._parentObject = new SimObject(0, "parentObject");
//			this._parentObject.transform.position.x = 300;
//			this._parentObject.transform.position.y = 300;
//			this._parentSprite = new SpriteComponent("test", "leaves");
//			this._parentObject.addComponent(this._parentSprite);
//			this._testObject = new SimObject(1, "testObject");
//			this._testSprite = new SpriteComponent("test", "leaves");
//			this._testObject.addComponent(this._testSprite);
//			this._testObject.transform.position.x = 120;
//			this._testObject.transform.position.y = 120;
//			// add child to parent object
//			this._parentObject.addChild(this._testObject);
//			// add object to the scene
//			this.scene.addObject(this._parentObject);
//			console.log(this._parentObject.parent);
//			console.log(this._testObject.parent);
//			super.load();
//		}
//		public update(time: number): void {
//			this._testObject.transform.rotation.z += 0.01;
//			this._parentObject.transform.rotation.z += 0.01;
//			super.update(time);
//		}
//	}
//}
//	/// <reference path="zone.ts" />
var TSE;
(function (TSE) {
    // state machine handles the state of object
    var ZoneState;
    (function (ZoneState) {
        ZoneState[ZoneState["UNINITIALIZED"] = 0] = "UNINITIALIZED";
        ZoneState[ZoneState["LOADING"] = 1] = "LOADING";
        ZoneState[ZoneState["UPDATING"] = 2] = "UPDATING";
    })(ZoneState = TSE.ZoneState || (TSE.ZoneState = {}));
    var Zone = /** @class */ (function () {
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
        // initialize zone after creation
        // loops through all data and determines where everything belongs
        Zone.prototype.initialize = function (zoneData) {
            // search for the objects
            if (zoneData.objects === undefined) {
                throw new Error("zone initialization error: objects not present.");
            }
            // loop through the objects
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
            // CHECK for the correct state
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
        // useful for recursively laoding all objects in a scene from the parent object
        // reference to parent so properties can be inherited
        // children objects are top level and need to maintain their family tree
        Zone.prototype.loadSimObject = function (dataSection, parent) {
            var name;
            if (dataSection.name !== undefined) {
                name = String(dataSection.name);
            }
            this._globalID++;
            // recursively loads children and objects
            var simObject = new TSE.SimObject(this._globalID, name, this._scene);
            // add transform data
            if (dataSection.transform !== undefined) {
                simObject.transform.setFromJson(dataSection.transform);
            }
            // load coditions for components
            if (dataSection.components !== undefined) {
                for (var c in dataSection.components) {
                    var data = dataSection.components[c];
                    var component = TSE.ComponentManager.extractComponent(data);
                    simObject.addComponent(component);
                }
            }
            // load behaviors
            if (dataSection.behaviors !== undefined) {
                for (var b in dataSection.behaviors) {
                    var data = dataSection.behaviors[b];
                    var behavior = TSE.BehaviorManager.extractBehavior(data);
                    simObject.addBehavior(behavior);
                }
            }
            // check for children and load them as simobjects
            if (dataSection.children !== undefined) {
                // loop through the children
                for (var o in dataSection.children) {
                    var obj = dataSection.children[o];
                    this.loadSimObject(obj, simObject);
                }
            }
            // attach the child to parent
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
    // implement IMessageHandler for loading zones
    var ZoneManager = /** @class */ (function () {
        /**
         * everything done in this class is done statically
         */
        function ZoneManager() {
        }
        ZoneManager.initialize = function () {
            // private instance of ZoneManager that is hidden in the class
            ZoneManager._inst = new ZoneManager();
            // TEMPORARY
            ZoneManager._registeredZones[0] = "assets/zones/testZone.json";
        };
        // change the active zone
        ZoneManager.changeZone = function (id) {
            // check that the active zone is not undefined and deactivate the zone
            if (ZoneManager._activeZone !== undefined) {
                ZoneManager._activeZone.onDeactivated();
                ZoneManager._activeZone.unload();
                ZoneManager._activeZone = undefined;
            }
            // check if the zone is a registered zone
            if (ZoneManager._registeredZones[id] !== undefined) {
                // check if the zone is loaded
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
        // handles loading of the zone from the asset
        ZoneManager.loadZone = function (asset) {
            // extract properties from JSON
            var zoneData = asset.data;
            // check for a zone id
            var zoneId;
            if (zoneData.id === undefined) {
                throw new Error("Zone file format exception: Zone id not present.");
            }
            else {
                // very common to use these type functions in excraction
                zoneId = Number(zoneData.id);
            }
            // check for a zone name
            var zoneName;
            if (zoneData.name === undefined) {
                throw new Error("Zone file format exception: Zone name not present.");
            }
            else {
                // very common to use these type functions in excraction
                zoneName = String(zoneData.name);
            }
            // check for a zone desciription
            // not mandatory
            var zoneDescription;
            if (zoneData.description !== undefined) {
                zoneDescription = String(zoneData.description);
            }
            ZoneManager._activeZone = new TSE.Zone(zoneId, zoneName, zoneDescription);
            ZoneManager._activeZone.initialize(zoneData);
            ZoneManager._activeZone.onActivated();
            ZoneManager._activeZone.load();
        };
        // hashmap of zones
        // globalZoneID is a globally incrmeenting number to populate the zone
        ZoneManager._globalZoneID = -1;
        //private static _zones: { [id: number]: Zone } = {};
        ZoneManager._registeredZones = {};
        return ZoneManager;
    }());
    TSE.ZoneManager = ZoneManager;
})(TSE || (TSE = {}));
//# sourceMappingURL=main.js.map