

module.exports = (app) => {

    //compo list
    app.listApi.build_list(
        "activities", 
        "my_competition", 
        ["competition_manager."], 
        "MATCH (me:User {id:{user_id}})-[:TEAM_MEMBER]-(w:WorkGroup) WHERE (w)--(:Event {id:{event}}) WITH me, w MATCH (u:User)-[m:COMPETING_IN]-(w) WITH me, w, u,m RETURN u,m,w,SIZE(()-[:COMPETING_IN]-(w)) as q order by w.name, u.nickname", 
        ["q", "u", "m", "w"], 
        {event:'inst.start_data.event_id', user_id:app.listApi.remap(app.userApi.userId)}, 
        {event_list: true, group_by: 'w.id'});

    app.listApi.build_list("activities", "admin_compos", ["admin", "team_admin.", "admin.", "crew_admin."], 
        "MATCH (u:User)-[m:COMPETING_IN]-(w:WorkGroup)--(:Event {id:{event}}) RETURN u,m,w,SIZE(()-[:COMPETING_IN]-(w)) as q order by w.name, u.nickname", ["u", "m", "w", "q"], {event:'inst.start_data.event_id'}, {event_list: true, group_by: 'w.id'});


    app.listApi.build_list("activities", "tshirts", ["admin", "team_admin.", "admin.", "crew_admin."], 
        "MATCH (u:User)-[m:TEAM_MEMBER]-(w:WorkGroup {uniform:true})--(:Event {id:{event}}) RETURN u,m,w order by u.nickname", ["u", "m", "w"], {event:'inst.start_data.event_id'}, {event_list: true});

    //------------
    //admin pages
    app.listApi.build_list("activities", "badge_generator", ["admin", "team_admin.", "admin.", "crew_admin."], 
        "MATCH (u:User) where (u)-[:TEAM_MEMBER]-(:WorkGroup)--(:Event {id:{event}}) RETURN u order by u.nickname", ["u"], {event:'inst.start_data.event_id'}, {event_list: true});

    app.listApi.build_list("activities", "list_team_leaders", ["admin", "team_admin.", "ka.", "admin.", "crew_admin.", "manager."], 
        "MATCH (u:User)--(:Role)-[:MANAGED_BY]-(w:WorkGroup)--(:Event {id:{event}}) RETURN u,w order by w.name, u.nickname", ["u", "w"], {event:'inst.start_data.event_id'}, {event_list: true});
    app.listApi.build_list("activities", "admin_teams", ["admin", "team_admin.", "ka.", "admin.", "crew_admin.", "event_team_leader."], 
        "MATCH (u:User)-[m:TEAM_MEMBER]-(w:WorkGroup)--(:Event {id:{event}}) RETURN u,m,w,SIZE(()-[:TEAM_MEMBER]-(w)) as q,SIZE((u)--(:Role)-[:MANAGED_BY]-(w))>0 as leader order by w.name, u.nickname", ["u", "m", "w", "q", "leader"], {event:'inst.start_data.event_id'}, {event_list: true, group_by: 'w.id'});
    //------------
    app.listApi.build_list("activities", "email_all_staff", ["admin", "team_admin.", "admin.", "crew_admin."], 
        "MATCH (u:User)-[m:TEAM_MEMBER]-(w:WorkGroup)--(:Event {id:{event}}) RETURN u,m,w,SIZE(()-[:TEAM_MEMBER]-(w)) as q,SIZE((u)--(:Role)-[:MANAGED_BY]-(w))>0 as leader order by w.name, u.nickname", ["u", "m", "w", "q", "leader"], {event:'inst.start_data.event_id'}, {event_list: true});
    //------------

    //team page
    app.listApi.build_list("activities", "my_team", ["manager.", "team_member."], 
        "MATCH (me:User {id:{user_id}})-[:TEAM_MEMBER]-(w:WorkGroup) WHERE (w)--(:Event {id:{event}}) WITH me, w MATCH (u:User)-[m:TEAM_MEMBER]-(w) WITH me, w, SIZE((me)--(:Role)-[:MANAGED_BY]-(w))>0 as is_leader,u,m, SIZE((u)--(:Role)-[:MANAGED_BY]-(w))>0 as leader, SIZE((:User)--(:Role)-[:MANAGED_BY]-(w)) as leader_count RETURN leader, is_leader, (leader_count>1 and is_leader and leader) as deletable_leader, u,m,w,SIZE(()-[:TEAM_MEMBER]-(w)) as q order by w.name, u.nickname", ["deletable_leader", "is_leader", "leader", "q", "u", "m", "w"], {event:'inst.start_data.event_id', user_id:app.listApi.remap(app.userApi.userId)}, {event_list: true, group_by: 'w.id', prepare: (q)=>{
            for(var v in q){
                if(!q[v].is_leader || !q[v].m.description) q[v].m.description="";
                if(q[v].m.join_time) q[v].m.join_time = new Date(parseInt(q[v].m.join_time)).toDateString()
                else q[v].m.join_time = '{input.unknown}'
            }
            return q;
        }});

    
    app.listApi.build_list("activities", "list_shops", ["anonymous", "user"],
        "MATCH (w:WorkGroup)--(:Event {id:{event}}) WHERE w.type='artist_alley' OR w.type='vendor' RETURN w order by w.type, w.name", ["w"], {event:'inst.start_data.event_id'}, {event_list: true, group_by:"w.type"});
    app.listApi.build_list("activities", "list_activities", ["anonymous", "user"],
        "MATCH (w:WorkGroup)--(:Event {id:{event}}) WHERE w.type='activity' OR w.type='competition' RETURN w order by w.name", ["w"], {event:'inst.start_data.event_id'}, {event_list: true});
    app.listApi.build_list("activities", "list_teams", ["anonymous", "user"],
        "MATCH (w:WorkGroup)--(:Event {id:{event}}) WHERE w.type='team' RETURN w order by w.type, w.name", ["w"], {event:'inst.start_data.event_id'}, {event_list: true});
};
