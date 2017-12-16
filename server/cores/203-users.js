
import bcrypt from 'bcrypt'

module.exports = async (app) => {

    await app.cypher('CREATE CONSTRAINT ON (u:User) ASSERT u.id IS UNIQUE');
    var api = {};

    var coreRoles = ['user', 'anonymous', 'editor', 'admin'];

    for(var v of coreRoles){
        await app.roleApi.create_role(v);
    }

    function hash(pwd){
        return new Promise((resolve, reject) => {
            bcrypt.hash(pwd, 10, (err, hash) => {
                if(err) reject(err);
                resolve(hash);
            })
        })
    }
    function compare(pwd, hash){
        return new Promise((resolve, reject) => {
            bcrypt.compare(pwd, hash, (err, res) => {
                if(err) reject(err);
                resolve(res);
            })
        })
    }

    api.getUser = async (id) => {
        var user = await app.cypher('MATCH (u:User) WHERE u.id={id} RETURN u', {id:id});
        return user.records.length>0?user.records[0]:undefined;
    }
    api.getRoles = async (id) => {
        if(!id) return ['anonymous'];
        var userRoles = await app.cypher(
                'MATCH (u:User)-[:HAS_ROLE]->(r:Role) WHERE u.id={id} RETURN r', {id:id});
        if(userRoles.records.length == 0) return [];

        var r = [];
        for(var v of userRoles.records){
            r.push(v.get('r').properties.type);
        }
        return r;
    }
    api.getUserRoles = async (ctx) => {
        return api.getRoles(await api.userId(ctx));
    }
    api.getActiveEvent = async (ctx) => {
        var e = false;
        if(await api.hasAnyRole(await api.userId(ctx), ['admin'])) {
            e = await app.cypher('MATCH (e:Event) RETURN e ORDER BY e.publish DESC LIMIT 1');
        } else {
            e = await app.cypher('MATCH (e:Event) WHERE e.publish < {now} RETURN e ORDER BY e.publish DESC LIMIT 1', {now:Date.now()});
        }

        return e.records.length>0?e.records[0].get('e').properties:false;
        
    }
    api.getLanguage = async (ctx) => {
        return 'sv';
    }
    api.getUserLanguage = async (user) => {
        return 'sv';
    }
    api.hasAnyRole = async (id, roles) => {
        var userRoles = await api.getRoles(id);
        for(let v of roles){
            if(v.match(/^!/) != null){
                if(userRoles.includes(v.split('!')[1])) return false;
            }
        }
        for(let v of roles){
            if(userRoles.includes(v)) return true;
        }
        return false;
    }
    api.userId = async (ctx) => {
        var u = await app.cypher(
            'MATCH (u:User)-[:HAS_SESSION]->(s:Session) WHERE s.id={id} AND NOT EXISTS(s.insecure) RETURN u',
            {id:ctx.session.localSession});
        return (u.records.length>0?u.records[0].get('u').properties.id:false);
    }


    api.session = async (ctx) => {
        //Return current session
        var s = ctx.session.localSession;

        var q = s?(await app.cypher('MATCH (s:Session) WHERE s.id={id} RETURN s', {id:s})).records:null;
        if(!q || q.length == 0 || q[0].get('s').properties.insecure){
            s = ctx.session.localSession = false;
        }
        if(s){
            return s;
        }

        //Create a new session
        var id = app.uuid() + app.uuid() + app.uuid();
        await app.cypher("MATCH (r:Role) WHERE r.type='anonymous' CREATE (:Session {id:{id}})-[:HAS_ROLE]->(r)", {id:id});

        ctx.session.localSession = id;
        return id;
    }

    api.createUser = async (ctx, p) => {

        //ssn, ssnDetails, avatar, nickname, email, password
        p.password = await hash(p.password);

        p.userId = app.uuid();
        p.code = app.uuid()+app.uuid();

        var firstUser = false;
        var users = (await app.cypher('MATCH (s:User) RETURN s'));

        if(users && users.records && users.records.length == 0){
            firstUser = true;
        }

        await app.cypher('CREATE (:User {verified:false, verifyCode:{code}, id:{userId}, email:{email}, password:{password}, ssn:{ssn}, givenName:{givenName}, lastName:{lastName}, street:{street}, zipCode:{zipCode}, city:{city}, country:{country}, nickname:{nickname}, points:0})', p);

        //Ensure new user and session are associated.
        await app.cypher('MATCH (u:User {id:{userId}}), (s:Session {id:{sessionId}}), (:Role {type:"anonymous"})<-[d:HAS_ROLE]-(s) CREATE (u)-[:HAS_SESSION]->(s) DELETE d', {userId:p.userId, sessionId: await api.session(ctx)});

        await app.roleApi.addRole(p.userId, "user", "1500");
        
        if(firstUser){
            await app.roleApi.addRole(p.userId, "admin", "50500");
        }

        api.emailUser(p.userId, 'Verifiera ditt Kodachikonto!', 'Tryck på denna länken för att verifiera ditt Kodachikonto: https://kodachi.se/verifyEmail'+p.code);
        
    }
    api.emailUser = async(userId, subject, text, html) => {
        var u = await app.cypher('MATCH (u:User {id:{id}}) RETURN u', {id:userId}).records;
        if(u.length == 0) return false;
        if(!html) html = text;
        u = u[0].get('u').properties;
        var lang = app.userApi.getUserLanguage(u);
        await app.utils.email(u.email, app.stringApi.translate(null, subject, lang), app.stringApi.translate(null, text, lang), app.stringApi.translate(null, html, lang));
    }
    api.findAccount = async (p) => {
        var q = [];
        if(p.ssn){
            q = await app.cypher('MATCH (u:User) WHERE u.ssn={ssn} RETURN u', p); 
        } else if(p.email) {
            q = await app.cypher('MATCH (u:User) WHERE u.email={email} RETURN u', p);
        } else if(p.nickname) {
            q = await app.cypher('MATCH (u:User) WHERE u.nickname={nickname} RETURN u', p);
        }   

        if(q && q.records && q.records.length > 0) return q.records[0].get('u').properties;

        return false;
    }
    api.tryLogin = async (ctx, user, password) => {
        //login account

        var pwCheck = await compare(password, user.password); 
        if(!pwCheck) return false;

        //associate current session with user
        await app.cypher('MATCH (u:User {id:{userId}}), (s:Session {id:{sessionId}}), (r:Role {type:"anonymous"}), (r)<-[d:HAS_ROLE]-(s) CREATE (u)-[:HAS_SESSION]->(s) DELETE d', {userId:user.id, sessionId: await api.session(ctx)});

        return true;
        
    }
    api.logout = async (ctx) => {
        await app.cypher('MATCH (u:User {id:{userId}})-[h:HAS_SESSION]->(s:Session), (r:Role {type:"anonymous"}) DELETE h CREATE (r)<-[:HAS_ROLE]-(s)', {userId:await api.userId(ctx)});
        console.dir("logged out");
        delete ctx.userId;
    }
    api.updateUser = async (id, p) => {
        //TODO 
    }
    api.loggedIn = async (ctx) => {
        if(await api.userId(ctx)) return true;
        return false;
    }
    api.requireAuth = () => {
        return async (ctx, next) => {
            if(!await api.loggedIn(ctx)) return;
            return await next();
        }
    }

    app.userApi = api;
}
