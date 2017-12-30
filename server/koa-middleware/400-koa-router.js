
import Router from 'koa-router'
import mount from 'koa-mount'

module.exports = (app) => {
	var r = new Router();

	r.get('/session', async ctx => {
        ctx.body = ctx.session_id; //Output session id.    
	})
    r.get('/list/:target', async (ctx, next) => {
        ctx.response.body = await app.listApi.fetch_list(ctx, ctx.params.target, ctx.params);
    });

    //Handle tasks
    r.use('/task', require('../router/task')(app).routes());

    r.get('/__verifyEmail/:code', async (ctx, next) => {
        var code = ctx.params.code;

        await app.cypher('MATCH (u:User {verifyCode:{code}} SET u.verified = true');

        ctx.body = "Kontot har verifierats! ^_^";

    });
    
    app.koa.use(mount('/img', require('koa-static')(__dirname + '/../../client/build/img', {maxage:1000*60*60})))
    app.koa.use(mount('/', require('koa-static')(__dirname + '/../../client/build/')))

	app.koa.use(r.routes());
	app.koa.use(r.allowedMethods());

    app.koa.use(async(ctx, next) => {
        if(ctx.response.status == '404')
            ctx.redirect('/');
    });

}
