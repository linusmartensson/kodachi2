
import IO from 'koa-socket';
import winston from 'winston';
import cookie from 'cookie';
var tools = require('../tools/core');

module.exports = async (app) => {
	app.io = new IO();
	app.io.attach(app.koa);

	tools.loader("socketio", app);

	winston.info("SocketIO loaded!");
}