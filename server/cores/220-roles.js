

module.exports = async (app) => {
    var api = {};

    await app.cypher('CREATE CONSTRAINT ON (r:Role) ASSERT r.type IS UNIQUE');

    api.create_achievement = (name, desc, image, value) => {
        if(!app.achievements) app.achievements = {};

        app.achievements[name] = {
            name:name,
            desc:desc,
            image:image,
            value:value
        }
    }

    api.addRole = async (user, role, xp) => {
        await app.cypher(   'MATCH (u:User {id:{user}}), (r:Role {type:{type}}) ' + 
                            'MERGE (u)-[e:HAS_ROLE]->(r) '+
                            'ON MATCH SET   e.level = (e.xp + {xp} + 1000)/1000 , e.xp = e.xp + {xp} '+
                            'ON CREATE SET  e.level = (1000+{xp})/1000          , e.xp = {xp}'
                         , {user, role, xp});
    }

    api.getBestRole = async (user) => {
        var v = await app.cypher('MATCH (u:User {id:{user}})-[e:HAS_ROLE]->(r:Role) WHERE EXISTS(e.xp)  RETURN r,e ORDER BY e.xp DESC LIMIT 1', {user});

        if(v.records.length == 0) return {role:'anonymous', level:1, xp:0};

        var r = v.records[0].get('r').properties;
        var e = v.records[0].get('e').properties;

        return {
            role:r.type,
            xp:e.xp?e.xp.toNumber():0,
            level:e.level?e.level.toNumber():1,
        }
    }


    app.roleApi = api;
}
