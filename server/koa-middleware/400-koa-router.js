
import Router from 'koa-router'

module.exports = (app) => {
	var r = new Router();

	r.get('/details', ctx => {
		console.dir(ctx);
		console.dir("IO")
		console.dir(app.io);
		ctx.body = "Hello!"
	})

	r.post('/register', (ctx, next) => {

	});
	r.post('/login', (ctx, next) => {
		return app.passport.authenticate('local', {
			successRedirect: '/token',
			failureRedirect: '/'
		})(ctx, next)
	});

	r.get('/status', (ctx, next) => {
		//Get complete current user status
	});
	r.get('/content', (ctx, next) => {

	});

    //Handle tasks
    router.use('/task', require('../router/task')(app).routes());

    //Retrieve ui data
    router.use('/content', require('../router/content')(app).routes());

    //Retrieve account details
    router.use('/account', require('../router/account')(app).routes());

	app.koa.use(r.routes());
	app.koa.use(r.allowedMethods());
}
