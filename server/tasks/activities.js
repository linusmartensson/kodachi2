
module.exports = async (app) => {

    app.taskApi.create_task('activity', 'email_team', ['manager.', 'team_member.'], [],
        app.taskApi.okcancel().concat({event_task:true, hide:true}
        ,{field:'email_topic', type:'text'}
        ,{field:'email_text', type:'text'}
        ),
        async (inst, ctx) => {
            if(inst.response.cancel) return 'OK';
            
            var team = await app.cypher('MATCH (:User {id:{user}})-[:TEAM_MEMBER]-(w:WorkGroup {id:{team}})-[:TEAM_MEMBER]-(u:User) RETURN w,u', {user: inst.origin, team:inst.data.start_data.id});
            if(!team.records || team.records.length() < 1){
                return 'FAIL';
            }

            for(var v in team.records){
                var u = team.records[v].get('u').properties;

                await app.userApi.emailUser(u.id, inst.response.email_topic, inst.response.email_text, inst.response.email_text);
            }

            return 'OK';


        }, async(inst, ctx) => {return 'OK'});


    app.taskApi.create_task('activity', 'staff_test', ['user', '!done_staff_test'], [],
        [{unique:true, field:'stafftest_q1', type:'dropdown', values:
            ['{stafftest.answer_them}','{stafftest.answer_he}','{stafftest.answer_she}','{stafftest.answer_the_person}']}, 
            {field:'stafftest_q2', type:'dropdown', values:
                ['{stafftest.answer_save}', '{stafftest.answer_warn}', '{stafftest.answer_phone}', '{stafftest.answer_leave}', '{stafftest.answer_put_out}']}, 
            {field:'stafftest_q3', type:'dropdown', values:
                ['{stafftest.answer_friends}', '{stafftest.answer_boss}', '{stafftest.answer_linus}', '{stafftest.answer_team}']}].concat(app.taskApi.okcancel()), 
        async (inst, ctx) => {
            if(inst.response.cancel) return 'OK';


            if(inst.response.stafftest_q1 != '{stafftest.answer_the_person}') {
                inst.error = "{stafftest.error.the_person}";
                return 'RETRY';
            }
            if(inst.response.stafftest_q2 != '{stafftest.answer_save}'){
                inst.error = "{stafftest.error.save}";
                return 'RETRY';
            }
            if(inst.response.stafftest_q3 != '{stafftest.answer_boss}') {
                inst.error = "{stafftest.error.the_boss}";
                return 'RETRY';
            }


            var user = await app.userApi.userId(ctx);

            await app.roleApi.addRole(user, 'user', 1500);
            await app.roleApi.addRole(user, 'done_staff_test', 1000);
            await app.roleApi.addAchievement(user, 'done_staff_test', 10, app.userApi.getActiveEvent(ctx));

            inst.next_tasks.push('join_staff');
            return 'OK';
        }, async (inst) => {return 'OK'});

    app.taskApi.create_task('activity', 'join_staff', 
        ['done_staff_test'], [],
        app.taskApi.okcancel().concat({event_task:true}, [{translate:true, field:'work_type', type:'dropdown', values:['create_team', 'create_activity', 'create_shop', 'work']}]),
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
            {field:'team', type:'dropdown', prepare:async (v, ctx, task) => {
                var w = (await app.cypher('MATCH (:Event {id:{eventId}})<-[:PART_OF]-(a) WITH a, SIZE((a)<-[:TEAM_MEMBER]-(:User)) AS member_count WHERE member_count < toInt(a.size) RETURN a, member_count', {eventId:task.data.start_data.event_id})).records;
                v.values = [];
                for(var r of w){
                    var team = r.get('a').properties;
                    v.values.push({label:team.name, id:team.id, desc:team.desc});
                }
            }},
            {field:'app_description', type:'editor'},
            {field:'sleep_at_event', type:'bool'},
            {field:'can_work_wednesday', type:'bool'},
            {field:'can_cleanup_sunday', type:'bool'},

            {field:'tshirt', type:'dropdown', values:['S','M','L','XL','XXL']}
        ), async(inst, ctx) => {

            inst.data.application = inst.response;
            inst.data.user = await app.userApi.getUser(await app.userApi.userId(ctx));
            delete inst.data.user.password;

            inst.next_tasks.push({'handlers': [
                'manager.'+inst.response.team, 'admin.'+inst.data.start_data.event_id,
            ], task:'review_team_application'});

            return 'OK';
        }, async(inst) => {
            return 'OK';
        });

    app.taskApi.create_task('activity','review_team_application',[],[],app.taskApi.yesno().concat({event_task:true}),
        async (inst) => {
            if(inst.response.no){
                app.userApi.emailUser(inst.origin, '{email.app_denied.subject}','{email.app_denied.text}','{email.app_denied.text.html}');
                return 'OK';
            }
            await app.userApi.emailUser(inst.origin, '{email.app_accepted.subject}','{email.app_accepted.text}','{email.app_accepted.text.html}');
            await app.roleApi.addRole('team_member.'+inst.data.start_data.event_id, 5000);
            await app.roleApi.addRole('team_member.'+inst.data.application.team);

            var q = inst.data.application;
            q.id = inst.origin;
            q.team = inst.data.team;

            await app.cypher('MATCH (u:User {id:{id}}), (t:WorkGroup {id:{team}}) CREATE (u)-[:TEAM_MEMBER {sleep:{sleep_at_event}, wednesday:{can_work_wednesday}, sunday:{can_cleanup_sunday}, tshirt:{tshirt}, description:{app_description}}]->(t)', q);
            return 'OK';
        }, async(inst) => {
            return 'OK';
        });

    app.taskApi.create_task('activity', 'self_application', [], [], [
            {event_task:true},
            {field:'ok', type:'button'},
            {field:'sleep_at_event', type:'bool'},
            {field:'can_work_wednesday', type:'bool'},
            {field:'can_cleanup_sunday', type:'bool'},
            {field:'tshirt', type:'dropdown', values:['S','M','L','XL','XXL']}
        ], async(inst, ctx) => {
            var q = inst.response;
            q.id = inst.origin;
            q.team = inst.data.application.team || inst.data.application.activity || inst.data.application.shop;

            await app.cypher('MATCH (u:User {id:{id}}), (t:WorkGroup {id:{team}}) CREATE (u)-[:TEAM_MEMBER {sleep:{sleep_at_event}, wednesday:{can_work_wednesday}, sunday:{can_cleanup_sunday}, tshirt:{tshirt}}]->(t)', q);
            
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
            {field:'team_schedule', type:'staticselect', translate:true, values:['wed','thu','fri','sat','sun']},
            //early: 06-08, morning: 08-10, day: 10-14, afternoon: 14-18, evening: 18-23, night:23-03, until_sunrise:03-06
            {field:'team_open', type:'staticselect', translate:true, values:['early', 'morning', 'day', 'afternoon', 'evening', 'night', 'until_sunrise']},
            {field:'team_budget', type:'number'},
            {field:'team_needs_uniform', type:'bool'}
        ),
        async (inst, ctx) => {
            if(inst.response.cancel){
                return 'OK';
            }
            if(app.taskApi.emptyFields(inst)) return 'RETRY';
            var q = {};
            q.type = 'team';
            q.name = inst.response.team_name;
            q.desc = inst.response.team_description;
            q.size = inst.response.team_size;
            q.image = inst.response.team_image;
            q.image = await app.utils.upload(q.image);
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
            {field:'act_format', type:'dropdown', values:['competition', 'activity']},
            {field:'act_description', type:'editor'},
            {field:'act_size', type:'number'},
            {field:'act_image', type:'image'},
            {field:'act_available_days', type:'staticselect', translate:true, values:['wed','thu','fri','sat','sun']},
            //early: 06-08, morning: 08-10, day: 10-14, afternoon: 14-18, evening: 18-23, night:23-03, until_sunrise:03-06
            {field:'act_available_times', type:'staticselect', translate: true, values:['early', 'morning', 'day', 'afternoon', 'evening', 'night', 'until_sunrise']},
            {field:'act_length', type:'dropdown', translate:true, values:['short', 'medium', 'long', 'half_day', 'day']},
            {field:'act_budget', type:'number'},
            {field:'act_participants', type:'number'},
            {field:'act_needs_uniform', type:'bool'}
        ),
        async (inst, ctx) => {
            if(inst.response.cancel){
                return 'OK';
            }
            if(app.taskApi.emptyFields(inst)) return 'RETRY';
            var q = {};
            q.type = inst.response.act_format;
            q.name = inst.response.act_name;
            q.desc = inst.response.act_description;
            q.size = inst.response.act_size;
            q.image = inst.response.act_image;
            q.image = await app.utils.upload(q.image);
            q.schedule = inst.response.act_available_days;
            q.avail_times = inst.response.act_available_times;
            q.length = inst.response.act_length;
            q.budget = inst.response.act_budget;
            q.participants = inst.response.act_participants;
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
            {field:'shop_size', type:'number'}, //How many working?
            {field:'shop_image', type:'image'},
            {field:'shop_tables', type:'number'}, //How large?
            {field:'shop_available_days', type:'staticselect', translate:true, values:['thu','fri','sat','sun']}
        ),
        async (inst, ctx) => {
            if(inst.response.cancel){
                return 'OK';
            }
            if(app.taskApi.emptyFields(inst)) return 'RETRY';
            var q = {};
            q.type = inst.response.shop_type;
            q.name = inst.response.shop_name;
            q.desc = inst.response.shop_description;
            q.size = inst.response.shop_size;
            q.image = inst.response.shop_image;
            q.image = await app.utils.upload(q.image);
            q.tables = inst.response.shop_tables;
            q.schedule = inst.response.shop_available_days;
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
                app.userApi.emailUser(inst.origin, '{email.app_denied.subject}','{email.app_denied.text}','{email.app_denied.text.html}');
                return 'OK';
            }
            await app.userApi.emailUser(inst.origin, '{email.app_accepted.subject}','{email.app_accepted.text}','{email.app_accepted.text.html}');
            var q = inst.data.application;
            var team = app.uuid();
            q.team = team;
            q.event_id = inst.data.start_data.event_id;
            q.teamRole = 'manager.'+team;

            await app.roleApi.addRole(inst.origin, 'manager.'+q.event_id, 4500);
            await app.roleApi.addRole(inst.origin, 'team_leader', 5500);
            await app.roleApi.addRole(inst.origin, q.teamRole);
            await app.roleApi.addRole(inst.origin, 'receipt_submitter.'+q.event_id);
            await app.cypher("MATCH (r:Role {type:{teamRole}}), (e:Event {id:{event_id}}) MERGE (r)<-[:MANAGED_BY]-(s:WorkGroup {id:{team}, type:{type} ,name:{name}, desc:{desc}, size:{size}, image:{image}, schedule:{schedule}, open:{open}, budget:{budget}, uniform:{uniform}})-[:PART_OF]->(e)", q);

            inst.next_tasks.push('accept_application');
            inst.next_tasks.push('self_application');
            inst.next_tasks.push('assign_location');
            return 'OK';
        }, async (inst) => {
            return 'OK';
        });

    app.taskApi.create_task('activity', 'review_activity', [], ['admin.', 'overseer.', 'activity_admin.'],
        app.taskApi.yesno().concat({event_task:true}),
        async (inst, ctx) => {
            if(inst.response.no){
                inst.next_tasks.push('deny_application');
                app.userApi.emailUser(inst.origin, '{email.app_denied.subject}','{email.app_denied.text}','{email.app_denied.text.html}');
                return 'OK';
            }
            await app.userApi.emailUser(inst.origin, '{email.app_accepted.subject}','{email.app_accepted.text}','{email.app_accepted.text.html}');
            var q = inst.data.application;
            var activity = app.uuid();
            q.event_id = inst.data.start_data.event_id;
            q.activity = activity;
            q.activityRole = 'manager.'+activity;
            await app.roleApi.addRole(inst.origin, 'manager.'+q.event_id, 3500);
            await app.roleApi.addRole(inst.origin, 'activiteer', 5500);

            await app.roleApi.addRole(inst.origin, q.activityRole);
            await app.roleApi.addRole(inst.origin, 'receipt_submitter.'+q.event_id);
            if(q.type === 'competition'){
                await app.roleApi.addRole(inst.origin, 'competition_manager.'+q.event_id);
            }
            await app.cypher("MATCH (r:Role {type:{activityRole}}), (e:Event {id:{event_id}}) MERGE (r)<-[:MANAGED_BY]-(s:WorkGroup {id:{activity}, name:{name}, type:{type}, desc:{desc}, size:{size}, image:{image}, schedule:{schedule}, avail_times:{avail_times}, length:{length}, budget:{budget}, uniform:{uniform}, participants:{participants}})-[:PART_OF]->(e)", q);


            inst.next_tasks.push('accept_application');
            inst.next_tasks.push('self_application');
            inst.next_tasks.push('schedule_activity');
            return 'OK';
        }, async (inst) => {
            return 'OK';
        });

    app.taskApi.create_task('activity', 'report_competition_result', ['competition_manager.'], [], 
        app.taskApi.okcancel().concat(
            {event_task:true}, 
            {field:'competition', type:'dropdown', prepare:async(v, ctx, task) => {
                var w = (await app.cypher('MATCH (:Event {id:{evt}})--(w:WorkGroup {type:"competition"})-[:MANAGED_BY]-(r:Role)-[:HAS_ROLE]-(u:User {id:{id}}) RETURN w', {evt:task.data.start_data.event_id,id:await app.userApi.userId(ctx)})).records;
                v.values = [];
                for(var r of w){
                    var team = r.get('w').properties;
                    v.values.push({label:team.name, id:team.id});
                }
            }},
            {field:'category', type:'text'}, 
            {field:'user', type:'dropdown', prepare:async(v, ctx, task) => {
                var w = (await app.cypher('MATCH (u:User) RETURN u')).records;
                v.values = [];
                for(var r of w){
                    var team = r.get('u').properties;
                    v.values.push({label:team.nickname, id:team.id});
                }
            }}
        ),
        async (inst) => {
            var q = inst.response;
            await app.cypher("MATCH (w:WorkGroup {id:{competition}}), (u:User {id:{user}}) CREATE (w)<-[:WINNER {category:{category}}]-(u)", {competition:q.competition.id, category:q.category, user:q.user.id});
            return 'OK';
        }, async(inst) => {
            return 'OK';
        });


    //For now, offline tasks?
    app.taskApi.create_task('activity', 'assign_location', [], ['admin.', 'overseer.', 'team_admin.'], 
        [{event_task:true}, {field:'ok', type:'button'}],
        async (inst) => {
            return 'OK';
        }, async(inst) => {
            return 'OK';
        });
    app.taskApi.create_task('activity', 'schedule_activity', [], ['admin.', 'overseer.', 'activity_admin.'], 
        [{event_task:true}, {field:'ok', type:'button'}],
        async (inst) => {
            return 'OK';
        }, async(inst) => {
            return 'OK';
        });

    app.taskApi.create_task('activity', 'review_vendor', [], ['admin.', 'overseer.', 'vendor_admin.'],
        app.taskApi.yesno().concat({event_task:true}),
        async (inst, ctx) => {
            if(inst.response.no){
                inst.next_tasks.push('deny_application');
                app.userApi.emailUser(inst.origin, '{email.app_denied.subject}','{email.app_denied.text}','{email.app_denied.text.html}');
                return 'OK';
            }
            await app.userApi.emailUser(inst.origin, '{email.app_accepted.subject}','{email.app_accepted.text}','{email.app_accepted.text.html}');
            var q = inst.data.application;
            var shop = app.uuid();
            q.shop = shop;
            q.event_id = inst.data.start_data.event_id;
            q.shopRole = 'manager.'+shop;
            await app.roleApi.addRole(inst.origin, 'manager.'+q.event_id, 1500);
            await app.roleApi.addRole(inst.origin, 'vendor', 5500);
            await app.roleApi.addRole(inst.origin, q.shopRole);
            await app.roleApi.addRole(inst.origin, 'receipt_submitter.'+q.event_id);
            await app.cypher("MATCH (r:Role {type:{shopRole}}), (e:Event {id:{event_id}}) MERGE (r)<-[:MANAGED_BY]-(s:WorkGroup {id:{shop}, name:{name}, desc:{desc}, size:{size}, image:{image}, schedule:{schedule}, tables:{tables}, type:{type}})-[:PART_OF]->(e)", q);

            inst.next_tasks.push('accept_application');
            inst.next_tasks.push('self_application');
            return 'OK';
        }, async (inst) => {
            return 'OK';
        });


    app.taskApi.create_task('activity', 'review_artist_alley', [], ['admin.', 'overseer.', 'artist_alley_admin.'],
        app.taskApi.yesno().concat({event_task:true}),
        async (inst, ctx) => {
            if(inst.response.no){
                inst.next_tasks.push('deny_application');
                app.userApi.emailUser(inst.origin, '{email.app_denied.subject}','{email.app_denied.text}','{email.app_denied.text.html}');
                return 'OK';
            }
            await app.userApi.emailUser(inst.origin, '{email.app_accepted.subject}','{email.app_accepted.text}','{email.app_accepted.text.html}');
            
            var q = inst.data.application;
            var shop = app.uuid();
            q.shop = shop;
            q.event_id = inst.data.start_data.event_id;
            q.shopRole = 'manager.'+shop;
            await app.roleApi.addRole(inst.origin, 'manager.'+q.event_id, 1500);
            await app.roleApi.addRole(inst.origin, 'artist', 5500);

            await app.roleApi.addRole(inst.origin, q.shopRole);
            await app.roleApi.addRole(inst.origin, 'receipt_submitter.'+q.event_id);
            await app.cypher("MATCH (r:Role {type:{shopRole}}), (e:Event {id:{event_id}}) MERGE (r)<-[:MANAGED_BY]-(s:WorkGroup {id:{shop}, name:{name}, desc:{desc}, size:{size}, image:{image}, schedule:{schedule}, type:{type}})-[:PART_OF]->(e)", q);

            inst.next_tasks.push('accept_application');
            inst.next_tasks.push('self_application');
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

    app.taskApi.create_task('activity', 'join_competition', ['visitor.', 'team_member.', 'admin.', 'overseer.'], [],
        app.taskApi.okcancel().concat({event_task:true}, 
            {field:'which_activity', type:'dropdown', prepare:async(v, ctx, task) => {
                var w = (await app.cypher('MATCH (:Event {id:{event}})--(w:WorkGroup {type:"competition"}), (u:User {id:{id}}) WITH w,u,SIZE((w)<-[:COMPETING_IN]-(:User)) as competitors WHERE NOT (w)<-[:COMPETING_IN]-(u) AND toInt(competitors) < toInt(w.participants) RETURN w,competitors', {event:task.data.start_data.event_id, id:await app.userApi.userId(ctx)})).records;
                v.values = [];
                for(var r of w){
                    var team = r.get('w').properties;
                    v.values.push({label:team.name+" ("+r.get('competitors')+"/"+team.participants+")", id:team.id});
                }
            }},
            ),
        async (inst, ctx) => {
            if(inst.response.cancel) return 'OK';
            if(!inst.response.which_activity) return 'OK';

            var w = inst.response.which_activity;

            var role = await app.cypher('MATCH (r:Role)<-[:MANAGED_BY]-(w:WorkGroup {id:{activity}}), (u:User {id:{user}}) CREATE (w)<-[:COMPETING_IN]-(u) RETURN r,w', {activity:w.id, user:await app.userApi.userId(ctx)});
            inst.data.competition = role.records[0].get('w').properties;


            var role = role.records[0].get('r').properties.type;
            
            inst.next_tasks.push({handlers: [
                role, 'overseer.'+inst.data.start_data.event_id
            ], task:'new_competitor'});





            return 'OK';
        }, async (inst) => {
            return 'OK';
        });

    app.taskApi.create_task('activity', 'new_competitor', [], [],
        [{event_task:true}, {field:'ok', type:'button'}],
        async (inst, ctx) => {
            return 'OK';
        }, async (inst) => {
            return 'OK';
        });
}
