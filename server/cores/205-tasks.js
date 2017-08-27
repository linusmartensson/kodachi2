
module.exports = (app) => {
    var api = {};

    //Task creation api
    api.yesno = () => {
        return [{field:'yes', desc:'yes', type:'button'},{field:'no', desc:'no', type:'button'}];
    }
    api.okcancel = () => {
        return [{field:'ok', desc:'ok', type:'button'},{field:'cancel', desc:'cancel', type:'button'}];
    }
    api.step = (task_name, inputs, result_handler, post_handler) => {
        api.create_task("", task_name, [], [], inputs, result_handler, post_handler);
        return api.step;
    }
    api.create_task = (task_group, task_name, starter_roles, handler_roles, inputs, result_handler, post_handler) => {
        if(!app.tasks) app.tasks = {};

        if(!post_handler) post_handler = ()=>{return 'OK'};

        app.tasks[task_name] = {
            task_group:task_group,
            task_name:task_name,
            starter_roles:starter_roles,
            handler_roles:handler_roles,
            inputs:inputs,
            result_handler:result_handler,
            post_handler:post_handler
        }
        return api.create_task;
    }
    //-----------------------------------

    //DB update API
    async function updateAccessibleTaskInstance(ctx, task_id, data) {
        if(data){
            return await app.cypher("MATCH (t:Task) WHERE t.id={target} RETURN t", {target:task_id});
        } else {
            var t = await app.cypher("MATCH (t:Task) WHERE t.id={target} SET t.data={data} RETURN t", {target:task_id, data:data});

            //Find sessions
            var s = await app.cypher("MATCH (t:Task)-[:HANDLED_BY]->()-[*0..2]-(s:Session) WHERE t.id={target} RETURN s", {target:task_id});

            //Notify task update
            app.sessionApi.notifySessions(s);
            return t;
        }
    }
    async function finishTask(task_id){
        var s = await app.cypher("MATCH (t:Task)-[:HANDLED_BY]->()-[*0..2]-(s:Session) WHERE t.id={target} RETURN s", {target:inst.id});

        //Find sessions
        await app.cypher("MATCH (t:Task) WHERE t.id={target} DELETE t", {target:task_id});

        //Notify task finish
        app.sessionApi.notifySessions(s);
    }
    async function addTaskToUser(task){
        await app.cypher("MATCH (u:User) WHERE u.id={target} CREATE (t:Task {id:{id}, data:{data}})-[:HANDLED_BY]->u", {target:task.origin, id:task.id, data:JSON.stringify(task)});
    }
    async function addTaskToSession(task){
        await app.cypher("MATCH (s:Session) WHERE s.id={target} CREATE (t:Task {id:{id}, data:{data}})-[:HANDLED_BY]->s", {target:task.origin, id:task.id, data:JSON.stringify(task)});
    }
    async function addTaskToRoles(task, roles){
        await app.cypher("MATCH (r:Role) WHERE r.name IN {targets} CREATE (t:Task {id:{id}, data:{data}})-[:HANDLED_BY]->r", {targets:roles, id:task.id, data:JSON.stringify(task)});
    }
    async function setupTask(ctx, inst, task) {
        if(!task.handler_roles){
            var user = await app.userApi.getUser(inst.origin);
            if(user){
                await addTaskToUser(inst);
            } else {
                await addTaskToSession(inst);
            }
        } else {
            await addTaskToRoles(inst, task.handler_roles);
        }

        //Find sessions
        var s = await app.cypher("MATCH (t:Task)-[:HANDLED_BY]->()-[*0..2]-(s:Session) WHERE t.id={target} RETURN s", {target:inst.id});

        //Notify task start
        app.sessionApi.notifySessions(s);
    }
    //-----------------------------------

    api.start_task = async (ctx, task_name, start_data, origin) => {
        if(!app.tasks || !app.tasks[task_name]) return false; 

        var task = app.tasks[task_name];

        if(!origin){
        
            //Check if user may start app.
            if(!task.starter_roles) return false; //Can't be started manually.
            if(!app.userApi.hasAnyRole(app.userApi.userId(ctx), task.starter_roles)) return false;
        }

        if(!start_data) start_data = {};
        var inst = {task_name:task.taskName, id:app.uuid(), data:start_data, next_tasks:[], origin:origin||app.userApi.userId(ctx)||app.userApi.session(ctx), result:'WAIT_RESPONSE', response:{}}
        
        setupTask(ctx, inst, task);
        return true;
    }

    async function trickleTask(ctx, inst, child_inst){
        if(!inst.children) inst.children = {};
        
        if(child_inst)
            inst.children[child_inst.task_name] = child_inst;

        if(inst.children.length == inst.next_tasks.length){

            inst.finished_tasks = inst.next_tasks;
            inst.next_tasks = [];

            //Merge child data into instance
            for(n in inst.children){
                Object.assign(inst.data, inst.children[n].data);
            }
            
            //This layer is complete, so call the post handler.
            var result = app.tasks[inst.task_name].post_handler(inst);

            inst.result = result;

            await updateAccessibleTaskInstance(ctx, inst.id, inst);
                    
            switch(result){
                case 'OK':
                    break;
                case 'RETRY':
                    inst.children = {}; //Reset all sub-tasks.
                    inst.next_tasks = [];
                    return result;
                case 'FAIL':
                default:
                    inst.next_tasks = [];
                    finishTask(inst.id);
                    break;
            }

            //As long as we have results and parents, keep trickling.
            if(!inst.next_tasks){
                //We're only returning the top-level result in the api.
                if(inst.parent) trickleTask(ctx, inst.parent);
            } else {

                //Start new child tasks
                nextTask(ctx, inst, app.tasks[inst.task_name]);
            }

            return result;
        }
    }
    async function nextTask(ctx, inst, task){
    
        if(inst.next_tasks) {
            //Handle all child tasks.
            for(n in inst.next_tasks){
                var child_task = app.tasks[inst.next_tasks[n]];
                var child_inst = {task_name:child_task.task_name, id:app.uuid(), next_tasks:[], data:inst.data, parent:inst, origin:inst.origin, result:'WAIT_RESPONSE', response:{}};
                setupTask(ctx, child_inst, child_task);
            }
        
            return inst.result;
        } else {

            //Reached end of chain, so trickle the task handler upwards.
            return trickleTask(ctx, inst);
        }
    }

    api.respond_task = async (ctx, task_id, response) => {

        //Find the task instance.
        var inst = await updateAccessibleTaskInstance(ctx, task_id, null);
        if(!inst) return 'NO_TASK_ID';  //There is no matching task instance.

        //Find the task
        var task = app.tasks[inst.task_name];

        //Process the response
        inst.response = response;
        var result = await task.result_handler(inst, ctx);

        //Store the result
        inst.result = result;
        await updateAccessibletaskInstance(ctx, task_id, inst);

        switch(result){
            case 'OK': 
                result = await nextTask(ctx, inst, task);
                break;
            case 'RETRY':
                break;
            case 'FAIL':
            default:
                finishTask(task_id);
                return result;
        }
        

        return result;
    }

    app.taskApi = api;

	require('../tools/core').loader("tasks", app);
}
