
module.exports = (app) => {
    app.sessionApi.register(async (ctx, state) => {

        // Pick out accessible tasks.

        const tools = [];
        const roles = await app.userApi.getUserRoles(ctx);
        const activeEvent = (await app.userApi.getActiveEvent(ctx)).id;

        const s = (await app.cypher("MATCH (t:Task), (s:Session {id:{sessionId}}) WHERE (t)-[:HANDLED_BY]->(s) OR (t)-[:HANDLED_BY]->(:User)-[:HAS_SESSION]->(s) OR (t)-[:HANDLED_BY]->(:Role)<-[:HAS_ROLE]-(:User)-[:HAS_SESSION]->(s) RETURN t", {sessionId: ctx.session.localSession})).records;

        const uniques = {};

        for (const q of s) {
            const task = JSON.parse(q.get("t").properties.data);
            if (app.taskApi.uniqueTask(app.tasks[task.task_name])) {
                uniques[task.task_name] = true;
            }
        }
        for (const t in app.tasks) {
            if (uniques[t]) {
                continue;
            }
            let hide = false;
            for (const q of app.tasks[t].inputs) {
                if (q.hide) {
                    hide = true;
                    break;
                }
            }
            if (hide) {
                continue;
            }
            let rs = app.tasks[t].starter_roles;
            let event_task = false;
            if (app.taskApi.eventTask(app.tasks[t])) {
                rs = app.taskApi.getTask(`${t}.${activeEvent}`).starter_roles;
                event_task = true;
            }
            let skip = false;
            for (const v of rs) {
                if (v.match(/^!/) !== null && roles.includes(v.split("!")[1])) {
                    skip = true;
                    break;
                }
            }
            if (skip) {
                continue;
            }
            for (const v of rs) {
                if (roles.includes(v)) {
                    const id = event_task ? (`${t}.${activeEvent}`) : t;
                    tools.push({
                        id,
                        task: id,
                        title: `{task.${app.tasks[t].task_name}.title}`
                    });
                    break;
                }
            }
        }

        await app.stringApi.translate(ctx, tools);
        state.tools = tools;
    });
};
