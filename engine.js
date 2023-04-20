var TSE;
(function (TSE) {
    var Engine = (function () {
        function Engine() {
        }
        Engine.prototype.start = function () {
            this._canvas = TSE.GLUtilities.initialize();
            console.log("hey");
            TSE.gl.clearColor(0, 0, 0, 1);
            this.loop();
        };
        Engine.prototype.resize = function () {
        };
        Engine.prototype.loop = function () {
            TSE.gl.clear(TSE.gl.COLOR_BUFFER_BIT);
            requestAnimationFrame(this.loop.bind(this));
        };
        Engine.prototype.loadShaders = function () {
        };
        return Engine;
    }());
    TSE.Engine = Engine;
})(TSE || (TSE = {}));
//# sourceMappingURL=engine.js.map