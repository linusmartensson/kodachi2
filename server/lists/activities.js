

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



    //------------
    //admin pages
    app.listApi.build_list("activities", "list_team_leaders", ["admin", "team_admin.", "admin.", "crew_admin."], 
        "MATCH (u:User)--(:Role)-[:MANAGED_BY]-(w:WorkGroup)--(:Event {id:{event}}) RETURN u,w order by w.name, u.nickname", ["u", "w"], {event:'inst.start_data.event_id'}, {event_list: true});
    app.listApi.build_list("activities", "admin_teams", ["admin", "team_admin.", "admin.", "crew_admin."], 
        "MATCH (u:User)-[m:TEAM_MEMBER]-(w:WorkGroup)--(:Event {id:{event}}) RETURN u,m,w,SIZE(()-[:TEAM_MEMBER]-(w)) as q,SIZE((u)--(:Role)-[:MANAGED_BY]-(w))>0 as leader order by w.name, u.nickname", ["u", "m", "w", "q", "leader"], {event:'inst.start_data.event_id'}, {event_list: true, group_by: 'w.id'});
    //------------

    //team page
    app.listApi.build_list("activities", "my_team", ["manager.", "team_member."], 
        "MATCH (me:User {id:{user_id}})-[:TEAM_MEMBER]-(w:WorkGroup) WHERE (w)--(:Event {id:{event}}) WITH me, w MATCH (u:User)-[m:TEAM_MEMBER]-(w) WITH me, w, SIZE((me)--(:Role)-[:MANAGED_BY]-(w))>0 as is_leader,u,m, SIZE((u)--(:Role)-[:MANAGED_BY]-(w))>0 as leader, SIZE((:User)--(:Role)-[:MANAGED_BY]-(w)) as leader_count RETURN leader, is_leader, (leader_count>1 and is_leader and leader) as deletable_leader, u,m,w,SIZE(()-[:TEAM_MEMBER]-(w)) as q order by w.name, u.nickname", ["deletable_leader", "is_leader", "leader", "q", "u", "m", "w"], {event:'inst.start_data.event_id', user_id:app.listApi.remap(app.userApi.userId)}, {event_list: true, group_by: 'w.id', prepare: (q)=>{
            for(var v in q){
                if(!q[v].is_leader || !q[v].m.description) q[v].m.description="";
            }
            return q;
        }});

    app.listApi.build_list("activities", "list_activities", ["anonymous", "user"],
        "MATCH (w:WorkGroup)--(:Event {id:{event}}) RETURN w order by w.type", ["w"], {event:'inst.start_data.event_id'}, {event_list: true, group_by:"w.type"});
    
};
