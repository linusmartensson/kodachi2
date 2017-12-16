
import Router from 'koa-router'
import mount from 'koa-mount'

module.exports = (app) => {
	var r = new Router();

	r.get('/session', async ctx => {
        ctx.body = ctx.session_id; //Output session id.    
	})

    //Handle tasks
    r.use('/task', require('../router/task')(app).routes());
    
    app.koa.use(mount('/', require('koa-static')(__dirname + '/../../client/build/')))

	app.koa.use(r.routes());
	app.koa.use(r.allowedMethods());

}
