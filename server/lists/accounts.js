
module.exports = (app) => {

    app.listApi.create_list("purchases", "all_users", ["admin"], {}, 
    async (inst, ctx) => {

        //get tickets
        var users = await app.cypher("MATCH (u:User) RETURN u", {});

        users = users.records;
        

        var content = [];
        var rows = [];
        for(var v in users){
            var user = users[v].get("u").properties;
            delete user.password;
            delete user.verifyCode;

            rows.push({id:rows.length, panels:[
                {id:0, content:[{id:0, type:"text", text:user.givenName +" \""+user.nickname+"\" "+user.lastName}]},
                {id:1, content:[{id:0, type:"editbutton", text:"Add powers", task:"add_super_role", data:{id:user.id}}]}
            ]});
        }

        content.push({tiers:rows, id:content.length});
        return {content:content, id:0};
    });
    
};
