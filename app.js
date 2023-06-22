var engine;
// the main entry piont to the program
window.onload = function () {
    engine = new TSE.Engine(320, 480);
    engine.start("viewport");
};
window.onresize = function () {
    engine.resize();
};
