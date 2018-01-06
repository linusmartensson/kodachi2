import Router from "koa-router";

module.exports = (app) => {

    const r = new Router();

    r.post("/start_task/:task_name", async (ctx, next) => {
        ctx.body = await app.taskApi.start_task(ctx, ctx.params.task_name, ctx.request.body);
    });

    r.post("/respond_task/:task_id", async (ctx, next) => {
        const form = await app.utils.form(ctx);
        ctx.body = await app.taskApi.respond_task(ctx, ctx.params.task_id, form);
    });
    return r;

};

