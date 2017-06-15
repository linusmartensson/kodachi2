
import winston from 'winston'

module.exports = (app) => {

	app.clients = {};

	app.io.on('connection', (ctx,data) => {
		winston.info("Connected", ctx.socket.id);
		app.clients[ctx.socket.id] = {};
		app.clients[ctx.socket.id].ctx = ctx;
	});

	app.io.on('disconnect', ctx => {
		winston.info("Disconnected", ctx.socket.id);
		delete app.clients[ctx.socket.id];
	});
}