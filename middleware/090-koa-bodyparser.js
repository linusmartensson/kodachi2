
import bodyParser from 'koa-bodyparser'


module.exports = (app) => {
	app.koa.use(bodyParser());
}