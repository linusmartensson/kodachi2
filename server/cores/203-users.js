
import bcrypt from 'bcrypt'

module.exports = (app) => {

    var api = {};

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
        return userRoles.records.length>0?user.records:undefined;
    }
    api.getUserRoles = async (ctx) => {
        return api.getRoles(api.userId(ctx));
    }
    api.hasAnyRole = async (id, roles) => {
        var userRoles = await api.getRoles(id);
        for(let v of roles){
            if(userRoles.includes(v)) return true;
        }
        return false;
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

        //Find a session associated with current user
        var u = api.userId(ctx);
        if(u) {
            var cs = await app.cypher(
                    'MATCH (u:User)-[:HAS_SESSION]->(s:Session) WHERE u.id={id} AND NOT EXISTS(s.insecure) RETURN s.id',
                    {id:id});
            cs = cs.records.length>0?cs.records[0].get('s.id'):undefined;
            ctx.session.localSession = cs;
            if(cs) return cs;
        }
        //Create a new session
        var id = app.uuid() + app.uuid() + app.uuid();
        await app.cypher("CREATE (:Session {id:{id}})", {id:id});

        //If necessary, associate new session with user
        if(u){
            await app.cypher('CREATE (u:User)-[:HAS_SESSION]->(s:Session) WHERE u.id={userId} AND s.id={sessionId}', {userId:u, sessionId:id});
        }
        ctx.session.localSession = id;
        return id;
    }
    api.userId = (ctx) => {
        return ctx.session.userId;
    }
    api.createUser = async (ctx, p) => {

        //ssn, ssnDetails, avatar, nickname, email, password
        var password = await hash(p.password);

        app.cypher('CREATE (u:User)')//TODO 
            

        //Ensure new user and session are associated.
        await app.cypher('CREATE (u:User)-[:HAS_SESSION]->(s:Session) WHERE u.id={userId} AND s.id={sessionId}', {userId:api.userId(ctx), sessionId:api.session(ctx)});
    }
    api.updateUser = async (id, p) => {
        //TODO 
    }
    api.findAccount = async (p) => {
            //TODO 
    }
    api.tryLogin = async (ctx, user, password) => {
        //login account

        var pwCheck = await compare(password, user.password); 
        if(!pwCheck) return false;

        ctx.session.userId = user.id;
        //associate current session with user
        await app.cypher('CREATE (u:User)-[:HAS_SESSION]->(s:Session) WHERE u.id={userId} AND s.id={sessionId}', {userId:api.userId(ctx), sessionId:api.session(ctx)});
        
    }
    api.logout = async (ctx) => {
        ctx.session = {};
    }
    api.loggedIn = (ctx) => {
        if(api.userId(ctx)) return true;
        return false;
    }
    api.requireAuth = () => {
        return async (ctx, next) => {
            if(!api.loggedIn(ctx)) return;
            return next();
        }
    }

    app.userApi = api;
}
