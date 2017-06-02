import Koa from 'koa';
import winston from 'winston'
var tools = require('../tools/core')

module.exports = async (app) => {
	app.koa.listen(3000);

	winston.info("Started koa!");

	return true;
}