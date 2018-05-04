
module.exports = async (app) => {
    app.taskApi.create_task(
        "activity", "remove_team_member", ["manager."], [],
        app.taskApi.okcancel().concat({event_task: true, hide: true}),
        async (inst, ctx) => {

            const team = await app.cypher("MATCH (u:User {id:{user}})-[:HAS_ROLE]->(:Role)<-[:MANAGED_BY]-(w:WorkGroup {id:{team}}) RETURN w,u", {user: inst.origin, team: inst.data.start_data.team});
            if (!team.records || team.records.length < 1) {
                return "FAIL";
            }

            //Can't delete manager
            const team2 = await app.cypher("MATCH (u:User {id:{user}})-[:HAS_ROLE]->(:Role)<-[:MANAGED_BY]-(w:WorkGroup {id:{team}}) RETURN w,u", {user: inst.data.start_data.user, team: inst.data.start_data.team});
            if (team2.records && team2.records.length > 0) {
                return "FAIL";
            }

            await app.roleApi.removeRole(inst.data.start_data.user, `team_member.${inst.data.start_data.team}`, 3900);
            await app.cypher("MATCH (:User {id:{user}})-[t:TEAM_MEMBER]-(:WorkGroup {id:{team}}) DETACH DELETE t;", {user: inst.data.start_data.user, team: inst.data.start_data.team});

            const q = await app.cypher("MATCH (:User {id:{user}})-[t:TEAM_MEMBER]-(:WorkGroup)--(:Event {id:{event}}) RETURN t;", {user: inst.data.start_data.user, event: inst.data.start_data.event_id});

            if (!q.records || q.records.length === 0) {
                await app.roleApi.removeRole(inst.data.start_data.user, `team_member.${inst.data.start_data.event_id}`, 1);
            }

            return "OK";


        }, async (inst, ctx) => "OK"
    );


    app.taskApi.create_task(
        "activity", "promote_manager", ["manager."], [],
        app.taskApi.okcancel().concat({event_task: true, hide: true}),
        async (inst, ctx) => {

            const team = await app.cypher("MATCH (u:User {id:{user}})-[:HAS_ROLE]->(:Role)<-[:MANAGED_BY]-(w:WorkGroup {id:{team}}) RETURN w,u", {user: inst.origin, team: inst.data.start_data.team});
            if (!team.records || team.records.length < 1) {
                return "FAIL";
            }

            const u = inst.data.start_data.user;
            await app.roleApi.addRole(inst.data.start_data.user, `manager.${inst.data.start_data.team}`, 1000);
            // Only the original manager gets extra points for now

            return "OK";


        }, async (inst, ctx) => "OK"
    );


    app.taskApi.create_task(
        "activity", "demote_manager", ["manager."], [],
        app.taskApi.okcancel().concat({event_task: true, hide: true}),
        async (inst, ctx) => {

            const team = await app.cypher("MATCH (u:User {id:{user}})-[:HAS_ROLE]->(:Role)<-[:MANAGED_BY]-(w:WorkGroup {id:{team}}) RETURN w,u", {user: inst.origin, team: inst.data.start_data.team});
            if (!team.records || team.records.length < 1) {
                return "FAIL";
            }

            if (inst.data.start_data.user === inst.origin) {
                await app.roleApi.addAchievement(inst.origin, "escaping_manager", 1, app.userApi.getActiveEvent(ctx), 1, 0);
            }

            await app.roleApi.removeRole(inst.data.start_data.user, `manager.${inst.data.start_data.team}`, 1000);

            return "OK";


        }, async (inst, ctx) => "OK"
    );


    app.taskApi.create_task(
        "activity", "email_team", ["manager.", "team_member."], [],
        app.taskApi.okcancel().concat(
            {event_task: true, hide: true}
            , {field: "email_topic", type: "text"}
            , {field: "email_text", type: "text"}
        ),
        async (inst, ctx) => {

            const team = await app.cypher("MATCH (u:User), (:User {id:{user}})-[:TEAM_MEMBER]-(w:WorkGroup {id:{team}}) WHERE (w)--(u) RETURN w,u", {user: inst.origin, team: inst.data.start_data.team});
            if (!team.records || team.records.length < 1) {
                return "FAIL";
            }

            for (const v in team.records) {
                const u = team.records[v].get("u").properties;

                await app.userApi.emailUser(u.id, inst.response.email_topic, inst.response.email_text, inst.response.email_text);
            }

            return "OK";


        }, async (inst, ctx) => "OK"
    );


    app.taskApi.create_task(
        "activity", "staff_test", ["user", "!done_staff_test"], [],
        [{event_task: true, unique: true, field: "stafftest_q1", type: "dropdown", values:
            ["{stafftest.answer_them}", "{stafftest.answer_he}", "{stafftest.answer_she}", "{stafftest.answer_the_person}"]},
        {field: "stafftest_q2", type: "dropdown", values:
                ["{stafftest.answer_save}", "{stafftest.answer_warn}", "{stafftest.answer_phone}", "{stafftest.answer_leave}", "{stafftest.answer_put_out}"]},
        {field: "stafftest_q3", type: "dropdown", values:
                ["{stafftest.answer_friends}", "{stafftest.answer_boss}", "{stafftest.answer_linus}", "{stafftest.answer_team}"]}].concat(app.taskApi.okcancel()),
        async (inst, ctx) => {


            if (inst.response.stafftest_q1 !== "{stafftest.answer_the_person}") {
                inst.error = "{stafftest.error.the_person}";
                return "RETRY";
            }
            if (inst.response.stafftest_q2 !== "{stafftest.answer_save}") {
                inst.error = "{stafftest.error.save}";
                return "RETRY";
            }
            if (inst.response.stafftest_q3 !== "{stafftest.answer_boss}") {
                inst.error = "{stafftest.error.the_boss}";
                return "RETRY";
            }


            const user = await app.userApi.userId(ctx);

            await app.roleApi.addRole(user, "user", 550);
            await app.roleApi.addRole(user, "done_staff_test", 1000);
            await app.roleApi.addAchievement(user, "done_staff_test", 1, app.userApi.getActiveEvent(ctx), 1, 20);

            inst.next_tasks.push("join_staff");
            return "OK";
        }, async (inst) => "OK"
    );

    app.taskApi.create_task(
        "activity", "join_staff",
        ["done_staff_test"], [],
        app.taskApi.okcancel().concat({autocancel: true, event_task: true}, [{translate: true, field: "work_type", type: "dropdown", values: ["create_team", "create_activity", "create_shop", "work"]}]),
        async (inst, ctx) => {
            inst.data.user = await app.userApi.getUser(await app.userApi.userId(ctx));
            const teams = await app.cypher("MATCH (:Event {id:{eventId}})<-[:PART_OF]-(w:WorkGroup) RETURN w", {eventId: inst.data.start_data.event_id});
            switch (inst.response.work_type) {
            case "create_team":
                inst.next_tasks.push("create_team");
                return "OK";
            case "create_activity":
                inst.next_tasks.push("create_activity");
                return "OK";
            case "create_shop":
                inst.next_tasks.push("create_shop");
                return "OK";
            case "work":
                if (teams.records.length > 0) {
                    inst.next_tasks.push("join_work");
                } else {
                    inst.next_tasks.push("no_teams_available");
                }
                return "OK";
            default:
                return "FAIL";
            }
        }, async (inst) => "OK"
    );

    app.taskApi.create_task(
        "activity", "no_teams_available", [], [],
        [{field: "ok", type: "button"}], async (inst, ctx) => "OK"
    );

    app.taskApi.create_task(
        "activity", "join_work", [], [],
        app.taskApi.okcancel().concat(
            {event_task: true},
            {field: "team", type: "dropdown", prepare: async (v, ctx, task) => {
                const w = (await app.cypher("MATCH (:Event {id:{eventId}})<-[:PART_OF]-(a) WITH a, SIZE((a)<-[:TEAM_MEMBER]-(:User)) AS member_count WHERE member_count < toInt(a.size) RETURN a, member_count", {eventId: task.data.start_data.event_id})).records;
                v.values = [];
                for (const r of w) {
                    const team = r.get("a").properties;
                    v.values.push({label: team.name, id: team.id, desc: team.desc});
                }
            }},
            {field: "app_description", type: "editor"},
            {field: "sleep_at_event", type: "bool"},
            {field: "can_work_wednesday", type: "bool"},
            {field: "can_cleanup_sunday", type: "bool"},

            {field: "tshirt", type: "dropdown", values: ["S", "M", "L", "XL", "XXL"]}
        ), async (inst, ctx) => {
            if (app.taskApi.emptyFields(inst)) {
                return "RETRY";
            }

            inst.data.application = inst.response;
            delete inst.data.user.password;

            await app.roleApi.addAchievement(inst.origin, "i_wanna_work", 1, app.userApi.getActiveEvent(ctx), 1, 10);
            await app.roleApi.addAchievement(inst.origin, "i_wanna_work_everywhere", 1, app.userApi.getActiveEvent(ctx), 10, 10);
            inst.next_tasks.push({"handlers": [
                `manager.${inst.response.team.id}`
            ], task: "review_team_application"});

            return "OK";
        }, async (inst) => "OK"
    );

    app.taskApi.create_task(
        "activity", "review_team_application", [], [], app.taskApi.yesno().concat({event_task: true}),
        async (inst, ctx) => {
            if (inst.response.no) {
                app.userApi.emailUser(inst.origin, "{email.app_denied.subject}", "{email.app_denied.text}", "{email.app_denied.text.html}");
                return "OK";
            }
            await app.userApi.emailUser(inst.origin, "{email.app_accepted.subject}", "{email.app_accepted.text}", "{email.app_accepted.text.html}");
            await app.roleApi.addRole(inst.origin, `team_member.${inst.data.start_data.event_id}`, 3000);
            await app.roleApi.addRole(inst.origin, `team_member.${inst.data.application.team.id}`);

            const q = inst.data.application;
            q.id = inst.origin;
            q.team = q.team.id;
            await app.roleApi.addAchievement(q.id, "joined_a_team", 1, app.userApi.getActiveEvent(ctx), 1, 10);

            await app.cypher("MATCH (u:User {id:{id}}), (t:WorkGroup {id:{team}}) CREATE (u)-[:TEAM_MEMBER {sleep:{sleep_at_event}, wednesday:{can_work_wednesday}, sunday:{can_cleanup_sunday}, tshirt:{tshirt}, description:{app_description}}]->(t)", q);
            return "OK";
        }, async (inst) => "OK"
    );

    app.taskApi.create_task("activity", "self_application", [], [], [
        {event_task: true},
        {field: "ok", type: "button"},
        {field: "sleep_at_event", type: "bool"},
        {field: "can_work_wednesday", type: "bool"},
        {field: "can_cleanup_sunday", type: "bool"},
        {field: "tshirt", type: "dropdown", values: ["S", "M", "L", "XL", "XXL"]}
    ], async (inst, ctx) => {
        const q = inst.response;
        q.id = inst.origin;
        q.team = inst.data.application.team || inst.data.application.activity || inst.data.application.shop;

        await app.cypher("MATCH (u:User {id:{id}}), (t:WorkGroup {id:{team}}) CREATE (u)-[:TEAM_MEMBER {sleep:{sleep_at_event}, wednesday:{can_work_wednesday}, sunday:{can_cleanup_sunday}, tshirt:{tshirt}}]->(t)", q);
        await app.roleApi.addRole(inst.origin, `team_member.${inst.data.start_data.event_id}`, 3000);
        await app.roleApi.addRole(inst.origin, `team_member.${q.team}`);
        await app.roleApi.addAchievement(q.id, "joined_a_team", 1, app.userApi.getActiveEvent(ctx), 1, 10);

        return "OK";
    }, async (inst) => "OK");

    app.taskApi.create_task(
        "activity", "update_team_desc",
        ["manager."], [],
        app.taskApi.okcancel().concat(
            {event_task: true, hide:true},
            {field: "update_name", type: "text"},
            {field: "update_desc", type: "editor"},
        ),
        async (inst, ctx) => {
            const q = {};
            q.team = inst.data.start_data.team;
            q.name = inst.response.update_name;
            q.desc = inst.response.update_desc;
            q.user = inst.origin;
            await app.cypher("MATCH (s:WorkGroup {id:{team}})-[:MANAGED_BY]-(:Role)-[:HAS_ROLE]-(u:User {id:{user}}) SET s.name = {name}, s.desc = {desc}", q);
            return "OK";
        }, async (inst) => "OK"
    );

    app.taskApi.create_task(
        "activity", "create_team",
        [], [],
        app.taskApi.okcancel().concat(
            {event_task: true},
            {field: "team_name", type: "text"},
            {field: "team_description", type: "editor"},
            {field: "team_size", type: "number"},
            {field: "team_image", type: "image"},
            {field: "team_schedule", type: "staticselect", translate: true, values: ["wed", "thu", "fri", "sat", "sun"]},
            // early: 06-08, morning: 08-10, day: 10-14, afternoon: 14-18, evening: 18-23, night:23-03, until_sunrise:03-06
            {field: "team_open", type: "staticselect", translate: true, values: ["early", "morning", "day", "afternoon", "evening", "night", "until_sunrise"]},
            {field: "team_budget", type: "number"},
            {field: "team_needs_uniform", type: "bool"}
        ),
        async (inst, ctx) => {
            const q = {};
            q.type = "team";
            q.name = inst.response.team_name;
            q.desc = inst.response.team_description;
            q.size = inst.response.team_size;
            q.image = inst.response.team_image;
            q.image = await app.utils.upload(q.image);
            q.schedule = inst.response.team_schedule;
            q.avail_times = inst.response.team_open;
            q.budget = inst.response.team_budget;
            q.uniform = inst.response.team_needs_uniform;
            await app.roleApi.addAchievement(inst.origin, "i_made_the_best_application", 1, app.userApi.getActiveEvent(ctx), 1, 10);
            inst.data.application = q;
            inst.next_tasks.push("review_team");
            return "OK";
        }, async (inst) => "OK"
    );
    app.taskApi.create_task(
        "activity", "create_activity",
        [], [],
        app.taskApi.okcancel().concat(
            {event_task: true},
            {field: "act_name", type: "text"},
            {field: "act_format", type: "dropdown", values: ["competition", "activity"]},
            {field: "act_description", type: "editor"},
            {field: "act_size", type: "number"},
            {field: "act_image", type: "image"},
            {field: "act_available_days", type: "staticselect", translate: true, values: ["wed", "thu", "fri", "sat", "sun"]},
            // early: 06-08, morning: 08-10, day: 10-14, afternoon: 14-18, evening: 18-23, night:23-03, until_sunrise:03-06
            {field: "act_available_times", type: "staticselect", translate: true, values: ["early", "morning", "day", "afternoon", "evening", "night", "until_sunrise"]},
            {field: "act_length", type: "dropdown", translate: true, values: ["short", "medium", "long", "half_day", "day"]},
            {field: "act_budget", type: "number"},
            {field: "act_participants", type: "number"},
            {field: "act_needs_uniform", type: "bool"}
        ),
        async (inst, ctx) => {
            const q = {};
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
            await app.roleApi.addAchievement(inst.origin, "i_made_the_best_application", 1, app.userApi.getActiveEvent(ctx), 1, 10);
            inst.data.application = q;
            inst.next_tasks.push("review_activity");
            return "OK";
        }, async (inst) => "OK"
    );
    app.taskApi.create_task(
        "activity", "create_shop",
        [], [],
        app.taskApi.okcancel().concat(
            {event_task: true},
            {field: "shop_type", type: "dropdown", values: ["artist_alley", "vendor"]},
            {field: "shop_name", type: "text"},
            {field: "shop_description", type: "editor"},
            {field: "shop_size", type: "number"}, // How many working?
            {field: "shop_image", type: "image"},
            {field: "shop_tables", type: "number"}, // How large?
            {field: "shop_available_days", type: "staticselect", translate: true, values: ["thu", "fri", "sat", "sun"]}
        ),
        async (inst, ctx) => {
            const q = {};
            q.type = inst.response.shop_type;
            q.name = inst.response.shop_name;
            q.desc = inst.response.shop_description;
            q.size = inst.response.shop_size;
            q.image = inst.response.shop_image;
            q.image = await app.utils.upload(q.image);
            q.tables = inst.response.shop_tables;
            q.schedule = inst.response.shop_available_days;
            await app.roleApi.addAchievement(inst.origin, "i_made_the_best_application", 1, app.userApi.getActiveEvent(ctx), 1, 10);
            inst.data.application = q;
            if (q.type === "artist_alley") {
                inst.next_tasks.push("review_artist_alley");
            } else {
                inst.next_tasks.push("review_vendor");
            }
            return "OK";
        }, async (inst) => "OK"
    );

    app.taskApi.create_task(
        "activity", "review_team", [], ["admin.", "overseer.", "team_admin."],
        app.taskApi.yesno().concat({event_task: true}),
        async (inst, ctx) => {
            if (inst.response.no) {
                inst.next_tasks.push("deny_application");
                app.userApi.emailUser(inst.origin, "{email.app_denied.subject}", "{email.app_denied.text}", "{email.app_denied.text.html}");
                return "OK";
            }
            await app.userApi.emailUser(inst.origin, "{email.app_accepted.subject}", "{email.app_accepted.text}", "{email.app_accepted.text.html}");
            const q = inst.data.application;
            const team = app.uuid();
            q.team = team;
            q.event_id = inst.data.start_data.event_id || (await app.userApi.getActiveEvent(ctx)).id;
            q.teamRole = `manager.${team}`;

            await app.roleApi.addRole(inst.origin, `manager.${q.event_id}`, 4500);
            await app.roleApi.addRole(inst.origin, "team_leader", 5500);
            await app.roleApi.addRole(inst.origin, q.teamRole);
            await app.roleApi.addRole(inst.origin, `receipt_submitter.${q.event_id}`);
            await app.cypher("MATCH (r:Role {type:{teamRole}}), (e:Event {id:{event_id}}) MERGE (r)<-[:MANAGED_BY]-(s:WorkGroup {id:{team}, type:{type} ,name:{name}, desc:{desc}, size:{size}, image:{image}, schedule:{schedule}, avail_times:{avail_times}, budget:{budget}, uniform:{uniform}})-[:PART_OF]->(e)", q);


            await app.roleApi.addAchievement(inst.origin, "my_very_own_team", 1, app.userApi.getActiveEvent(ctx), 1, 100);
            inst.next_tasks.push("accept_application");
            inst.next_tasks.push("self_application");
            inst.next_tasks.push("assign_location");
            return "OK";
        }, async (inst) => "OK"
    );

    app.taskApi.create_task(
        "activity", "review_activity", [], ["admin.", "overseer.", "activity_admin."],
        app.taskApi.yesno().concat({event_task: true}),
        async (inst, ctx) => {
            if (inst.response.no) {
                inst.next_tasks.push("deny_application");
                app.userApi.emailUser(inst.origin, "{email.app_denied.subject}", "{email.app_denied.text}", "{email.app_denied.text.html}");
                return "OK";
            }
            await app.userApi.emailUser(inst.origin, "{email.app_accepted.subject}", "{email.app_accepted.text}", "{email.app_accepted.text.html}");
            const q = inst.data.application;
            const activity = app.uuid();
            q.event_id = inst.data.start_data.event_id || (await app.userApi.getActiveEvent(ctx)).id;
            q.activity = activity;
            q.activityRole = `manager.${activity}`;
            await app.roleApi.addRole(inst.origin, `manager.${q.event_id}`, 3500);
            await app.roleApi.addRole(inst.origin, "activiteer", 5500);

            await app.roleApi.addRole(inst.origin, q.activityRole);
            await app.roleApi.addRole(inst.origin, `receipt_submitter.${q.event_id}`);
            if (q.type === "competition") {
                await app.roleApi.addRole(inst.origin, `competition_manager.${q.event_id}`);
                await app.roleApi.addAchievement(inst.origin, "judge_jury_exe", 1, app.userApi.getActiveEvent(ctx), 1, 100);
            } else {
                await app.roleApi.addAchievement(inst.origin, "my_activity_best_activity", 1, app.userApi.getActiveEvent(ctx), 1, 100);

            }
            await app.cypher("MATCH (r:Role {type:{activityRole}}), (e:Event {id:{event_id}}) MERGE (r)<-[:MANAGED_BY]-(s:WorkGroup {id:{activity}, name:{name}, type:{type}, desc:{desc}, size:{size}, image:{image}, schedule:{schedule}, avail_times:{avail_times}, length:{length}, budget:{budget}, uniform:{uniform}, participants:{participants}})-[:PART_OF]->(e)", q);


            inst.next_tasks.push("accept_application");
            inst.next_tasks.push("self_application");
            inst.next_tasks.push("schedule_activity");
            return "OK";
        }, async (inst) => "OK"
    );

    app.taskApi.create_task(
        "activity", "report_competition_result", ["competition_manager."], [],
        app.taskApi.okcancel().concat(
            {event_task: true},
            {field: "competition", type: "dropdown", prepare: async (v, ctx, task) => {
                const w = (await app.cypher("MATCH (:Event {id:{evt}})--(w:WorkGroup {type:\"competition\"})-[:MANAGED_BY]-(r:Role)-[:HAS_ROLE]-(u:User {id:{id}}) RETURN w", {evt: task.data.start_data.event_id, id: await app.userApi.userId(ctx)})).records;
                v.values = [];
                for (const r of w) {
                    const team = r.get("w").properties;
                    v.values.push({label: team.name, id: team.id});
                }
            }},
            {field: "category", type: "text"},
            {field: "user", type: "dropdown", prepare: async (v, ctx, task) => {
                const w = (await app.cypher("MATCH (u:User) RETURN u")).records;
                v.values = [];
                for (const r of w) {
                    const team = r.get("u").properties;
                    v.values.push({label: team.nickname, id: team.id});
                }
            }}
        ),
        async (inst, ctx) => {

            const q = inst.response;
            await app.cypher("MATCH (w:WorkGroup {id:{competition}}), (u:User {id:{user}}) CREATE (w)<-[:WINNER {category:{category}}]-(u)", {competition: q.competition.id, category: q.category, user: q.user.id});
            await app.roleApi.addAchievement(inst.origin, "great_competition_manager", 1, app.userApi.getActiveEvent(ctx), 1, 10);
            return "OK";
        }, async (inst) => "OK"
    );


    // For now, offline tasks?
    app.taskApi.create_task(
        "activity", "assign_location", [], ["admin.", "overseer.", "team_admin."],
        [{event_task: true}, {field: "ok", type: "button"}],
        async (inst) => "OK", async (inst) => "OK"
    );
    app.taskApi.create_task(
        "activity", "schedule_activity", [], ["admin.", "overseer.", "activity_admin."],
        [{event_task: true}, {field: "ok", type: "button"}],
        async (inst) => "OK", async (inst) => "OK"
    );

    app.taskApi.create_task(
        "activity", "review_vendor", [], ["admin.", "overseer.", "vendor_admin."],
        app.taskApi.yesno().concat({event_task: true}),
        async (inst, ctx) => {
            if (inst.response.no) {
                inst.next_tasks.push("deny_application");
                app.userApi.emailUser(inst.origin, "{email.app_denied.subject}", "{email.app_denied.text}", "{email.app_denied.text.html}");
                return "OK";
            }
            await app.userApi.emailUser(inst.origin, "{email.app_accepted.subject}", "{email.app_accepted.text}", "{email.app_accepted.text.html}");
            const q = inst.data.application;
            const shop = app.uuid();
            q.shop = shop;
            q.event_id = inst.data.start_data.event_id || (await app.userApi.getActiveEvent(ctx)).id;
            q.shopRole = `manager.${shop}`;
            await app.roleApi.addRole(inst.origin, `manager.${q.event_id}`, 1500);
            await app.roleApi.addRole(inst.origin, "vendor", 5500);
            await app.roleApi.addRole(inst.origin, q.shopRole);
            await app.cypher("MATCH (r:Role {type:{shopRole}}), (e:Event {id:{event_id}}) MERGE (r)<-[:MANAGED_BY]-(s:WorkGroup {id:{shop}, name:{name}, desc:{desc}, size:{size}, image:{image}, schedule:{schedule}, tables:{tables}, type:{type}})-[:PART_OF]->(e)", q);
            await app.roleApi.addAchievement(inst.origin, "let_them_buy_cake", 1, app.userApi.getActiveEvent(ctx), 1, 100);

            inst.next_tasks.push("accept_application");
            inst.next_tasks.push("self_application");
            return "OK";
        }, async (inst) => "OK"
    );


    app.taskApi.create_task(
        "activity", "review_artist_alley", [], ["admin.", "overseer.", "artist_alley_admin."],
        app.taskApi.yesno().concat({event_task: true}),
        async (inst, ctx) => {
            if (inst.response.no) {
                inst.next_tasks.push("deny_application");
                app.userApi.emailUser(inst.origin, "{email.app_denied.subject}", "{email.app_denied.text}", "{email.app_denied.text.html}");
                return "OK";
            }
            await app.userApi.emailUser(inst.origin, "{email.app_accepted.subject}", "{email.app_accepted.text}", "{email.app_accepted.text.html}");

            const q = inst.data.application;
            const shop = app.uuid();
            q.shop = shop;
            q.event_id = inst.data.start_data.event_id || (await app.userApi.getActiveEvent(ctx)).id;
            q.shopRole = `manager.${shop}`;
            await app.roleApi.addRole(inst.origin, `manager.${q.event_id}`, 1500);
            await app.roleApi.addRole(inst.origin, "artist", 5500);

            await app.roleApi.addRole(inst.origin, q.shopRole);
            await app.cypher("MATCH (r:Role {type:{shopRole}}), (e:Event {id:{event_id}}) MERGE (r)<-[:MANAGED_BY]-(s:WorkGroup {id:{shop}, name:{name}, desc:{desc}, size:{size}, image:{image}, schedule:{schedule}, type:{type}})-[:PART_OF]->(e)", q);
            await app.roleApi.addAchievement(inst.origin, "i_am_an_artist", 1, app.userApi.getActiveEvent(ctx), 1, 100);

            inst.next_tasks.push("accept_application");
            inst.next_tasks.push("self_application");
            return "OK";
        }, async (inst) => "OK"
    );

    app.taskApi.create_task(
        "activity", "accept_application", [], [],
        [{event_task: true}, {field: "ok", type: "button"}],
        async (inst, ctx) => "OK", async (inst) => "OK"
    );

    app.taskApi.create_task(
        "activity", "deny_application", [], [],
        [{event_task: true}, {field: "ok", type: "button"}],
        async (inst, ctx) => "OK", async (inst) => "OK"
    );

    app.taskApi.create_task(
        "activity", "join_competition", ["visitor.", "team_member.", "admin.", "overseer."], [],
        app.taskApi.okcancel().concat(
            {event_task: true, autocancel: true},
            {field: "which_activity", type: "dropdown", prepare: async (v, ctx, task) => {
                const w = (await app.cypher("MATCH (:Event {id:{event}})--(w:WorkGroup {type:\"competition\"}), (u:User {id:{id}}) WITH w,u,SIZE((w)<-[:COMPETING_IN]-(:User)) as competitors WHERE NOT (w)<-[:COMPETING_IN]-(u) AND toInt(competitors) < toInt(w.participants) RETURN w,competitors", {event: task.data.start_data.event_id, id: await app.userApi.userId(ctx)})).records;
                v.values = [];
                for (const r of w) {
                    const team = r.get("w").properties;
                    v.values.push({label: `${team.name} (${r.get("competitors")}/${team.participants})`, id: team.id});
                }
            }},
        ),
        async (inst, ctx) => {
            if (!inst.response.which_activity) {
                return "OK";
            }

            const w = inst.response.which_activity;

            let role = await app.cypher("MATCH (r:Role)<-[:MANAGED_BY]-(w:WorkGroup {id:{activity}}), (u:User {id:{user}}) CREATE (w)<-[:COMPETING_IN]-(u) RETURN r,w", {activity: w.id, user: await app.userApi.userId(ctx)});
            inst.data.competition = role.records[0].get("w").properties;
            await app.roleApi.addAchievement(inst.origin, "for_glory", 1, app.userApi.getActiveEvent(ctx), 1, 10);


            role = role.records[0].get("r").properties.type;

            inst.next_tasks.push({handlers: [
                role, `overseer.${inst.data.start_data.event_id}`
            ], task: "new_competitor"});


            return "OK";
        }, async (inst) => "OK"
    );

    app.taskApi.create_task(
        "activity", "new_competitor", [], [],
        [{event_task: true}, {field: "ok", type: "button"}],
        async (inst, ctx) => "OK", async (inst) => "OK"
    );

    app.taskApi.create_task(
        "activity", "crew_checkin_select", [], [], app.taskApi.okcancel().concat({event_task:true},
        {field: "target", type: "dropdown", prepare: async (v, ctx, task) => {
                console.dir(task);
                console.dir(task.data);
                if(!task.data.accs) return;
                const w = task.data.accs;
                v.values = [];
                for (const r of w) {
                    v.values.push({label: r.u.email + " - " + r.u.ssn + " - " + r.u.phone, id: r.u.id});
                }
            }}),
        async (inst, ctx) => {
            let res = "";
            for(var v of inst.data.accs){
                if(v.u.id == inst.response.target.id) res = inst.data.user = v.u;
            }
            let teams = app.mapCypher(await app.cypher("MATCH (u:User {id:{id}})-[t:TEAM_MEMBER]-(w:WorkGroup)--(:Event {id:{event}}) RETURN u,t", {event: inst.data.start_data.event_id, id: res.id}), ["u", "t"]);
            inst.data.teams = teams;
            inst.data.teamCount = teams.length;
            for(let t of teams){
                let q = t['t'];
                let u = t['u'];
                inst.data.user = u;

                inst.data.sleep = q.sleep || inst.data.sleep;
                inst.data.wednesday = q.wednesday || inst.data.wednesday;
                inst.data.sunday = q.sunday || inst.data.sunday;
                inst.data.tshirt = q.tshirt + ", " + inst.data.tshirt;
                inst.data.checkedIn = q.checkedIn || q.checkedIn;
            }

            if(inst.data.checkedIn) {
                inst.error = "{tasks.checkin.alreadyCheckedIn}";
                return 'RETRY';
            } else if(inst.data.teamCount < 1) {
                inst.error = "{tasks.checkin.notInCrew}"
                return 'RETRY';
            }

            inst.next_tasks.push("crew_checkin_verify");
            return 'OK';


        })

    app.taskApi.create_task(
        "activity", "crew_checkin", ["admin", "admin.", "crew_admin.", "team_admin."], [], app.taskApi.okcancel().concat({event_task:true},
            {field:"checkin_account", type:"text"}),
        async (inst, ctx) => {
            
            const res = await app.userApi.findAccount({any: inst.response.checkin_account});
            const mres = await app.userApi.findAccounts(inst.response.checkin_account);
            if(!res && !mres){
                inst.error = "{tasks.account.noSuchUser}";
                return 'RETRY';
            } else if(mres) {
                inst.data.accs = mres;
                inst.next_tasks.push("crew_checkin_select");
                return 'OK';
            } else {

                inst.data.user = res;
                let teams = app.mapCypher(await app.cypher("MATCH (u:User {id:{id}})-[t:TEAM_MEMBER]-(w:WorkGroup)--(:Event {id:{event}}) RETURN u,t", {event: inst.data.start_data.event_id, id: res.id}), ["u", "t"]);
                inst.data.teams = teams;
                inst.data.teamCount = teams.length;
                for(let t of teams){
                    let q = t['t'];
                    let u = t['u'];
                    inst.data.user = u;

                    inst.data.sleep = q.sleep || inst.data.sleep;
                    inst.data.wednesday = q.wednesday || inst.data.wednesday;
                    inst.data.sunday = q.sunday || inst.data.sunday;
                    inst.data.tshirt = q.tshirt + ", " + inst.data.tshirt;
                    inst.data.checkedIn = q.checkedIn || q.checkedIn;
                }
                
                if(inst.data.checkedIn) {
                    inst.error = "{tasks.checkin.alreadyCheckedIn}";
                    return 'RETRY';
                } else if(inst.data.teamCount < 1) {
                    inst.error = "{tasks.checkin.noTickets}"
                    return 'RETRY';
                }

                inst.next_tasks.push("crew_checkin_verify");
                return 'OK';
            }
        });
    app.taskApi.create_task(
        "activity", "crew_checkin_verify", [], [], app.taskApi.okcancel().concat({event_task:true}),
        async (inst,ctx) => {

            let tasks = [];
            for(let t of inst.data.teams){
                tasks.push(app.cypher("MATCH (:User {id:{id}})-[t:TEAM_MEMBER]-(w:WorkGroup)--(:Event {id:{event}}) SET t.checkedIn=true", {event: inst.data.start_data.event_id, id: inst.data.user.id}));
            }
            await Promise.all(tasks);
            return 'OK';
        });


};
