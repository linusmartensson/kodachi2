
module.exports = (app) => {
    app.sessionApi.register(async (ctx, state) => {
        
        //Pick out accessible tasks.

        var tools = [];
        var roles = await app.userApi.getUserRoles(ctx);
        var activeEvent = (await app.userApi.getActiveEvent(ctx)).id;
        
        var s = (await app.cypher("MATCH (t:Task), (s:Session {id:{sessionId}}) WHERE (t)-[:HANDLED_BY]->(s) OR (t)-[:HANDLED_BY]->(:User)-[:HAS_SESSION]->(s) OR (t)-[:HANDLED_BY]->(:Role)<-[:HAS_ROLE]-(:User)-[:HAS_SESSION]->(s) RETURN t", {sessionId:ctx.session.localSession})).records;

        var uniques = {};

        for(let q of s){
            var task = JSON.parse(q.get('t').properties.data);
            if(app.taskApi.uniqueTask(app.tasks[task.task_name])) {
                uniques[task.task_name] = true;
            }
        }
        for(var t in app.tasks){
            if(uniques[t]) {
                continue;
            }
            var hide = false;
            for(var q of app.tasks[t].inputs){
                if(q.hide) {
                    hide = true;
                    break;
                }
            }
            if(hide) continue;
            var rs = app.tasks[t].starter_roles;
            var event_task = false;
            if(app.taskApi.eventTask(app.tasks[t])){
                rs = app.taskApi.getTask(t+'.'+activeEvent).starter_roles;
                event_task = true;
            }
            var skip = false;
            for(let v of rs){
                if(v.match(/^!/) != null && roles.includes(v.split('!')[1])){skip = true; break;};
            }
            if(skip) continue;
            for(let v of rs){
                if(roles.includes(v)){
                    var id = event_task?(t+'.'+activeEvent):t;
                    tools.push({
                        id:id, 
                        task:id, 
                        title:'{task.'+app.tasks[t].task_name+'.title}'
                    });
                    break;
                }
            }
        }

        await app.stringApi.translate(ctx, tools);
        state.tools = tools;
    });
}
