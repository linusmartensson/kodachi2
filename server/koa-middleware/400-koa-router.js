
import Router from "koa-router";
import mount from "koa-mount";

module.exports = (app) => {
    const r = new Router();

    r.get("/session", async (ctx) => {
        ctx.body = ctx.session_id; // Output session id.
    });
    r.get("/data/:target", async (ctx, next) => {
        ctx.response.body = await app.listApi.fetch_list(ctx, ctx.params.target, ctx.params);
    });

    // Handle tasks
    r.use("/task", require("../router/task")(app).routes());

    r.get("/__doLogin/:session/:code", async (ctx, next) => {
        const code = ctx.params.code;
        const session = ctx.params.session;

        let user = await app.cypher("MATCH (u:User {logincode:{code}}) SET u.logincode = {random} return u", {code, random:app.uuid()+app.uuid()+app.uuid()});
        
        if(user.records && user.records.length > 0){
            var id = user.records[0].get('u').properties.id;
            await app.userApi.loginSession(id, session);
            await app.sessionApi.notifySessions([session], {});
        }

        ctx.body = "Om koden var giltig så är du nu inloggad på enheten som bad om detta mailet! ^_^";
    });
    r.get("/__verifyEmail/:code", async (ctx, next) => {
        const code = ctx.params.code;

        await app.cypher("MATCH (u:User {verifyCode:{code}}) SET u.verified = true", {code});

        ctx.body = "Kontot har verifierats! ^_^";
    });

    app.koa.use(mount("/img", require("koa-static")(`${__dirname}/../../client/build/img`, {maxage: 1000 * 60 * 60})));
    app.koa.use(mount("/", require("koa-static")(`${__dirname}/../../client/build/`)));

    app.koa.use(r.routes());
    app.koa.use(r.allowedMethods());

    app.koa.use(async (ctx, next) => {
        if (ctx.response.status === 404) {
            ctx.redirect("/");
        }
    });

};
