

module.exports = (app) => {
	app.koa.use((ctx, next) => {
		ctx.session.lol = (ctx.session.lol+1);
		next();
	});
}