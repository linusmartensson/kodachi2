
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

    app.taskApi.create_task('activity', 'join_work', [], [], 
        app.taskApi.okcancel().concat({event_task:true},
            {field:'team', type:'dropdown', prepare:async (v, ctx) => {
            
            }}
        ), async(inst, ctx) => {
            return 'OK';
        }, async(inst) => {
            return 'OK';
        });



    app.taskApi.create_task('activity', 'create_team', 
        [], [],
        app.taskApi.okcancel().concat({event_task:true},
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
            inst.next_tasks.push('review_team');
            return 'OK';
        }, async (inst) => {
            return 'OK';
        });
    app.taskApi.create_task('activity', 'create_activity', 
        [], [],
        app.taskApi.okcancel().concat({event_task:true},
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
            inst.next_tasks.push('review_activity');
            return 'OK';
        }, async (inst) => {
            return 'OK';
        });
    app.taskApi.create_task('activity', 'create_shop', 
        [], [],
        app.taskApi.okcancel().concat({event_task:true},
            {field:'shop_type', type:'dropdown', values:['artist_alley','vendor']},
            {field:'shop_name', type:'text'},
            {field:'shop_description', type:'editor'},
            {field:'shop_size', type:'number'},
            {field:'shop_image', type:'image'},
            {field:'shop_available_days', type:'staticselect', translate:true, values:['thu','fri','sat','sun']}
        ),
        async (inst, ctx) => {
            if(inst.response.cancel){
                return 'OK';
            }
            var q = {};
            q.type = inst.response.shop_type;
            q.name = inst.response.shop_name;
            q.desc = inst.response.shop_description;
            q.size = inst.response.shop_size;
            q.image = inst.response.shop_image;
            q.avail_days = inst.response.shop_available_days;
            inst.data.application = q;
            if(q.type == 'artist_alley')
                inst.next_tasks.push('review_artist_alley');
            else
                inst.next_tasks.push('review_vendor');
            return 'OK';
        }, async (inst) => {
            return 'OK';
        });

    app.taskApi.create_task('activity', 'review_team', [], ['admin.', 'overseer.', 'team_admin.'],
        app.taskApi.yesno().concat({event_task:true}),
        async (inst, ctx) => {
            if(inst.response.no){
                inst.next_tasks.push('deny_application');
                return 'OK';
            }

            /*var q = {};
            q.type = 'team';
            q.name = inst.response.team_name;
            q.desc = inst.response.team_description;
            q.size = inst.response.team_size;
            q.image = inst.response.team_image;
            q.schedule = inst.response.team_schedule;
            q.open = inst.response.team_open;
            q.budget = inst.response.team_budget;
            q.uniform = inst.response.team_needs_uniform;*/

            inst.data.application = q;
            inst.next_tasks.push('review_team');

            var q = inst.data.application;
            var team = app.uuid();
            q.team = team;
            q.teamRole = 'team_manager.'+team;
            q.event_id = inst.data.start_data.event_id;
            await app.roleApi.addRole(inst.origin, q.teamRole);
            await app.cypher("MATCH (r:Role {type:{teamRole}}), (e:Event, {id:{event_id}}) MERGE (r)<-[:MANAGED_BY]-(s:Team {id:{team}, name:{name}, desc:{desc}, size:{size}, image:{image}, schedule:{schedule}, open:{open}, budget:{budget}, uniform:{uniform}})-[:PART_OF]->(e)", q);




            inst.next_tasks.push('accept_application');
            return 'OK';
        }, async (inst) => {
            return 'OK';
        });

    app.taskApi.create_task('activity', 'review_activity', [], ['admin.', 'overseer.', 'activity_admin.'],
        app.taskApi.yesno().concat({event_task:true}),
        async (inst, ctx) => {
            if(inst.response.no){
                inst.next_tasks.push('deny_application');
                return 'OK';
            }
/*
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
            */
            var q = inst.data.application;
            var activity = app.uuid();
            q.activity = activity;
            q.activityRole = 'activity_manager.'+activity;
            q.event_id = inst.data.start_data.event_id;
            await app.roleApi.addRole(inst.origin, q.activityRole);
            await app.cypher("MATCH (r:Role {type:{activityRole}}), (e:Event, {id:{event_id}}) MERGE (r)<-[:MANAGED_BY]-(s:Activity {id:{activity}, name:{name}, desc:{desc}, size:{size}, image:{image}, avail_days:{avail_days}, avail_times:{avail_times}, length:{length}, budget:{budget}, uniform:{uniform}})-[:PART_OF]->(e)", q);


            inst.next_tasks.push('accept_application');
            return 'OK';
        }, async (inst) => {
            return 'OK';
        });


    app.taskApi.create_task('activity', 'review_vendor', [], ['admin.', 'overseer.', 'vendor_admin.'],
        app.taskApi.yesno().concat({event_task:true}),
        async (inst, ctx) => {
            if(inst.response.no){
                inst.next_tasks.push('deny_application');
                return 'OK';
            }

            var q = inst.data.application;
            var shop = app.uuid();
            q.shop = shop;
            q.shopRole = 'store_vendor.'+shop;
            q.event_id = inst.data.start_data.event_id;
            await app.roleApi.addRole(inst.origin, q.shopRole);
            await app.cypher("MATCH (r:Role {type:{shopRole}}), (e:Event, {id:{event_id}}) MERGE (r)<-[:MANAGED_BY]-(s:Shop {id:{shop}, name:{name}, desc:{desc}, size:{size}, image:{image}, avail_days:{avail_days}, type:{type}})-[:PART_OF]->(e)", q);

            inst.next_tasks.push('accept_application');
            return 'OK';
        }, async (inst) => {
            return 'OK';
        });


    app.taskApi.create_task('activity', 'review_artist_alley', [], ['admin.', 'overseer.', 'artist_alley_admin.'],
        app.taskApi.yesno().concat({event_task:true}),
        async (inst, ctx) => {
            if(inst.response.no){
                inst.next_tasks.push('deny_application');
                return 'OK';
            }
            
            var q = inst.data.application;
            var shop = app.uuid();
            q.shop = shop;
            q.shopRole = 'artist_alley_vendor.'+shop;
            q.event_id = inst.data.start_data.event_id;
            await app.roleApi.addRole(inst.origin, q.shopRole);
            await app.cypher("MATCH (r:Role {type:{shopRole}}), (e:Event, {id:{event_id}}) MERGE (r)<-[:MANAGED_BY]-(s:Shop {id:{shop}, name:{name}, desc:{desc}, size:{size}, image:{image}, avail_days:{avail_days}, type:{type}})-[:PART_OF]->(e)", q);

            inst.next_tasks.push('accept_application');
            return 'OK';
        }, async (inst) => {
            return 'OK';
        });



    app.taskApi.create_task('activity', 'accept_application', [], [],
        [{event_task:true}, {field:'ok', type:'button'}],
        async (inst, ctx) => {
            return 'OK';
        }, async (inst) => {
            return 'OK';
        });



    app.taskApi.create_task('activity', 'deny_application', [], [],
        [{event_task:true}, {field:'ok', type:'button'}],
        async (inst, ctx) => {
            return 'OK';
        }, async (inst) => {
            return 'OK';
        });


}
