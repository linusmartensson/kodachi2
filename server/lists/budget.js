module.exports = (app) => {

    app.listApi.build_list(
        "budget", 
        "admin_budget", 
        ["admin"], 
        "MATCH (r:Receipt)--(u:User) return r,u",
        ["r", "u"],
        {event:'inst.start_data.event_id'}, 
        {event_list:true});


};
