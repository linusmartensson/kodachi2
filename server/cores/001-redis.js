import Redis from "ioredis";

class RedisStore {
    constructor (redis) {
        this.redis = redis;
    }

    async get (sid) {
        if(sid.startsWith("koa:sess:")) sid = sid.slice(9);
        const data = await this.redis.get(`koa:sess:${sid}`);
        return JSON.parse(data);
    }

    async set (sid, v, maxAge = 1000000) {
        if(sid.startsWith("koa:sess:")) sid = sid.slice(9);
        try {
            // Use redis set EX to automatically drop expired sessions
            await this.redis.set(`koa:sess:${sid}`, JSON.stringify(v), "EX", maxAge / 1000);
        } catch (e) {console.dir(e);}
        return sid;
    }

    async destroy (sid) {
        if(sid.startsWith("koa:sess:")) sid = sid.slice(9);
        return await this.redis.del(`koa:sess:${sid}`);
    }
}

module.exports = (app) => {
    console.log("Loading redis...");
    app.redis = new Redis();
    app.sessionStore = new RedisStore(app.redis);
    console.log("Redis loaded!");
};
