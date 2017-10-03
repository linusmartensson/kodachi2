
import Router from 'koa-router'

module.exports = (app) => {
	var r = new Router();

	r.get('/session', async ctx => {
        ctx.body = ctx.session_id; //Output session id.    
	})

    //Handle tasks
    r.use('/task', require('../router/task')(app).routes());

	app.koa.use(r.routes());
	app.koa.use(r.allowedMethods());
}
