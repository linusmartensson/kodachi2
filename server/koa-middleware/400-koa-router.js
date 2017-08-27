
import Router from 'koa-router'

module.exports = (app) => {
	var r = new Router();

	r.get('/details', ctx => {
		console.dir(ctx);
		console.dir("IO")
		console.dir(app.io);
		ctx.body = "Hello!"
	})

	r.get('/status', (ctx, next) => {
		//Get complete current user status
	});
	r.get('/content', (ctx, next) => {

	});

    //Handle tasks
    r.use('/task', require('../router/task')(app).routes());

    //Retrieve ui data
    r.use('/content', require('../router/content')(app).routes());

    //Retrieve account details
    r.use('/account', require('../router/account')(app).routes());

	app.koa.use(r.routes());
	app.koa.use(r.allowedMethods());
}
