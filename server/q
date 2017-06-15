To understand & implement:
https://facebook.github.io/react/




users are assigned roles as part of executed tasks

roles have capabilities and responsibilities


for example:
a member may buy tickets

an activity host must be a member
an activity host must schedule and plan their activity
an activity host must request a budget
an activity host may upload receipts

a budget manager must be a member
a budget manager must respond to budget requests
a budget manager must respond to receipt uploads
a budget manager may view the budget and current costs

code example:

//internationalized strings
strings = {
    host_for_X: {
        en: "Host for %" 
        ,sv: "Arrangör för %"
        }
    noob_achievement: {
        en: "Noobie!"
        ,sv:"Nybörjarkonventare!"
    }
}

//achievements that may be acquired
achievements = {
    new_member: {value:100, title: "noob_achievement", description: "noob_achievement_desc", image:"noob_achievement"}
    ,visitor: {value:150, title: ...}

}

//base roles that can be instantiated into a specific event role
role = {
    member: {created:function(origin, data){
            achievement(origin.user, new_member);
        }
    }
    activity_host: {created:function(origin, data){
            origin.user.stats.hosted_activities++;
            if(data.competition) 
                task("report_activity_scoreboard", origin, data);
        }, title: host_for_X 
    }
}

//Tasks that can be activated
tasks = {
    request_activity: { access: [member], input:[timeslot, budget, title, description], on: function(origin, data) {
            task("schedule_activity", origin, data);
            task("budget_activity", origin, data);
            return wait;} 
        ,then: [
            schedule_ok: wait, 
            budget_ok: wait, 
            schedule_budget_ok: resolve, 
            not_ok: retry_message]
        ,error: function(origin, data){
            cancel_child_tasks(origin);
        }
        ,resolve: function(origin, data){
            role_instance(origin, "activity_host", [data.activity_name], data);
            budget(origin, data.activity_budget);
            schedule(origin, data.activity_schedule);
            activity(origin, data);
            return end_task;
        }
    }
    ,schedule_activity: { access: [schedule_manager], input:[schedule, message], on: function(origin, data) {
            if(!data.schedule) {
                origin.set(not_ok, message);
            }
            task("ack_schedule", origin, data);
            return wait;}
        ,then: [ack: resolve, nack: retry_message]
        ,resolve: function(origin, data) {
            if(origin.state() == budget_ok) origin.set(schedule_budget_ok, data.message);
            else origin.set(schedule_ok, data.message);
            return end_tasK;
        }
    }
    ,upload_receipt: { access: [activity_host, budget_manager, organizers], on: function(origin, data){
        task("check_receipt", origin, data);
        return wait;
    }, then: [cleared: end_task, not_cleared: retry_message]}
    ,check_receipt: { access: [budget_manager], input:[result, message], on: function(origin, data){
        origin.set(data.result, data.message);
        return end_task;
    }}
}

in view:
for each role
    list role name
    list all current tasks
