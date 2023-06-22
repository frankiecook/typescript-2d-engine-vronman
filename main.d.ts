declare var engine: TSE.Engine;
declare namespace TSE {
    class Engine implements IMessageHandler {
        private _canvas;
        private _basicShader;
        private _projection;
        private _previousTime;
        private _gameWidth;
        private _gameHeight;
        private _isFirstUpdate;
        private _aspect;
        constructor(width?: number, height?: number);
        start(elementName?: string): void;
        resize(): void;
        onMessage(message: Message): void;
        private loop;
        private preloading;
        private update;
        private render;
    }
}
declare namespace TSE {
    interface IAsset {
        readonly name: string;
        readonly data: any;
    }
}
declare namespace TSE {
    interface IAssetLoader {
        readonly supportedExtensions: string[];
        loadAsset(assetName: string): void;
    }
}
declare namespace TSE {
    interface IComponent {
        name: string;
        readonly owner: SimObject;
        setOwner(owner: SimObject): void;
        updateReady(): void;
        load(): void;
        update(time: number): void;
        render(shader: Shader): void;
    }
}
declare namespace TSE {
    interface IComponentBuilder {
        readonly type: string;
        buildFromJson(json: any): IComponent;
    }
}
declare namespace TSE {
    interface IComponentData {
        name: string;
        setFromJson(json: any): void;
    }
}
declare namespace TSE {
    const MESSAGE_ASSET_LOADER_ASSET_LOADED = "MESSAGE_ASSET_LOADER_ASSET_LOADED::";
    class AssetManager {
        private static _loaders;
        private static _loadedAssets;
        private constructor();
        static initialize(): void;
        static registerLoader(loader: IAssetLoader): void;
        static onAssetLoaded(asset: IAsset): void;
        static loadAsset(assetName: string): void;
        static isAssetLoaded(assetName: string): boolean;
        static getAsset(assetName: string): IAsset;
    }
}
declare namespace TSE {
    class ImageAsset implements IAsset {
        readonly name: string;
        readonly data: HTMLImageElement;
        constructor(name: string, data: HTMLImageElement);
        get width(): number;
        get height(): number;
    }
    class ImageAssetLoader implements IAssetLoader {
        get supportedExtensions(): string[];
        loadAsset(assetName: string): void;
        private onImageLoaded;
    }
}
declare namespace TSE {
    class JsonAsset implements IAsset {
        readonly name: string;
        readonly data: any;
        constructor(name: string, data: HTMLImageElement);
    }
    class JsonAssetLoader implements IAssetLoader {
        get supportedExtensions(): string[];
        loadAsset(assetName: string): void;
        private onJsonLoaded;
    }
}
declare namespace TSE {
    class TextAsset implements IAsset {
        readonly name: string;
        readonly data: string;
        constructor(name: string, data: string);
    }
    class TextAssetLoader implements IAssetLoader {
        get supportedExtensions(): string[];
        loadAsset(assetName: string): void;
        private onTextLoaded;
    }
}
declare namespace TSE {
    class SoundEffect {
        private _player;
        assetPath: string;
        constructor(assetPath: string, loop: boolean);
        get loop(): boolean;
        set loop(value: boolean);
        destroy(): void;
        play(): void;
        pause(): void;
        stop(): void;
    }
    class AudioManager {
        private static _soundEffects;
        static loadSoundFile(name: string, assetPath: string, loop: boolean): void;
        static playSound(name: string): void;
        static pauseSound(name: string): void;
        static pauseAll(): void;
        static stopSound(name: string): void;
        static stopAll(): void;
    }
}
declare namespace TSE {
    interface IBehavior {
        name: string;
        setOwner(owner: SimObject): void;
        updateReady(): void;
        update(time: number): void;
        apply(userData: any): void;
    }
}
declare namespace TSE {
    interface IBehaviorBuilder {
        readonly type: string;
        buildFromJson(json: any): IBehavior;
    }
}
declare namespace TSE {
    interface IBehaviorData {
        name: string;
        setFromJson(json: any): void;
    }
}
declare namespace TSE {
    abstract class BaseBehavior implements IBehavior {
        name: string;
        protected _data: IBehaviorData;
        protected _owner: SimObject;
        constructor(data: IBehaviorData);
        setOwner(owner: SimObject): void;
        updateReady(): void;
        update(time: number): void;
        apply(userData: any): void;
    }
}
declare namespace TSE {
    class BehaviorManager {
        private static _registeredBuilders;
        static registerBuilder(builder: IBehaviorBuilder): void;
        static extractBehavior(json: any): IBehavior;
    }
}
declare namespace TSE {
    class KeyboardMovementBehaviorData implements IBehaviorData {
        name: string;
        speed: number;
        setFromJson(json: any): void;
    }
    class KeyboardMovementBehaviorBuilder implements IBehaviorBuilder {
        get type(): string;
        buildFromJson(json: any): IBehavior;
    }
    class KeyboardMovementBehavior extends BaseBehavior {
        speed: number;
        constructor(data: KeyboardMovementBehaviorData);
        update(time: number): void;
    }
}
declare namespace TSE {
    class MouseClickBehaviorData implements IBehaviorData {
        name: string;
        width: number;
        height: number;
        messageCode: string;
        setFromJson(json: any): void;
    }
    class MouseClickBehaviorBuilder implements IBehaviorBuilder {
        get type(): string;
        buildFromJson(json: any): IBehavior;
    }
    class MouseClickBehavior extends BaseBehavior implements IMessageHandler {
        private _width;
        private _height;
        private _messageCode;
        constructor(data: MouseClickBehaviorData);
        onMessage(message: Message): void;
    }
}
declare namespace TSE {
    class PlayerBehaviorData implements IBehaviorData {
        name: string;
        acceleration: Vector2;
        playerCollisionComponent: string;
        groundCollisionComponent: string;
        animatedSpriteName: string;
        scoreCollisionComponent: string;
        setFromJson(json: any): void;
    }
    class PlayerBehaviorBuilder implements IBehaviorBuilder {
        get type(): string;
        buildFromJson(json: any): IBehavior;
    }
    class PlayerBehavior extends BaseBehavior implements IMessageHandler {
        private _acceleration;
        private _velocity;
        private _isAlive;
        private _playerCollisionComponent;
        private _groundCollisionComponent;
        private _scoreCollisionComponent;
        private _animatedSpriteName;
        private _isPlaying;
        private _initialPosition;
        private _score;
        private _highScore;
        private _sprite;
        private _pipeNames;
        constructor(data: PlayerBehaviorData);
        updateReady(): void;
        update(time: number): void;
        onMessage(message: Message): void;
        private isFalling;
        private shouldNotFlap;
        private die;
        private reset;
        private start;
        private decelerate;
        private onFlap;
        private setScore;
    }
}
declare namespace TSE {
    class RotationBehaviorData implements IBehaviorData {
        name: string;
        rotation: Vector3;
        setFromJson(json: any): void;
    }
    class RotationBehaviorBuilder implements IBehaviorBuilder {
        get type(): string;
        buildFromJson(json: any): IBehavior;
    }
    class RotationBehavior extends BaseBehavior {
        private _rotation;
        constructor(data: RotationBehaviorData);
        update(time: number): void;
    }
}
declare namespace TSE {
    class ScrollBehaviorData implements IBehaviorData {
        name: string;
        velocity: Vector2;
        minPosition: Vector2;
        resetPosition: Vector2;
        minResetY: number;
        maxResetY: number;
        startMessage: string;
        stopMessage: string;
        resetMessage: string;
        setFromJson(json: any): void;
    }
    class ScrollBehaviorBuilder implements IBehaviorBuilder {
        get type(): string;
        buildFromJson(json: any): IBehavior;
    }
    class ScrollBehavior extends BaseBehavior implements IMessageHandler {
        private _velocity;
        private _minPosition;
        private _resetPosition;
        private _startMessage;
        private _stopMessage;
        private _resetMessage;
        private _minResetY;
        private _maxResetY;
        private _isScrolling;
        private _initialPosition;
        private tempVector;
        constructor(data: ScrollBehaviorData);
        updateReady(): void;
        update(time: number): void;
        onMessage(message: Message): void;
        private reset;
        private getRandomY;
        private initial;
    }
}
declare namespace TSE {
    class VisibilityOnMessageBehaviorData implements IBehaviorData {
        name: string;
        messageCode: string;
        visible: boolean;
        setFromJson(json: any): void;
    }
    class VisibilityOnMessageBehaviorBuilder implements IBehaviorBuilder {
        get type(): string;
        buildFromJson(json: any): IBehavior;
    }
    class VisibilityOnMessageBehavior extends BaseBehavior implements IMessageHandler {
        private _messageCode;
        private _visible;
        constructor(data: VisibilityOnMessageBehaviorData);
        onMessage(message: Message): void;
    }
}
declare namespace TSE {
    class CollisionData {
        a: CollisionComponent;
        b: CollisionComponent;
        time: number;
        constructor(time: number, a: CollisionComponent, b: CollisionComponent);
    }
    class CollisionManager {
        private static _totalTime;
        private static _components;
        private static _collisionData;
        private constructor();
        static registerCollisionComponent(component: CollisionComponent): void;
        static unRegisterCollisionComponent(component: CollisionComponent): void;
        static clear(): void;
        static update(time: number): void;
    }
}
declare namespace TSE {
    class ComponentManager {
        private static _registeredBuilders;
        static registerBuilder(builder: IComponentBuilder): void;
        static extractComponent(json: any): IComponent;
    }
}
declare namespace TSE {
    abstract class BaseComponent implements IComponent {
        protected _owner: SimObject;
        protected _data: IComponentData;
        name: string;
        constructor(data: IComponentData);
        get owner(): SimObject;
        setOwner(owner: SimObject): void;
        load(): void;
        updateReady(): void;
        update(time: number): void;
        render(shader: Shader): void;
    }
}
declare namespace TSE {
    class SpriteComponenetData implements IComponentData {
        name: string;
        materialName: string;
        origin: Vector3;
        width: number;
        height: number;
        setFromJson(json: any): void;
    }
    class SpriteComponentBuilder implements IComponentBuilder {
        get type(): string;
        buildFromJson(json: any): IComponent;
    }
    class SpriteComponent extends BaseComponent {
        private _sprite;
        private _width;
        private _height;
        constructor(data: SpriteComponenetData);
        load(): void;
        render(shader: Shader): void;
    }
}
declare namespace TSE {
    class AnimatedSpriteComponenetData extends SpriteComponenetData implements IComponentData {
        frameWidth: number;
        frameHeight: number;
        frameCount: number;
        frameSequence: number[];
        autoPlay: boolean;
        frameTime: number;
        setFromJson(json: any): void;
    }
    class AnimatedSpriteComponentBuilder implements IComponentBuilder {
        get type(): string;
        buildFromJson(json: any): IComponent;
    }
    class AnimatedSpriteComponent extends BaseComponent {
        private _autoPlay;
        private _sprite;
        constructor(data: AnimatedSpriteComponenetData);
        get isPlaying(): boolean;
        load(): void;
        updateRead(): void;
        update(time: number): void;
        render(shader: Shader): void;
        play(): void;
        stop(): void;
        setFrame(frameNumber: number): void;
    }
}
declare namespace TSE {
    class BitmapTextComponentData implements IComponentData {
        name: string;
        fontName: string;
        origin: Vector3;
        text: string;
        setFromJson(json: any): void;
    }
    class BitmapTextComponentBuilder implements IComponentBuilder {
        get type(): string;
        buildFromJson(json: any): IComponent;
    }
    class BitmapTextComponent extends BaseComponent implements IMessageHandler {
        private _bitmapText;
        private _fontName;
        constructor(data: BitmapTextComponentData);
        load(): void;
        update(time: number): void;
        render(shader: Shader): void;
        onMessage(message: Message): void;
    }
}
declare namespace TSE {
    class CollisionComponentData implements IComponentData {
        name: string;
        shape: IShape2D;
        static: boolean;
        setFromJson(json: any): void;
    }
    class CollisionComponentBuilder implements IComponentBuilder {
        get type(): string;
        buildFromJson(json: any): IComponent;
    }
    class CollisionComponent extends BaseComponent {
        private _shape;
        private _static;
        private _debugSprite;
        private _debugMaterialName;
        private _debugHeight;
        private _debugWidth;
        constructor(data: CollisionComponentData);
        get shape(): IShape2D;
        get isStatic(): boolean;
        set debugWidth(width: number);
        set debugHeight(height: number);
        load(): void;
        update(time: number): void;
        render(shader: Shader): void;
        onCollisionEntry(other: CollisionComponent): void;
        onCollisionUpdate(other: CollisionComponent): void;
        onCollisionExit(other: CollisionComponent): void;
    }
}
declare namespace TSE {
    var gl: WebGLRenderingContext;
    class GLUtilities {
        static initialize(elementId?: string): HTMLCanvasElement;
    }
}
declare namespace TSE {
    class AttributeInfo {
        location: number;
        size: number;
        offset: number;
    }
    class GLBuffer {
        private _hasAttributeLocation;
        private _elementSize;
        private _stride;
        private _buffer;
        private _targetBufferType;
        private _dataType;
        private _mode;
        private _typeSize;
        private _data;
        private _attributes;
        private _totalOffset;
        constructor(dataType?: number, targetBufferType?: number, mode?: number);
        destroy(): void;
        bind(normalized?: boolean): void;
        unbind(): void;
        addAttributeLocation(info: AttributeInfo): void;
        setData(data: number[]): void;
        pushBackData(data: number[]): void;
        clearData(): void;
        upload(): void;
        draw(): void;
    }
}
declare namespace TSE {
    abstract class Shader {
        private _name;
        private _program;
        private _attributes;
        private _uniforms;
        constructor(name: string);
        get name(): string;
        use(): void;
        getAttributeLocation(name: string): number;
        getUniformLocation(name: string): WebGLUniformLocation;
        protected load(vertexSource: string, fragmentSource: string): void;
        private loadShader;
        private createProgram;
        private detectAttributes;
        private detectUniforms;
    }
}
declare namespace TSE {
    class BasicShader extends Shader {
        constructor();
        private getVertexSource;
        private getFragmentSource;
    }
}
declare namespace TSE {
    class Sprite {
        protected _name: string;
        protected _width: number;
        protected _height: number;
        protected _origin: Vector3;
        protected _buffer: GLBuffer;
        protected _materialName: string;
        protected _material: Material;
        protected _vertices: Vertex[];
        constructor(name: string, materialName: string, width?: number, height?: number);
        get name(): string;
        get origin(): Vector3;
        set origin(value: Vector3);
        get width(): number;
        get height(): number;
        destroy(): void;
        load(): void;
        update(time: number): void;
        draw(shader: Shader, model: Matrix4x4): void;
        protected calculateVertices(): void;
        protected recalculateVertices(): void;
    }
}
declare namespace TSE {
    class AnimatedSpriteInfo {
        name: string;
        materialName: string;
        width: number;
        height: number;
        frameWidth: number;
        frameHeight: number;
        frameCount: number;
        frameSequence: number[];
        frameTime: number;
    }
    class AnimatedSprite extends Sprite implements IMessageHandler {
        private _frameHeight;
        private _frameWidth;
        private _frameCount;
        private _frameSequence;
        private _currentFrame;
        private _frameUVs;
        private _frameTime;
        private _currentTime;
        private _assetLoaded;
        private _assetWidth;
        private _assetHeight;
        private _isPlaying;
        constructor(info: AnimatedSpriteInfo);
        get isPlaying(): boolean;
        destroy(): void;
        play(): void;
        stop(): void;
        setFrame(frameNumber: number): void;
        onMessage(message: Message): void;
        load(): void;
        update(time: number): void;
        private calculateUVs;
        private setupFromMaterial;
    }
}
declare namespace TSE {
    class FontGlyph {
        id: number;
        x: number;
        y: number;
        width: number;
        height: number;
        xOffset: number;
        yOffset: number;
        xAdvance: number;
        page: number;
        channel: number;
        static fromFields(fields: string[]): FontGlyph;
    }
    class BitmapFont implements IMessageHandler {
        private _name;
        private _fontFileName;
        private _assetLoaded;
        private _imageFile;
        private _glyphs;
        private _size;
        private _imageWidth;
        private _imageHeight;
        constructor(name: string, fontFile: string);
        get name(): string;
        get size(): number;
        get imageWidth(): number;
        get imageHeight(): number;
        get textureName(): string;
        get isLoaded(): boolean;
        load(): void;
        onMessage(message: Message): void;
        getGlyph(char: string): FontGlyph;
        measureText(text: string): Vector2;
        private processFontFile;
    }
}
declare namespace TSE {
    class Color {
        private _r;
        private _g;
        private _b;
        private _a;
        constructor(r?: number, g?: number, b?: number, a?: number);
        get r(): number;
        get rFloat(): number;
        set r(value: number);
        get g(): number;
        get gFloat(): number;
        set g(value: number);
        get b(): number;
        get bFloat(): number;
        set b(value: number);
        get a(): number;
        get aFloat(): number;
        set a(value: number);
        toArray(): number[];
        toFloatArray(): number[];
        toFloat32Array(): Float32Array;
        static white(): Color;
        static black(): Color;
        static red(): Color;
        static green(): Color;
        static blue(): Color;
    }
}
declare namespace TSE {
    class Material {
        private _name;
        private _diffuseTextureName;
        private _diffuseTexture;
        private _tint;
        constructor(name: string, diffuseTextureName: string, tint: Color);
        get name(): string;
        get diffuseTextureName(): string;
        get diffuseTexture(): Texture;
        get tint(): Color;
        set diffuseTextureName(value: string);
        destroy(): void;
    }
}
declare namespace TSE {
    class MaterialManager {
        private static _materials;
        private constructor();
        static registerMaterial(material: Material): void;
        static getMaterial(materialName: string): Material;
        static releaseMaterial(materialName: string): void;
    }
}
declare namespace TSE {
    class Texture implements IMessageHandler {
        private _name;
        private _handle;
        private _isLoaded;
        private _width;
        private _height;
        constructor(name: string, width?: number, height?: number);
        get name(): string;
        get isLoaded(): boolean;
        get width(): number;
        get height(): number;
        destroy(): void;
        activateAndBind(textureUnit?: number): void;
        bind(): void;
        unbind(): void;
        onMessage(message: Message): void;
        private loadTextureFromAsset;
        private isPowerof2;
        private isValuePowerOf2;
    }
}
declare namespace TSE {
    class TextureManager {
        private static _textures;
        private constructor();
        static getTexture(textureName: string): Texture;
        static releaseTexture(textureName: string): void;
    }
}
declare namespace TSE {
    class Vertex {
        position: Vector3;
        texCoords: Vector2;
        constructor(x?: number, y?: number, z?: number, tu?: number, tv?: number);
        toArray(): number[];
        toFloat32Array(): Float32Array;
    }
}
declare namespace TSE {
    interface IShape2D {
        position: Vector2;
        origin: Vector2;
        readonly offset: Vector2;
        setFromJson(json: any): void;
        intersect(shape: IShape2D): boolean;
        pointInShape(point: Vector2): boolean;
    }
}
declare namespace TSE {
    class BitmapFontManager {
        private static _fonts;
        static addFont(name: string, fontFileName: string): void;
        static getFont(name: string): BitmapFont;
        static load(): void;
        static updateReady(): boolean;
    }
}
declare namespace TSE {
    class BitmapText {
        private _fontName;
        private _isDirty;
        protected _name: string;
        protected _origin: Vector3;
        protected _buffer: GLBuffer;
        protected _material: Material;
        protected _bitmapFont: BitmapFont;
        protected _vertices: Vertex[];
        protected _text: string;
        constructor(name: string, fontName: string);
        get name(): string;
        get text(): string;
        set text(value: string);
        get origin(): Vector3;
        set origin(value: Vector3);
        destroy(): void;
        load(): void;
        update(time: number): void;
        draw(shader: Shader, model: Matrix4x4): void;
        private calculateVertices;
    }
}
declare namespace TSE {
    class Circle2D implements IShape2D {
        position: Vector2;
        origin: Vector2;
        radius: number;
        get offset(): Vector2;
        setFromJson(json: any): void;
        intersect(other: IShape2D): boolean;
        pointInShape(point: Vector2): boolean;
    }
}
declare namespace TSE {
    class Rectangle2D implements IShape2D {
        position: Vector2;
        origin: Vector2;
        width: number;
        height: number;
        constructor(x?: number, y?: number, width?: number, height?: number);
        get offset(): Vector2;
        setFromJson(json: any): void;
        intersect(other: IShape2D): boolean;
        pointInShape(point: Vector2): boolean;
        private getExtents;
    }
}
declare namespace TSE {
    class Vector2 {
        private _x;
        private _y;
        constructor(x?: number, y?: number);
        get x(): number;
        set x(value: number);
        get y(): number;
        set y(value: number);
        static get zero(): Vector2;
        static get one(): Vector2;
        static distance(a: Vector2, b: Vector2): number;
        copyFrom(v: Vector2): void;
        toArray(): number[];
        toFloat32Array(): Float32Array;
        toVector3(): Vector3;
        set(x?: number, y?: number): void;
        setFromJson(json: any): void;
        add(v: Vector2): Vector2;
        subtract(v: Vector2): Vector2;
        multiply(v: Vector2): Vector2;
        divide(v: Vector2): Vector2;
        scale(scale: number): Vector2;
        clone(): Vector2;
    }
}
declare namespace TSE {
    enum Keys {
        LEFT = 37,
        UP = 38,
        RIGHT = 39,
        DOWN = 40
    }
    class MouseContext {
        leftDown: boolean;
        rightDown: boolean;
        position: Vector2;
        constructor(leftDown: boolean, rightDown: boolean, position: Vector2);
    }
    class InputManager {
        private static _keys;
        private static _previousMouseX;
        private static _previousMouseY;
        private static _mouseX;
        private static _mouseY;
        private static _leftDown;
        private static _rightDown;
        private static _resolutionScale;
        static initialize(viewport: HTMLCanvasElement): void;
        static isKeyDown(key: Keys): boolean;
        static getMousePosition(): Vector2;
        static setResolutionScale(scale: Vector2): void;
        private static onKeyDown;
        private static onKeyUp;
        private static onMouseMove;
        private static onMouseDown;
        private static onMouseUp;
    }
}
interface Math {
    clamp(value: number, min: number, max: number): number;
    degToRad(degrees: number): number;
    radToDeg(radians: number): number;
}
declare namespace TSE {
    class Matrix4x4 {
        private _data;
        private constructor();
        get data(): number[];
        static identity(): Matrix4x4;
        static orthographic(left: number, right: number, bottom: number, top: number, nearClip: number, farClip: number): Matrix4x4;
        static translation(position: Vector3): Matrix4x4;
        static rotationX(angleInRadians: number): Matrix4x4;
        static rotationY(angleInRadians: number): Matrix4x4;
        static rotationZ(angleInRadians: number): Matrix4x4;
        static rotationXYZ(xRadians: number, yRadians: number, zRadians: number): Matrix4x4;
        static scale(scale: Vector3): Matrix4x4;
        static multiply(a: Matrix4x4, b: Matrix4x4): Matrix4x4;
        toFloat32Array(): Float32Array;
        copyFrom(matrix: Matrix4x4): void;
    }
}
declare namespace TSE {
    class Transform {
        position: Vector3;
        rotation: Vector3;
        scale: Vector3;
        copyFrom(transform: Transform): void;
        getTransformationMatrix(): Matrix4x4;
        setFromJson(json: any): void;
    }
}
declare namespace TSE {
    class Vector3 {
        private _x;
        private _y;
        private _z;
        constructor(x?: number, y?: number, z?: number);
        get x(): number;
        set x(value: number);
        get y(): number;
        set y(value: number);
        get z(): number;
        set z(value: number);
        set(x?: number, y?: number, z?: number): void;
        equals(v: Vector3): boolean;
        static get zero(): Vector3;
        static get one(): Vector3;
        static distance(a: Vector3, b: Vector3): number;
        toArray(): number[];
        toFloat32Array(): Float32Array;
        copyFrom(vector: Vector3): void;
        setFromJson(json: any): void;
        add(v: Vector3): Vector3;
        subtract(v: Vector3): Vector3;
        multiply(v: Vector3): Vector3;
        divide(v: Vector3): Vector3;
        clone(): Vector3;
        toVector2(): Vector2;
    }
}
declare namespace TSE {
    interface IMessageHandler {
        onMessage(message: Message): void;
    }
}
declare namespace TSE {
    enum MessagePriority {
        NORMAL = 0,
        HIGH = 1
    }
    class Message {
        code: string;
        context: any;
        sender: any;
        priority: MessagePriority;
        constructor(code: string, sender: any, context?: any, priority?: MessagePriority);
        static send(code: string, sender: any, context?: any): void;
        static sendPriority(code: string, sender: any, context?: any): void;
        static subscribe(code: string, handler: IMessageHandler): void;
        static unsubscribe(code: string, handler: IMessageHandler): void;
    }
}
declare namespace TSE {
    class MessageBus {
        private static _subscriptions;
        private static _normalQueueMessagePerUpdate;
        private static _normalMessageQueue;
        private constructor();
        static addSubscription(code: string, handler: IMessageHandler): void;
        static removeSubscription(code: string, handler: IMessageHandler): void;
        static post(message: Message): void;
        static update(time: number): void;
    }
}
declare namespace TSE {
    class MessageSubscriptionNode {
        message: Message;
        handler: IMessageHandler;
        constructor(message: Message, handler: IMessageHandler);
    }
}
declare namespace TSE {
    class Scene {
        private _root;
        constructor();
        get root(): SimObject;
        get isLoaded(): boolean;
        addObject(object: SimObject): void;
        getObjectByName(name: string): SimObject;
        load(): void;
        update(time: number): void;
        render(shader: Shader): void;
    }
}
declare namespace TSE {
    class SimObject {
        private _id;
        private _children;
        private _parent;
        private _isLoaded;
        private _scene;
        private _components;
        private _behaviors;
        private _isVisible;
        private _localMatrix;
        private _worldMatrix;
        name: string;
        transform: Transform;
        constructor(id: number, name: string, scene?: Scene);
        get id(): number;
        get parent(): SimObject;
        get worldMatrix(): Matrix4x4;
        get isLoaded(): boolean;
        get isVisible(): boolean;
        set isVisible(value: boolean);
        addChild(child: SimObject): void;
        removeChild(child: SimObject): void;
        getComponentByName(name: string): IComponent;
        getBehaviorByName(name: string): IBehavior;
        getObjectByName(name: string): SimObject;
        addComponent(component: IComponent): void;
        addBehavior(behavior: IBehavior): void;
        load(): void;
        updateReady(): void;
        update(time: number): void;
        render(shader: Shader): void;
        getWorldPosition(): Vector3;
        protected onAdded(scene: Scene): void;
        private updateWorldMatrix;
    }
}
declare namespace TSE {
    enum ZoneState {
        UNINITIALIZED = 0,
        LOADING = 1,
        UPDATING = 2
    }
    class Zone {
        private _id;
        private _name;
        private _description;
        private _scene;
        private _state;
        private _globalID;
        constructor(id: number, name: string, description: string);
        get id(): number;
        get name(): string;
        get description(): string;
        get scene(): Scene;
        initialize(zoneData: any): void;
        load(): void;
        unload(): void;
        update(time: number): void;
        render(shader: Shader): void;
        onActivated(): void;
        onDeactivated(): void;
        private loadSimObject;
    }
}
declare namespace TSE {
    class ZoneManager implements IMessageHandler {
        private static _globalZoneID;
        private static _registeredZones;
        private static _activeZone;
        private static _inst;
        private constructor();
        static initialize(): void;
        static changeZone(id: number): void;
        static update(time: number): void;
        static render(shader: Shader): void;
        onMessage(message: Message): void;
        private static loadZone;
    }
}
