
module.exports = (app) => {
	app.koa.use(async (ctx, next) => {
		ctx.set('Access-Control-Allow-Origin', 'null');
		ctx.set('Access-Control-Allow-Credentials', 'true');
		await next();
	});
}