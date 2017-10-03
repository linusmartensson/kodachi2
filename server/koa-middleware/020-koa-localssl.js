
module.exports = (app) => {
	app.koa.use(async (ctx, next) => {
		ctx.set('Access-Control-Allow-Origin', 'nothing');
        for(let q of app.origins){
            if(ctx.headers.origin == q){
		        ctx.set('Access-Control-Allow-Origin', q);
            }
        }
		ctx.set('Access-Control-Allow-Credentials', 'true');
		await next();
	});
}
