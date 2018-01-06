
var _ = require("lodash");
module.exports = async (app) => {

    app.sessionApi.register(async (ctx, state) => {

        var tasks = [];
        var s = (await app.cypher("MATCH (t:Task), (s:Session {id:{id}}) WHERE (t)-[:HANDLED_BY]->(s) OR (t)-[:HANDLED_BY]->(:User)-[:HAS_SESSION]->(s) OR (t)-[:HANDLED_BY]->(:Role)<-[:HAS_ROLE]-(:User)-[:HAS_SESSION]->(s) RETURN t", {id:ctx.session.localSession})).records;

        for(let q of s){
            var task = JSON.parse(q.get("t").properties.data);
            delete task.data.private;
            task.type = _.cloneDeep(app.tasks[task.task_name]);
            task.description = "{|task."+task.type.task_name+".desc}";
            task.title = "{task."+task.type.task_name+".title.active}";
            for(var v of task.type.inputs) {

                if(v.prepare) await v.prepare(v, ctx, task);


                if(!v.field) continue;
                v.desc = "{|input."+v.field+".desc}";
                v.name = "{input."+v.field+".name}";

                if(v.values && v.translate){
                    for(var w in v.values) {
                        v.values[w] = "{input.value."+v.values[w]+"}";
                    }
                } else if (v.values) {
                    for(var w in v.values) {
                        if(typeof v.values[w] === "object" && v.values[w].desc) v.values[w].desc = app.stringApi.bookParser(v.values[w].desc, v.values[w].id);
                    }
                }
            }

            tasks.push(task);
        }

        await app.stringApi.translate(ctx, tasks);
        for(var v of tasks){
            await app.stringApi.parseDeep(v.description, v.data); 
            await app.stringApi.translate(ctx, v.description, await app.userApi.getLanguage(ctx)); 
        }
        state.tasks = tasks;
    });

};
