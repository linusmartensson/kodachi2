import Koa from "koa";
import winston from "winston"
import https from "https"
import http from "http"
import koa from "koa"
var tools = require("../tools/core")

module.exports = async (app) => {

	app.koa.listen(3001);

    app.redirect = new Koa();
    app.redirect.use(require("koa-sslify")());
    app.redirect.listen(3002);

	winston.info("Started koa!");

	return true;
}
