

module.exports = async (app) => {
    const api = {};

    await app.cypher("CREATE CONSTRAINT ON (r:Role) ASSERT r.type IS UNIQUE");
    await app.cypher("CREATE CONSTRAINT ON (r:Achievement) ASSERT r.type IS UNIQUE");

    api.create_achievement = async (name, req, value) => {
        if (!req) {
            req = 1;
        }
        if (!value) {
            value = 0;
        }
        const role = await app.cypher("MATCH (r:Achievement {type:{name}}) RETURN r", {name});
        if (role.records.length === 0) {
            await app.cypher("CREATE (r:Achievement {type:{name}, req:{req}, value:{value}})", {name, req, value});
        }
    };
    api.create_role = async (name) => {
        const role = await app.cypher("MATCH (r:Role {type:{name}}) RETURN r", {name});
        if (role.records.length === 0) {
            await app.cypher("CREATE (r:Role {type:{name}})", {name});
        }
    };
    api.emailMembers = async (role) => {
        const members = (await app.cypher("MATCH (r:Role {type:{role}})-->(u:User) RETURN u", {role})).records;
        for (const v in members) {
            const u = members[v].get("u").properties;
            const lang = app.userApi.getUserLanguage(u);
            await app.utils.email(u.email, app.stringApi.translate(null, "{email.assignment.title}", lang), app.stringApi.translate(null, "{email.assignment.text}", lang), app.stringApi.translate(null, "{email.assignment.text.html}", lang));
        }
    };

    api.addAchievement = async (user, achievement, points, event, req, value) => {
        await api.create_achievement(achievement, req, value); // pre-generate any non-existant role dynamically.
        if (!points) {
            points = 0;
        }
        const e = await app.cypher("MATCH (u:User {id:{user}})-[e:ACHIEVEMENT_PROGRESS]-(r:Achievement {type:{achievement}}) RETURN e", {user, achievement});
        if (e.records && e.records.length > 0) {
            const achieved = e.records[0].get("e").properties.achieved;
            if (achieved !== false && achieved !== "false" && achieved !== 0) {
                return;
            }
        }

        const status = await app.cypher(
            "MATCH (u:User {id:{user}}), (r:Achievement {type:{achievement}}) " +
                                    "MERGE (u)-[e:ACHIEVEMENT_PROGRESS]->(r) " +
                                    "ON MATCH SET   e.achieved = (toInt(e.points) + toInt({points}) >= toInt(r.req)) , e.points = toInt(e.points) + toInt({points}) " +
                                    "ON CREATE SET  e.achieved = (toInt({points}) >= toInt(r.req)) , e.points = toInt({points}) RETURN e,r"
            , {user, achievement, points}
        );

        if (status.records[0].get("e").properties.achieved) {
            await app.cypher("MATCH (u:User {id:{user}}) SET u.points = toInt(u.points) + toInt({points})", {user, points:value});
            await app.budgetApi.addBudget(event, "point_cost", value);
        }
    };
    api.removeRole = async (user, role, xp) => {
        await api.create_role(role); // pre-generate any non-existant role dynamically.
        if (!xp) {
            xp = 1000;
        }
        if (role.match(/\./) !== null) {
            //With .-roles, we will add negative xp to the base role.
            await api.addRole(user, `base_${role.replace(/\.[^.]*/, "")}`, -xp);
            xp = 0;
        }
        await app.cypher(
            "MATCH (u:User {id:{user}})-[e:HAS_ROLE]->(r:Role {type:{role}}) " +
                            "WHERE (u)-[e:HAS_ROLE]->(r) DETACH DELETE e;"
            , {user, role, xp}
        );
    };
    api.addRole = async (user, role, xp) => {
        await api.create_role(role); // pre-generate any non-existant role dynamically.
        if (!xp) {
            xp = 1000;
        }
        if (role.match(/\./) !== null) {
            // When adding .-roles such as for events, add the xp to a role named base_[rolename] instead of [rolename].[eventname].
            await api.addRole(user, `base_${role.replace(/\.[^.]*/, "")}`, xp);
            xp = 0;
        }
        await app.cypher(
            "MATCH (u:User {id:{user}}), (r:Role {type:{role}}) " +
                            "MERGE (u)-[e:HAS_ROLE]->(r) " +
                            "ON MATCH SET   e.level = (toInt(e.xp) + toInt({xp}) + 1000)/1000 , e.xp = toInt(e.xp) + toInt({xp}) " +
                            "ON CREATE SET  e.level = (1000+toInt({xp}))/1000          , e.xp = toInt({xp})"
            , {user, role, xp}
        );
    };
    api.hasRole = async (user, role) => {
        const r = await app.cypher("MATCH (:User {id:{user}})-[e:HAS_ROLE]->(:Role {type:{role}}) RETURN e", {user, role});
        return r.records.length > 0;
    };

    api.getAchievements = async(user) => {
        const v = await app.cypher("MATCH (u:User {id:{user}})-[e:ACHIEVEMENT_PROGRESS]->(r:Achievement) RETURN r,e ORDER BY r.type DESC", {user});

        if (v.records.length === 0) {
            return [];
        }

        var res = [];
        for(var q in v.records){

            const r = v.records[q].get("r").properties;
            const e = v.records[q].get("e").properties;

            res.push({
                achievement: r.type,
                points: e.points,
                req: r.req,
                achieved: e.achieved
            });
        }
        return res;
    }
    api.getAllRoles = async(user) => {
        const v = await app.cypher("MATCH (u:User {id:{user}})-[e:HAS_ROLE]->(r:Role) WHERE EXISTS(e.xp)  RETURN r,e ORDER BY e.xp DESC", {user});

        if (v.records.length === 0) {
            return [{role: "anonymous", level: 1, xp: 0}];
        }

        var res = [];
        for(var q in v.records){

            const r = v.records[q].get("r").properties;
            const e = v.records[q].get("e").properties;

            res.push({
                role: r.type,
                xp: e.xp ? typeof e.xp.toNumber === "function" ? e.xp.toNumber() : e.xp : 0,
                level: e.level ? typeof e.level.toNumber === "function" ? e.level.toNumber() : e.level : 1
            });
        }
        return res;
    }
    api.getBestRole = async (user) => {
        const v = await app.cypher("MATCH (u:User {id:{user}})-[e:HAS_ROLE]->(r:Role) WHERE EXISTS(e.xp)  RETURN r,e ORDER BY e.xp DESC LIMIT 1", {user});

        if (v.records.length === 0) {
            return {role: "anonymous", level: 1, xp: 0};
        }

        const r = v.records[0].get("r").properties;
        const e = v.records[0].get("e").properties;

        return {
            role: r.type,
            xp: e.xp ? typeof e.xp.toNumber === "function" ? e.xp.toNumber() : e.xp : 0,
            level: e.level ? typeof e.level.toNumber === "function" ? e.level.toNumber() : e.level : 1
        };
    };

    app.roleApi = api;
};
