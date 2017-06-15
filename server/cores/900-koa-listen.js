import Koa from 'koa';
import winston from 'winston'
import https from 'https'
import http from 'http'
var tools = require('../tools/core')

module.exports = async (app) => {

	app.koa.listen(3001);

	winston.info("Started koa!");

	return true;
}
