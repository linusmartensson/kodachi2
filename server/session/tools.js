
module.exports = (app) => {


    app.sessionApi.register(async (ctx, state) => {
        //Pick out accessible tasks.
        var tools = [];
        var roles = await app.userApi.getUserRoles(ctx);
        console.dir(roles);
        for(var t in app.tasks){
            var rs = app.tasks[t].starter_roles;
            for(let v of rs){
                if(roles.includes(v)){
                    tools.push({id:t, task:t, title:'{task.'+app.tasks[t].task_name+'.title}'});
                    break;
                }
            }
        }
        
        await app.stringApi.translate(ctx, tools);
        state.tools = tools;
    });
}
