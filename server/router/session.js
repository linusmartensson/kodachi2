
import Router from 'koa-router'

module.exports = (app) => {

    var r = new Router();

    r.get('session', async function(ctx, next) => {
        return app.userApi.session(ctx); //Output session id.    
    });

    return r;

}

