
module.exports = (app) => {
    app.sessionApi.register(async (ctx, state) => {
        
        //Pick out accessible tasks.

        var tools = [];
        var roles = await app.userApi.getUserRoles(ctx);
        var activeEvent = await app.userApi.getActiveEvent(ctx).id;
        
        for(var t in app.tasks){
            var rs = app.tasks[t].starter_roles;
            var event_task = false;
            if(app.taskApi.eventTask(app.tasks[t])){
                rs = app.taskApi.getTask(t+'.'+activeEvent).starter_roles;
                event_task = true;
            }
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
