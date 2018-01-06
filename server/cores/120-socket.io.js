
import IO from "koa-socket-2";
import winston from "winston";
import cookie from "cookie";
var tools = require("../tools/core");

module.exports = async (app) => {
	app.io = new IO();
	app.io.attach(app.koa, true, app.ssl);

	tools.loader("socketio-middleware", app);

	winston.info("SocketIO loaded!");
}
