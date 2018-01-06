import winston from "winston"

module.exports = (app) => {

	app.io.on("hello", (ctx, data) => {
		console.log("LOL");
		ctx.socket.emit("world", {
			"message":"woop!"
		})
	});

	app.io.on("data", (ctx, data) => {
		console.dir("OMG");
		ctx.socket.emit("response", {
			message:"wtf"
		})
	});

/*	app.io.on('ack', (ctx, data) => {
		ctx.socket.emit('response', {
			message: 'looks good to me!'
		});
	});*/

	return (ctx,next) => {next()};
}