module.exports = (app) => {
    app.listApi.build_list("budget", "admin_budget", ["admin", "team_admin.", "event_admin.", "crew_admin."], 
        "MATCH (w:WorkGroup)--(e:Event {id:{event}}) with w.type as type, collect(w) as groups, sum(toInt(w.budget)) as total unwind groups as w return w, total order by type, w.name", ["w", "total"], {event:'inst.start_data.event_id'}, {event_list: true, group_by:'w.type'});

};
