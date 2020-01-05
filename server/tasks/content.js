
module.exports = async (app) => {

    await app.cypher("CREATE CONSTRAINT ON (c:Content) ASSERT c.id IS UNIQUE");

    app.taskApi.create_task(
        "content", "create_page",
        ["editor", "admin"], [],
        app.taskApi.okcancel().concat(
            {field: "title", type: "text"},
            {field: "id", type: "simpletext"},
            {field: "event", type: "bool"},
            {field: "lang", type: "dropdown", translate: true, values: ["sv", "eng", "all"]},
            {field: "access", type: "select", prepare: async (v, ctx) => {
                const r = await app.cypher("MATCH (r:Role) RETURN r ORDER BY r.type");
                v.values = [];
                for (const q of r.records) {
                    const w = q.get("r").properties;
                    v.values.push(w.type);
                }
            }},
            {field: "content", type: "editor"}
        ),
        async (inst, ctx) => {


            if (inst.response.cancel) {
                return "OK";
            }
            if (app.taskApi.emptyFields(inst)) {
                return "RETRY";
            }

            if (inst.response.event) {
                inst.response.event = (await app.userApi.getActiveEvent(ctx)).id;
            }
            try {
                await app.roleApi.addAchievement(inst.origin, "write_stuff", 1, app.userApi.getActiveEvent(ctx), 10, 10);
                await app.roleApi.addAchievement(inst.origin, "write_so_much_stuff", 1, app.userApi.getActiveEvent(ctx), 50, 100);
                await app.roleApi.addRole(await app.userApi.userId(ctx), "editor", 500);
                if (inst.data.start_data.edit) {
                    await app.cypher("MATCH (c:Content {id:{id}}) DETACH DELETE c", {id: inst.data.start_data.id});
                }
                await app.cypher("CREATE (:Content {id:{id}, content:{content}, title:{title}, event:{event}, lang:{lang}})", inst.response);
                for (const v of inst.response.access) {
                    await app.cypher("MATCH (c:Content {id:{id}}), (r:Role {type:{type}}) CREATE (r)-[:HAS_ACCESS]->(c)", {type: v, id: inst.response.id});
                }
            } catch (e){
                console.dir(e);
                inst.error = "{task.error.createPage}"
                return "RETRY";
            }
            return "OK";
        }
    );

};
