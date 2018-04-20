import Koa from "koa";
const tools = require("../tools/core");

module.exports = async (app) => {
    console.log("Starting koa...");

    app.koa = new Koa();
    require("../config/koa")(app);
    app.koa.on("error", (err, ctx) => {
        console.log("koa-onerror", err);
    });
    require("koa-onerror")(app.koa);
    console.log("Configured koa...");
    await tools.loader("koa-middleware", app);


    return true;
};
