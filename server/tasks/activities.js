
module.exports = async (app) => {

    app.taskApi.create_task('activity', 'staff_test', ['user', '!done_staff_test'], [],
        [{unique:true, field:'stafftest_q1', type:'dropdown', values:
            ['{stafftest.answer_them}','{stafftest.answer_he}','{stafftest.answer_she}','{stafftest.answer_the_person}']}, 
            {field:'stafftest_q2', type:'dropdown', values:
                ['{stafftest.answer_save}', '{stafftest.answer_warn}', '{stafftest.answer_phone}', '{stafftest.answer_leave}', '{stafftest.answer_put_out}']}, 
            {field:'stafftest_q3', type:'dropdown', values:
                ['{stafftest.answer_friends}', '{stafftest.answer_boss}', '{stafftest.answer_linus}', '{stafftest.answer_team}']}].concat(app.taskApi.okcancel()), 
        async (inst, ctx) => {
            if(inst.response.cancel) return 'OK';


            if(inst.response.stafftest_q1 != '{stafftest.answer_the_person}') return 'RETRY';
            if(inst.response.stafftest_q2 != '{stafftest.answer_save}') return 'RETRY';
            if(inst.response.stafftest_q3 != '{stafftest.answer_boss}') return 'RETRY';


            var user = await app.userApi.userId(ctx);

            await app.roleApi.addRole(user, 'done_staff_test', 1000);
            await app.roleApi.addAchievement(user, 'done_staff_test');

            inst.next_tasks.push('join_staff');
            return 'OK';
        }, async (inst) => {return 'OK'});

    app.taskApi.create_task('activity', 'join_staff', 
        ['done_staff_test'], [],
        app.taskApi.okcancel().concat({event_task:true, unique:true}, [{translate:true, field:'work_type', type:'dropdown', values:['create_team', 'create_activity', 'create_shop', 'work']}]),
        async (inst, ctx) => {
            if(inst.response.cancel){
                return 'OK';
            }
            inst.data.submitter = await app.userApi.userId(ctx);
            switch(inst.response.work_type){
                case 'create_team':
                    inst.next_tasks.push('create_team');
                    return 'OK';
                case 'create_activity':
                    inst.next_tasks.push('create_activity');
                    return 'OK';
                case 'create_shop':
                    inst.next_tasks.push('create_shop');
                    return 'OK';
                case 'work':
                    inst.next_tasks.push('join_work');
                    return 'OK';
                default:
                    return 'FAIL';
            }
        }, async (inst) => {
            return 'OK';
        });

    app.taskApi.create_task('activity', 'create_team', 
        [], [],
        app.taskApi.okcancel().concat(
            {field:'team_name', type:'text'},
            {field:'team_description', type:'editor'},
            {field:'team_size', type:'number'},
            {field:'team_image', type:'image'},
            {field:'team_schedule', type:'select', translate:true, values:['wed','thu','fri','sat','sun']},
            //early: 06-08, morning: 08-10, day: 10-14, afternoon: 14-18, evening: 18-23, night:23-03, until_sunrise:03-06
            {field:'team_open', type:'select', translate:true, values:['early', 'morning', 'day', 'afternoon', 'evening', 'night', 'until_sunrise']},
            {field:'team_budget', type:'number'},
            {field:'team_needs_uniform', type:'bool'}
        ),
        async (inst, ctx) => {
            if(inst.response.cancel){
                return 'OK';
            }
            var q = {};
            q.type = 'team';
            q.name = inst.response.team_name;
            q.desc = inst.response.team_description;
            q.size = inst.response.team_size;
            q.image = inst.response.team_image;
            q.schedule = inst.response.team_schedule;
            q.open = inst.response.team_open;
            q.budget = inst.response.team_budget;
            q.uniform = inst.response.team_needs_uniform;
            inst.data.application = q;
            inst.next_task.push('review_application');
        }, async (inst) => {
            return 'OK';
        });
    app.taskApi.create_task('activity', 'create_activity', 
        [], [],
        app.taskApi.okcancel().concat(
            {field:'act_name', type:'text'},
            {field:'act_description', type:'editor'},
            {field:'act_size', type:'number'},
            {field:'act_image', type:'image'},
            {field:'act_available_days', type:'staticselect', translate:true, values:['wed','thu','fri','sat','sun']},
            //early: 06-08, morning: 08-10, day: 10-14, afternoon: 14-18, evening: 18-23, night:23-03, until_sunrise:03-06
            {field:'act_available_times', type:'staticselect', translate: true, values:['early', 'morning', 'day', 'afternoon', 'evening', 'night', 'until_sunrise']},
            {field:'act_length', type:'dropdown', translate:true, values:['short', 'medium', 'long', 'half_day', 'day']},
            {field:'act_budget', type:'number'},
            {field:'act_needs_uniform', type:'bool'}
        ),
        async (inst, ctx) => {
            if(inst.response.cancel){
                return 'OK';
            }
            var q = {};
            q.type = 'activity';
            q.name = inst.response.act_name;
            q.desc = inst.response.act_description;
            q.size = inst.response.act_size;
            q.image = inst.response.act_image;
            q.avail_days = inst.response.act_available_days;
            q.avail_times = inst.response.act_available_times;
            q.length = inst.response.act_length;
            q.budget = inst.response.act_budget;
            q.uniform = inst.response.act_needs_uniform;
            inst.data.application = q;
            inst.next_task.push('review_application');
            inst.next_task.push('review_schedule');
            inst.next_task.push('review_budget');
        }, async (inst) => {
            return 'OK';
        });

    app.taskApi.create_task('activity', 'review_application', [], ['admin.', 'overseer.'],
        app.taskApi.yesno().concat(),
        async (inst, ctx) => {

        }, async (inst) => {

        });


}
