

module.exports = (app) => {

    app.listApi.build_list("activities", "admin_teams", ["admin", "team_admin.", "event_admin.", "crew_admin."], 
        "MATCH (u:User)-[m:TEAM_MEMBER]-(w:WorkGroup)--(:Event {id:{event}}) with u,m,w,count(m) as q RETURN u,m,w,q order by w.name, u.nickname", ["u", "m", "w", "q"], {event:'inst.start_data.event_id'}, {event_list: true});

    app.listApi.build_list("activities", "my_team", ["manager."], 
        "MATCH (u:User)-[m:TEAM_MEMBER]-(w:WorkGroup)-[:MANAGED_BY]->(:Role)<-[:HAS_ROLE]-(:User {id:{user_id}}) WHERE (w)--(:Event {id:{event}}) RETURN u,m,w order by w.name, u.nickname", ["u", "m", "w"], {event:'inst.start_data.event_id', user_id:app.listApi.remap(app.userApi.userId)}, {event_list: true});

    app.listApi.create_list(
        "activites", "show_team", ["manager.", "team_member."], {event_list: true},
        async (inst, ctx) => {
            // List all member names
            // Hover-text for applications
            // Email button

            // get team memberships
            const teams = await app.cypher("MATCH (:User {id:{id}})-[:TEAM_MEMBER]-(w:WorkGroup)--(:Event {id:{event}}) RETURN w", {event: inst.start_data.event_id, id: await app.userApi.userId(ctx)});
            const content = [];


            // for teams
            for (const v in teams.records) {

                const team = teams.records[v].get("w").properties;
                let managers = await app.cypher("MATCH (u:User)-[:HAS_ROLE]->(:Role)<-[:MANAGED_BY]-(w:WorkGroup {id:{team}}) RETURN u", {team: team.id});
                managers = managers.records;

                const tls = {};

                for (const q of managers) {
                    const u = q.get("u").properties;
                    tls[u.id] = u;
                }
                const manager = Boolean(tls[await app.userApi.userId(ctx)]);


                const members = await app.cypher("MATCH (w:WorkGroup {id:{id}})-[t:TEAM_MEMBER]-(u:User) RETURN t,u", {id: team.id});

                const teamdesc = {tiers: [{
                    id: 0, panels: [
                        {id: 0, content: [{id: 0, type: "text", text: team.name}]},
                        {id: 1, content: [{id: 0, type: "text", text: `${members.records.length}/${team.size}`}]},
                        {id: 2, content: [{id: 0, type: "editbutton", text: "Email team", task: `email_team.${inst.start_data.event_id}`, data: {team: team.id}}]}
                    ]
                }], id: content.length};
                if(manager) {
                    teamdesc.tiers[0].panels.push({id:3, content: [{id: 0, type: 'editbutton', text:'Update team profile', task: `update_team_desc.${inst.start_data.event_id}`, data: {team: team.id, update_name: team.name, update_desc:team.desc}}]})
                }

                // content.push(teamdesc);


                // list team
                const r = {tiers: teamdesc.tiers, id: content.length};
                for (const w in members.records) {
                    const member = members.records[w];

                    const t = member.get("t").properties;
                    const u = member.get("u").properties;
                    const tier = {
                        id: r.tiers.length,
                        panels: [
                            {id: 0, content: [{id: 0, type: "text", hover: t.description, text: `${u.givenName} "${u.nickname}" ${u.lastName} - ${u.email}`}]},
                        ]
                    };

                    if (manager) {
                        tier.panels.push({id: 2, content: [{id: 0, type: "editbutton", text: "Remove user", task: `remove_team_member.${inst.start_data.event_id}`, data: {team: team.id, user: u.id}}]});
                        if (Object.prototype.hasOwnProperty.call(tls, u.id) === false) {
                            tier.panels.push({id: 3, content: [{id: 0, type: "editbutton", text: "Promote user", task: `promote_manager.${inst.start_data.event_id}`, data: {team: team.id, user: u.id}}]});
                        } else {
                            tier.panels.push({id: 3, content: [{id: 0, type: "editbutton", text: "Demote user", task: `demote_manager.${inst.start_data.event_id}`, data: {team: team.id, user: u.id}}]});
                        }
                    }

                    r.tiers.push(tier);

                }
                content.push(r);
            }

            return {content, id: 0};
        }
    );


    app.listApi.create_list(
        "activities", "show_activities", ["anonymous", "user"], {event_list: true},
        async (inst, ctx) => {

            const teams = await app.cypher("MATCH (:Event {id:{event}})--(w:WorkGroup) RETURN w", {event: inst.start_data.event_id, type: ""});
            let content = [];

            const lang = await app.userApi.getLanguage(ctx);

            // for teams
            for (const v in teams.records) {

                const team = teams.records[v].get("w").properties;
                //              name
                //              schedule
                // open
                // uniform
                // image
                // size
                // id
                // budget
                //              desc
                //
                //
                // activity/competition:
                // format {field:'act_format', type:'dropdown', values:['competition', 'activity']},
                // length {field:'act_length', type:'dropdown', translate:true, values:['short', 'medium', 'long', 'half_day', 'day']},
                // participant count {field:'act_participants', type:'number'},
                //
                // vendor
                // table count {field:'shop_tables', type:'number'}, //How large?
                // {field:'shop_type', type:'dropdown', values:['artist_alley','vendor']},
                const teamdesc = {tiers: [{
                    id: 0, panels: [
                        {id: 0, content: [{id: 0, type: "caption", text: team.name}, {id: 1, type: "image", image: team.image}]}
                    ]
                }/* ,{ -- This will not be viable to have here until we get the scheduling integrated in the website.
                    id:1, panels:[
                        {id:0, content:[{id:0, type:'text', text:app.stringApi.get_string('list.show_activities.times', lang)}]},
                        {id:1, content:[{id:0, type:'text', text:team.schedule.map(function(s){return app.stringApi.get_string(s, lang)}).join(", ")}]}
                    ]
                }*/], id: content.length};
                const desc = app.stringApi.bookParser(team.desc, app.uuid());

                teamdesc.tiers = teamdesc.tiers.concat(desc[0].tiers);

                content.push(teamdesc);
                content = content.concat(desc.slice(1));
            }

            return {content, id: 0};
        }
    );
};
