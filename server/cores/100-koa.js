import Koa from "koa";
import winston from "winston";
var tools = require("../tools/core");

module.exports = async (app) => {
	winston.info("Starting koa...");

	app.koa = new Koa();
	require("../config/koa")(app);
	app.koa.on("error", function(err, ctx){
		winston.error("koa-onerror", err);
	});
	require("koa-onerror")(app.koa);
	winston.info("Configured koa...");
	await tools.loader("koa-middleware", app);


	return true;
};
