import winston from 'winston'

module.exports = (app) => {

	app.io.on('data', (ctx, data) => {
		ctx.socket.emit('response', {
			message:"wtf"
		})
	});

	app.io.on('ack', (ctx, data) => {
		ctx.socket.emit('response', {
			message: 'looks good to me!'
		});
	});

	return (ctx,next) => {next()};
}