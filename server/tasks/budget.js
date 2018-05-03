
module.exports = async (app) => {

    app.taskApi.create_task(
        "budget", "upload_receipt",
        ["receipt_submitter.", "admin.", "budget.", "admin"], [],
        app.taskApi.okcancel().concat(
            {event_task: true, autocancel: true},
            {field: "purchase", type: "text"},
            {field: "image", type: "image"},
            {field: "total", type: "number"},
            {field: "account_no", type: "text"},
            {field: "clearing_no", type: "simpletext"},
            {field: "group", type: "dropdown", prepare: async (v, ctx) => {
                const r = await app.cypher("MATCH (r:BudgetGroup)-->(e:Event {id:{event}}) RETURN r", {event: (await app.userApi.getActiveEvent(ctx)).id});
                v.values = [];
                for (const q of r.records) {
                    const w = q.get("r").properties;
                    v.values.push(w.type);
                }
            }}
        ),
        async (inst, ctx) => {
            if (inst.response.cancel) {
                return "OK";
            }
            if (app.taskApi.emptyFields(inst)) {
                return "RETRY";
            }

            if (!inst.response.image.file) {
                return "RETRY";
            }

            await app.roleApi.addAchievement(inst.origin, "gimme_my_money", 1, app.userApi.getActiveEvent(ctx), 1, 0);

            inst.response.image = await app.utils.upload(inst.response.image);

            inst.data.event = (await app.userApi.getActiveEvent(ctx)).id;

            inst.data.receipt = inst.response;
            inst.data.user = await app.userApi.getUser(await app.userApi.userId(ctx));
            delete inst.data.user.password;
            inst.data.receipt.id = app.uuid();
            inst.next_tasks.push("review_receipt");
            return "OK";
        }, async (inst) => "OK"
    );

    app.taskApi.create_task(
        "budget", "review_receipt",
        [], ["budget."],
        app.taskApi.yesno().concat(
            {field: "total", type: "number"},
            {event_task: true, field: "group", type: "dropdown", prepare: async (v, ctx) => {
                const r = await app.cypher("MATCH (r:BudgetGroup)-->(e:Event {id:{event}}) RETURN r", {event: (await app.userApi.getActiveEvent(ctx)).id});
                v.values = [];
                for (const q of r.records) {
                    const w = q.get("r").properties;
                    v.values.push(w.type);
                }
            }}
        ),
        async (inst) => {
            if (inst.response.no) {
                inst.next_tasks.push("deny_receipt");
                return "OK";
            }
            inst.data.receipt.group = inst.response.group;
            inst.data.receipt.total = inst.response.total;

            await app.cypher("MATCH (r:BudgetGroup {type:{group}})-->(e:Event {id:{event}}) CREATE (r)-[:CONTAINS]->(:Receipt {image:{image}, purchase:{purchase}, total:{total}, id:{id}}) SET r.total = toInt(r.total) + toInt({total})", {...inst.data.receipt, event: inst.data.event});

            inst.next_tasks.push("accept_receipt");
            inst.next_tasks.push("pay_receipt");
            return "OK";
        }, async (inst) => "OK"
    );

    app.taskApi.create_task(
        "budget", "pay_receipt",
        [], ["budget."], [{event_task: true, field: "ok", type: "button"}],
        async (inst) => {
            await app.cypher("MATCH (r:Receipt id:{id}) SET r.paid=1", {id: inst.data.receipt.id});
            return "OK";
        }, async (inst) => "OK"
    );
    app.taskApi.create_task(
        "budget", "accept_receipt",
        [], [], [{event_task: true, autocancel: true, field: "ok", type: "button"}],
        async (inst) => "OK", async (inst) => "OK"
    );
    app.taskApi.create_task(
        "budget", "deny_receipt",
        [], [], [{event_task: true, autocancel: true, field: "ok", type: "button"}],
        async (inst) => "OK", async (inst) => "OK"
    );

    app.taskApi.create_task(
        "budget", "add_budgetgroup", ["budget.", "admin.", "overseer."], [], app.taskApi.okcancel().concat({event_task: true, autocancel: true, field: "budget_type", type: "simpletext"}, {field: "limit", type: "number"}),
        async (inst, ctx) => {
            if (inst.response.cancel) {
                return "OK";
            }
            if (app.taskApi.emptyFields(inst)) {
                return "RETRY";
            }

            await app.budgetApi.addGroup(inst.data.start_data.event_id, inst.response.budget_type, inst.response.limit);
            return "OK";
        },
        async (inst) => "OK"
    );


};
