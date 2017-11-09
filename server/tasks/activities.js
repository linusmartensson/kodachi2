
module.exports = async (app) => {

    app.taskApi.step('staff_test', 
            [{field:'q1', type:'dropdown', values:
                    ['answer_them','answer_he','answer_she','answer_the_person']}, 
             {field:'q2', type:'dropdown', values:
                    ['answer_save', 'answer_warn', 'answer_phone', 'answer_leave', 'answer_put_out']}, 
             {field:'q3', type:'dropdown', values:
                    ['answer_friends', 'answer_boss', 'answer_linus', 'answer_team']}].concat(app.taskApi.okcancel()), 
            async (inst, ctx) => {
               if(inst.response.cancel) return 'OK';
               if(inst.response.q1 != 'answer_the_person') return 'RETRY';
               if(inst.response.q2 != 'answer_save') return 'RETRY';
               if(inst.response.q3 != 'answer_boss') return 'RETRY';
               
               var user = await app.userApi.userId(ctx);

               await app.roleApi.addRole(user, 'done_staff_test', 1000);
               await app.roleApi.addAchievement(user, 'done_staff_test');
               return 'OK';
            });

    //Create area - Driv ett område, såsom ett rum, en arbetsuppgift, eller löpande aktivitet.
    //Create schedule event - Schemalägg en aktivitet i ett område, exempelvis en tävling eller en föreläsning
    //Create shop - Sälj saker på eventet
    //Work - Jobba i ett område.

    //Base task for working at Kodachicon
    app.taskApi.create_task('activity', 'join_staff', 
            ['user'], [],
            app.taskApi.okcancel().concat({event_task:true}, [{field:'work_type', type:'dropdown', values:['create_area', 'create_schedule_event', 'create_shop', 'work']}]),
            async (inst) => {
                if(inst.response.cancel) return 'OK';
                if(!app.userApi.isTested()) inst.next_tasks.push('staff_test');
                switch(inst.response.work_type){
                    case 'create_area':
                        inst.next_tasks.push('create_area');
                        return 'OK';
                    case 'create_schedule_event':
                        inst.next_tasks.push('create_schedule_event');
                        return 'OK';
                    case 'create_shop':
                        inst.next_tasks.push('pick_shop_type');
                        return 'OK';
                    case 'work':
                        inst.next_tasks.push('join_work');
                        return 'OK';
                    default:
                        return 'FAIL';
                }
            });


    function f(field, type, values){
        return {field:field, type:type || 'text', values:values};
    }

    app.taskApi.create_task('activity', 'create_area', 
            [], [],
            app.taskApi.okcancel().concat([f('area_name'), f('area_description'), f('area_staff_count', 'number'), f('area_req_budget', 'number'), f('area_activity_days', 'checkbox', ['wednesday', 'thursday', 'friday', 'saturday', 'sunday']), f('area_opening_hours', 'hours')]),
            async (inst) => {
                inst.data.area_name = inst.response.area_name;
                inst.data.area_description = inst.response.area_description;
                inst.data.area_staff_count = inst.response.area_staff_count;
                inst.data.area_req_budget = inst.response.area_req_budget;
                inst.data.area_activity_days = inst.response.area_activity_days;
                inst.data.area_opening_hours = inst.response.area_opening_hours;
                if(inst.response.ok)
                    inst.next_tasks.push('accept_area');
                return 'OK';
            }, async (inst) => {
                if(inst.data.denied) {
                    delete inst.data.denied;
                    return 'RETRY';
                }
                return 'OK';
            });

    function createArea(inst){
        //Note: add achievement points
    }
    function updateSchedule(inst){
    }
    function updateBudget(inst){
    }

    app.taskApi.create_task('', 'accept_area', [], ['event_admin'], app.taskApi.yesno().concat(f('comments', 'textbox')), async(inst, ctx) => {
                if(inst.response.yes){
                    updateSchedule(inst);
                    updateBudget(inst);
                    createArea(inst);
                    app.taskApi.start_task(ctx, 'manage_area', [], inst.origin);
                } else {
                    inst.data.denied = true;
                    return 'OK';
                }
            });
}
