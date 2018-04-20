
import bcrypt from "bcrypt";
const _ = require("lodash");

module.exports = async (app) => {

    await app.cypher("CREATE CONSTRAINT ON (u:User) ASSERT u.id IS UNIQUE");
    const api = {};

    const coreRoles = ["user", "anonymous", "editor", "admin"];

    for (const v of coreRoles) {
        await app.roleApi.create_role(v);
    }

    function hash (pwd) {
        return new Promise((resolve, reject) => {
            bcrypt.hash(pwd, 10, (err, target) => {
                if (err) {
                    reject(err);
                }
                resolve(target);
            });
        });
    }
    function compare (pwd, target) {
        return new Promise((resolve, reject) => {
            bcrypt.compare(pwd, target, (err, res) => {
                if (err) {
                    reject(err);
                }
                resolve(res);
            });
        });
    }

    api.getUser = async (id) => {
        let user = await app.cypher("MATCH (u:User) WHERE u.id={id} RETURN u", {id});
        if (user.records.length > 0) {
            user = user.records[0].get("u").properties;
            delete user.verifyCode;
            return user;
        }
        return null;
    };
    api.getRoles = async (id) => {
        if (!id) {
            return ["anonymous"];
        }
        const userRoles = await app.cypher("MATCH (u:User)-[:HAS_ROLE]->(r:Role) WHERE u.id={id} RETURN r", {id});
        if (userRoles.records.length === 0) {
            return [];
        }

        const r = [];
        for (const v of userRoles.records) {
            r.push(v.get("r").properties.type);
        }
        return r;
    };
    api.getUserRoles = async (ctx) => api.getRoles(await api.userId(ctx));
    api.getActiveEvent = async (ctx) => {
        let e = false;
        if (ctx && await api.hasAnyRole(await api.userId(ctx), ["admin"])) {
            e = await app.cypher("MATCH (e:Event) RETURN e ORDER BY e.publish DESC LIMIT 1");
        } else {
            e = await app.cypher("MATCH (e:Event) WHERE e.publish < {now} RETURN e ORDER BY e.publish DESC LIMIT 1", {now: Date.now()});
        }

        return e.records.length > 0 ? e.records[0].get("e").properties : false;

    };
    api.getLanguage = async (ctx) => "sv";
    api.getUserLanguage = async (user) => "sv";
    api.hasAnyRole = async (id, roles) => {
        const userRoles = await api.getRoles(id);
        for (const v of roles) {
            if (v.match(/^!/) !== null) {
                if (userRoles.includes(v.split("!")[1])) {
                    return false;
                }
            }
        }
        for (const v of roles) {
            if (userRoles.includes(v)) {
                return true;
            }
        }
        return false;
    };
    api.userId = async (ctx) => {
        const u = await app.cypher(
            "MATCH (u:User)-[:HAS_SESSION]->(s:Session) WHERE s.id={id} AND NOT EXISTS(s.insecure) RETURN u",
            {id: ctx.session.localSession}
        );
        return (u.records.length > 0 ? u.records[0].get("u").properties.id : false);
    };

    api.updatePassword = async (ctx, password) => {
        let userId = await api.userId(ctx);

        if(!userId) return;

        await app.cypher("MATCH (u:User {id:{userId}}) SET u.password={password}", {userId, password:await hash(password)});
    }

    api.session = async (ctx) => {
        // Return current session
        let s = ctx.session.localSession;

        const q = s ? (await app.cypher("MATCH (s:Session) WHERE s.id={id} RETURN s", {id: s})).records : null;
        if (!q || q.length === 0 || q[0].get("s").properties.insecure) {
            ctx.session.localSession = false;
            s = false;
        }
        if (s) {
            return s;
        }

        // Create a new session
        const id = app.uuid() + app.uuid() + app.uuid();
        await app.cypher("MATCH (r:Role) WHERE r.type='anonymous' CREATE (:Session {id:{id}})-[:HAS_ROLE]->(r)", {id});

        ctx.session.localSession = id;
        return id;
    };

    api.createUser = async (ctx, p) => {

        // ssn, ssnDetails, avatar, nickname, email, password
        p.password = await hash(p.password);

        p.userId = app.uuid();
        p.code = app.uuid() + app.uuid();

        let firstUser = false;
        const users = (await app.cypher("MATCH (s:User) RETURN s"));

        if (users && users.records && users.records.length === 0) {
            firstUser = true;
        }

        await app.cypher("CREATE (:User {verified:false, verifyCode:{code}, id:{userId}, email:{email}, password:{password}, ssn:{ssn}, givenName:{givenName}, lastName:{lastName}, street:{street}, zipCode:{zipCode}, city:{city}, country:{country}, nickname:{nickname}, phone:{phone}, emergencyphone:{emergencyphone}, points:0})", p);

        // Ensure new user and session are associated.
        if(ctx){
            await app.cypher("MATCH (u:User {id:{userId}}), (s:Session {id:{sessionId}}), (:Role {type:\"anonymous\"})<-[d:HAS_ROLE]-(s) CREATE (u)-[:HAS_SESSION]->(s) DELETE d", {userId: p.userId, sessionId: await api.session(ctx)});
        }

        await app.roleApi.addRole(p.userId, "user", 1500);

        if (firstUser) {
            await app.roleApi.addRole(p.userId, "admin", 50500);
        }

        await api.emailUser(p.userId, "Verifiera ditt Kodachikonto!", `Tryck på denna länken för att verifiera ditt Kodachikonto: https://kodachi.se/__verifyEmail/${p.code}`);

        await app.roleApi.addAchievement(p.userId, "welcome_home", 1, api.getActiveEvent(ctx), 1, 0);

        let q = await app.cypher("MATCH (u:User) WHERE u.id={id} RETURN u", {id:p.userId});
        const res = q.records[0].get("u").properties;
        delete res.verifyCode;
        return res;
    };
    api.emailUser = async (userId, subject, text, html, immediate) => {
        let u = (await app.cypher("MATCH (u:User {id:{id}}) RETURN u", {id: userId})).records;
        if (u.length === 0) {
            console.dir("No user for email");
            return false;
        }
        if (!html) {
            html = text;
        }
        u = u[0].get("u").properties;
        const lang = await app.userApi.getUserLanguage(u);
        console.dir("Sending email "+subject+" to "+u.email);
        app.utils.email(u.email, app.stringApi.parse(subject, lang), app.stringApi.parse(text, lang), app.stringApi.parse(html, lang), immediate);
        return true;
    };
    api.findAccount = async (m) => {
        let p = _.cloneDeep(m);
        let q = [];
        if(p.any){
            p.ssn = p.email = p.any;
            delete p.any;
        }

        if (p.ssn) {

            let d = p.ssn.replace(/\D/g, "");
            if (d.length === 10) {
                if (d[0] === "0" || d[0] === "1") {
                    d = `20${d}`;
                } else {
                    d = `19${d}`;
                }
            } else if (d.length === 12) {
                p.ssn = d;
            } else {
                d = "-";
                //gonna fail!
            }
            p.ssn = d;

            q = await app.cypher("MATCH (u:User) WHERE u.ssn={ssn} RETURN u", p);
            delete p.ssn;
        } else if (p.email) {
            p.email = p.email.toLowerCase();
            q = await app.cypher("MATCH (u:User) WHERE u.email={email} RETURN u", p);
            delete p.email;
        } else {
            return false;
        }
        console.dir(p);
        console.dir(q);

        if (q && q.records && q.records.length > 0) {
            console.dir("res");
            const res = q.records[0].get("u").properties;
            delete res.verifyCode;
            return res;
        }
        return await api.findAccount(p);
    };
    api.tryLogin = async (ctx, user, password) => {
        // login account

        const pwCheck = await compare(password, user.password);
        if (!pwCheck) {
            return false;
        }

        // associate current session with user
        await app.cypher("MATCH (u:User {id:{userId}}), (s:Session {id:{sessionId}}), (r:Role {type:\"anonymous\"}), (r)<-[d:HAS_ROLE]-(s) CREATE (u)-[:HAS_SESSION]->(s) DELETE d", {userId: user.id, sessionId: await api.session(ctx)});

        return true;


    };
    api.switchAccount = async (ctx, user) => {
        // login account w/o password. This is dangerous!

        // re-associate current user session to the new user account.
        await app.cypher("MATCH (s:Session {id:{sessionId}})-[binding]-(u:User {id:{userId}}) DELETE binding", {userId: await api.userId(ctx), sessionId: await api.session(ctx)});
        await app.cypher("MATCH (u:User {id:{userId}}), (s:Session {id:{sessionId}}) CREATE (u)-[:HAS_SESSION]->(s)", {userId: user.id, sessionId: await api.session(ctx)});

        return true;

    };
    api.loginSession = async (userId, sessionId) => {
        await app.cypher("MATCH (u:User {id:{userId}}), (s:Session {id:{sessionId}}), (r:Role {type:\"anonymous\"}), (r)<-[d:HAS_ROLE]-(s) CREATE (u)-[:HAS_SESSION]->(s) DELETE d", {userId, sessionId});
        return true;
    }
    api.logout = async (ctx) => {
        await app.cypher("MATCH (u:User {id:{userId}})-[h:HAS_SESSION]->(s:Session), (r:Role {type:\"anonymous\"}) DELETE h CREATE (r)<-[:HAS_ROLE]-(s)", {userId: await api.userId(ctx)});
        delete ctx.userId;
    };
    api.loggedIn = async (ctx) => {
        if (await api.userId(ctx)) {
            return true;
        }
        return false;
    };
    api.requireAuth = () => async (ctx, next) => {
        if (!await api.loggedIn(ctx)) {
            return null;
        }
        return await next();
    };

    app.userApi = api;
};
