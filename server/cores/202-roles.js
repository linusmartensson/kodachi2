

module.exports = async (app) => {
    var api = {};

    await app.cypher('CREATE CONSTRAINT ON (r:Role) ASSERT r.type IS UNIQUE');
    await app.cypher('CREATE CONSTRAINT ON (r:Achievement) ASSERT r.type IS UNIQUE');

    api.create_achievement = async (name, req, value) => {
        var role = await app.cypher('MATCH (r:Achievement {type:{name}}) RETURN r', {name});
        if(role.records.length==0){
            await app.cypher('CREATE (r:Achievement {type:{name}, req:{req}, value:{value}})', {name, req, value});
        }
    }
    api.create_role = async (name) => {
        var role = await app.cypher('MATCH (r:Role {type:{name}}) RETURN r', {name});
        if(role.records.length==0){
            await app.cypher('CREATE (r:Role {type:{name}})', {name});
        }
    }
    api.emailMembers = async (role) => {
        var members = (await app.cypher('MATCH (r:Role {type:{role}})-->(u:User) RETURN u', {role})).records; 
        for(var v in members){
            var u = members[v].get('u').properties;
            var lang = app.userApi.getUserLanguage(u);
            await app.utils.email(u.email, app.stringApi.translate(null, "{email.assignment.title}", lang), app.stringApi.translate(null, "{email.assignment.text}", lang), app.stringApi.translate(null, "{email.assignment.text.html}", lang));
        }
    }

    api.addAchievement = async (user, achievement, points, event) => {
        if(!points) points = 0;
        var e = await app.cypher('MATCH (u:User {id:{user}})-[e:ACHIEVEMENT_PROGRESS]-(r:Achievement {type:{achievement}}) RETURN e', {user, achievement});

        if(e.records && e.records.length > 0 && e.records[0].get('e').properties.achieved != false) return;

        var status = await app.cypher(  'MATCH (u:User {id:{user}}), (r:Achievement {type:{achievement}}) ' + 
                                    'MERGE (u)-[e:ACHIEVEMENT_PROGRESS]->(r) '+
                                    'ON MATCH SET   e.achieved = (toInt(e.points) + toInt({points}) >= toInt(r.req)) , e.points = toInt(e.points) + toInt({points}) '+
                                    'ON CREATE SET  e.achieved = (toInt({points}) >= toInt(r.req)) , e.points = toInt({points}) RETURN e,r'
                         , {user, achievement, points});
        await app.cypher('MATCH (u:User {id:{user}}) SET u.points = toInt(u.points) + toInt({points})', {user, points});
        
        if(status.records[0].get('e').properties.achieved)
            await app.budgetApi.addBudget(event, 'point_cost', status.records[0].get('r').properties.value);
    }
    api.removeRole = async (user, role, xp) => {
        await api.create_role(role);    //pre-generate any non-existant role dynamically.
        if(!xp) xp = 1000;
        if(role.match(/\./) != null){
            //When adding .-roles such as for events, add the xp to a role named base_[rolename] instead of [rolename].[eventname].
            await api.addRole(user, "base_"+role.replace(/\.[^.]*/, ''), -xp);
            xp = 0;
        }
        await app.cypher(   'MATCH (u:User {id:{user}})-[e:HAS_ROLE]->(r:Role {type:{role}}) ' + 
                            ' (u)-[e:HAS_ROLE]->(r) DETACH DELETE e;'
                         , {user, role, xp});
    }
    api.addRole = async (user, role, xp) => {
        await api.create_role(role);    //pre-generate any non-existant role dynamically.
        if(!xp) xp = 1000;
        if(role.match(/\./) != null){
            //When adding .-roles such as for events, add the xp to a role named base_[rolename] instead of [rolename].[eventname].
            await api.addRole(user, "base_"+role.replace(/\.[^.]*/, ''), xp);
            xp = 0;
        }
        await app.cypher(   'MATCH (u:User {id:{user}}), (r:Role {type:{role}}) ' + 
                            'MERGE (u)-[e:HAS_ROLE]->(r) '+
                            'ON MATCH SET   e.level = (toInt(e.xp) + toInt({xp}) + 1000)/1000 , e.xp = toInt(e.xp) + toInt({xp}) '+
                            'ON CREATE SET  e.level = (1000+toInt({xp}))/1000          , e.xp = toInt({xp})'
                         , {user, role, xp});
    }
    api.hasRole = async (user, role) => {
        var r = await app.cypher('MATCH (:User {id:{user}})-[e:HAS_ROLE]->(:Role {type:{role}}) RETURN e', {user, role});
        return r.records.length > 0;
    }

    api.getBestRole = async (user) => {
        var v = await app.cypher('MATCH (u:User {id:{user}})-[e:HAS_ROLE]->(r:Role) WHERE EXISTS(e.xp)  RETURN r,e ORDER BY e.xp DESC LIMIT 1', {user});

        if(v.records.length == 0) return {role:'anonymous', level:1, xp:0};

        var r = v.records[0].get('r').properties;
        var e = v.records[0].get('e').properties;

        return {
            role:r.type,
            xp:e.xp?typeof e.xp.toNumber === 'function'?e.xp.toNumber():e.xp:0,
            level:e.level?typeof e.level.toNumber === 'function'?e.level.toNumber():e.level:1,
        }
    }
	
    app.roleApi = api;
    await require('../tools/core').loader("achievements", app);
}
