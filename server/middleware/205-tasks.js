
module.exports = (app) => {
    var api = {};

    api.yesno = () => {
        return [{field:'yes', desc:'yes', type:'button'},{field:'no', desc:'no', type:'button'}],
    }
    api.okcancel = () => {
        return [{field:'ok', desc:'ok', type:'button'},{field:'cancel', desc:'cancel', type:'button'}],
    }
    
    api.create_task = (task_name, starter_roles, handler_roles, inputs, result_handler, post_handler = ()=>{return 'OK'}) => {
        if(!app.tasks) app.tasks = {};

        app.tasks[task_name] = {
            task_name:task_name,
            starter_roles:starter_roles,
            handler_roles:handler_roles,
            inputs:inputs,
            result_handler:result_handler,
            post_handler:post_handler
        }
        return api.create_task;
    }

    



    function addTaskToUser(ctx, task){
        //Note: Target origin user, not current user.
        return false;
    }
    function addTaskToSession(ctx, task){
        //Note: Target origin session, not current session.
        return false;
    }
    function addTaskToRoles(ctx, task){
        return false;
    }

    function setupTask(ctx, inst, task) {

        if(!task.handler_roles){
            if(app.userApi.loggedIn(ctx)){
                addTaskToUser(ctx, inst);
            } else {
                addTaskToSession(ctx, inst);
            }
        } else {
            addTaskToRoles(ctx, inst, task.handler_roles);
        }

    }

    api.start_task = (ctx, task_name, start_data) => {
        if(!app.tasks || !app.tasks[task_name]) return false; 

        var task = app.tasks[task_name];

        //Check if user may start app.
        if(!task.starter_roles) return false; //Can't be started manually.
        if(!app.userApi.hasAnyRole(ctx, task.starter_roles)) return false;

        if(!start_data) start_data = {};
        var inst = {task_name:task.taskName, id:app.uuid(), data:start_data, next_tasks:[], origin:app.userApi.userId(ctx), result:'WAIT_RESPONSE', response:{}}
        
        setupTask(ctx, inst, task);
        return true;
    }

    function updateAccessibleTaskInstance(ctx, task_id) {
        return false;
    }

    function finishTask(inst, task, result){
        
    }
    function trickleTask(ctx, inst, child_inst){
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
    function async nextTask(ctx, inst, task){
    
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
        var result = await task.result_handler(inst);

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
