
import staticCache from 'koa-static-cache'

module.exports = (app)=>{
	app.staticCache = staticCache('public', {prefix:'/public'});
}