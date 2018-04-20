import Koa from "koa";
import http from "http";
import https from "https";
const tools = require("../tools/core");

module.exports = async (app) => {

    app.koa.listen(3001);

    app.redirect = new Koa();
    app.redirect.use(require("koa-sslify")());
    app.redirect.listen(3002);

    console.log("Started koa!");

    return true;
};
