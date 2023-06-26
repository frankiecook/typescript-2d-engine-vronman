
var engine: TSE.Engine;

// the main entry piont to the program
window.onload = function () {
	engine = new TSE.Engine(320,480);
	engine.start("glcanvas");
}

window.onresize = function () {
	engine.resize();
}