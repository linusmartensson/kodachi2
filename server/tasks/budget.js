
module.exports = async (app) => {

    app.taskApi.create_task('budget', 'upload_receipt', 
        ['receipt_submitter.'], [],
        app.taskApi.okcancel().concat(
            {event_task:true},
            {field:'purchase', type:'text'}, 
            {field:'image', type:'image'}, 
            {field:'total', type:'number'},
            {field:'group', type:'dropdown', prepare:async (v, ctx)=>{
                var r = await app.cypher('MATCH (r:BudgetGroup) RETURN r');
                v.values = [];
                for(var q of r.records){
                    var w = q.get('r').properties;
                    v.values.push(w.type);
                }
            }},
        ),
        async (inst) => {
            
            inst.response.image = app.utils.upload(inst.response.image);

            inst.data.receipt = inst.response;
            inst.data.receipt.id = app.uuid();
            inst.next_tasks.push('review_receipt');
            return 'OK';
        }, async(inst)=>{return 'OK'});

    app.taskApi.create_task('budget', 'review_receipt', 
        [], ['budget.'],
        app.taskApi.yesno().concat(
            {field:'total', type:'number'},
            {event_task:true, field:'group', type:'dropdown', prepare:async (v, ctx)=>{
                var r = await app.cypher('MATCH (r:BudgetGroup) RETURN r');
                v.values = [];
                for(var q of r.records){
                    var w = q.get('r').properties;
                    v.values.push(w.type);
                }
            }}
        ),
        async (inst) => {
            if(inst.response.no) {
                inst.next_tasks.push('deny_receipt');
                return 'OK'; 
            }
            inst.data.receipt.group = inst.response.group;
            inst.data.receipt.total = inst.response.total;

            app.cypher('MATCH (r:BudgetGroup {type:{group}}) CREATE (r)-[:CONTAINS]->(:Receipt {image:{image}, purchase:{purchase}, total:{total}, id:{id}})', inst.data.receipt);

            inst.next_tasks.push('accept_receipt');
            inst.next_tasks.push('pay_receipt');
            return 'OK';
        }, async(inst)=>{return 'OK'});

    app.taskApi.create_task('budget', 'pay_receipt', 
        [], [], [{event_task:true, field:'ok', type:'button'}],
        async (inst) => {
            app.cypher('MATCH (r:Receipt id:{id}) SET r.paid=1', {id:inst.data.receipt.id});
            return 'OK';}, async(inst)=>{return 'OK'});
    app.taskApi.create_task('budget', 'accept_receipt', 
        [], [], [{event_task:true, field:'ok', type:'button'}],
        async (inst) => {return 'OK';}, async(inst)=>{return 'OK'});
    app.taskApi.create_task('budget', 'deny_receipt', 
        [], [], [{event_task:true, field:'ok', type:'button'}],
        async (inst) => {return 'OK';}, async(inst)=>{return 'OK'});

    app.taskApi.create_task('budget', 'add_budgetgroup', [],['budget.', 'admin.'], [{field:'type',type:'simpletext'},{field:'limit', type:'number'}],
        async(inst) => {
            app.cypher('CREATE (:BudgetGroup {type:{type}, limit:{limit}})', inst.response);
            return 'OK';
        },
        async(inst) => {return 'OK'});




}
