
module.exports = async (app) => {

    app.taskApi.step('staff_test', 
            [{field:'q1', desc:'staff_question_identity', type:'dropdown', values:
                    ['answer_them','answer_he','answer_she','answer_the_person']}, 
             {field:'q2', desc:'staff_question_fire', type:'dropdown', values:
                    ['answer_save', 'answer_warn', 'answer_phone', 'answer_leave', 'answer_put_out']}, 
             {field:'q3', desc:'staff_question_responsibility', type:'dropdown', values:
                    ['answer_friends', 'answer_boss', 'answer_linus', 'answer_team']}].concat(app.taskApi.okcancel()), 
            async (inst) => {
               if(inst.response.cancel) return 'OK';
               if(inst.response.q1 != 'answer_the_person') return 'RETRY';
               if(inst.response.q2 != 'answer_save') return 'RETRY';
               if(inst.response.q3 != 'answer_boss') return 'RETRY';
               app.userApi.markTested();
               return 'OK';
            });

    //Create area - Driv ett område, såsom ett rum, en arbetsuppgift, eller löpande aktivitet.
    //Create schedule event - Schemalägg en aktivitet i ett område, exempelvis en tävling eller en föreläsning
    //Create shop - Sälj saker på eventet
    //Work - Jobba i ett område.

    //Base task for working at Kodachicon
    app.taskApi.create_task('activity', 'join_staff', 
            ['user'], [],
            app.taskApi.okcancel().concat([{field:'work_type', desc:'work_type_field', type:'dropdown', values:['create_area', 'create_schedule_event', 'create_shop', 'work']}]),
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


    function f(field, desc, type, values){
        return {field:field, desc:desc, type:type || 'text', values:values};
    }

    app.taskApi.create_task('activity', 'create_area', 
            [], [],
            app.taskApi.okcancel().concat([f('name', 'area_name_field'), f('desc', 'area_description_field'), f('staff_count', 'staff_count_field', 'number'), f('budget', 'budget_field', 'number'), f('activity_days', 'activity_days_field', 'checkbox', ['wednesday', 'thursday', 'friday', 'saturday', 'sunday']), f('opening_hours', 'opening_hours_field', 'hours')]),
            async (inst) => {
                inst.data.name = inst.response.name;
                inst.data.desc = inst.response.desc;
                inst.data.staff_count = inst.response.staff_count;
                inst.data.budget = inst.response.budget;
                inst.data.activity_days = inst.response.activity_days;
                inst.data.opening_hours = inst.response.opening_hours;
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

    app.taskApi.create_task('', 'accept_area', [], ['event_admin'], app.taskApi.yesno().concat(f('comments', 'comments_field', 'textbox')), async(inst) => {
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
