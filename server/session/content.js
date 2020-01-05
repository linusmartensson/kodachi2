
module.exports = (app) => {
    app.sessionApi.register(async (ctx, state) => {
        state.books = [];

        const content = await app.cypher("MATCH (c:Content), (s:Session {id:{sessionId}}) WHERE ((c)<-[:HAS_ACCESS]-(:Role)<-[:HAS_ROLE]-(:User)-[:HAS_SESSION]->(s) OR (c)<-[:HAS_ACCESS]-(:Role)<-[:HAS_ROLE]-(s)) AND (c.lang={lang} OR NOT EXISTS(c.lang) OR c.lang=\"all\") RETURN c", {lang: await app.userApi.getLanguage(ctx), sessionId: ctx.session.localSession});
        const activeEvent = await app.userApi.getActiveEvent(ctx);

        const e = await app.userApi.getActiveEvent(ctx);

/*        if (e) {
            state.books.push({group: 1, id: e.id, path: e.id, title: e.name, content: app.stringApi.bookParser(e.description, e.id)});
        }*/

        for (const v of content.records) {
            const w = v.get("c").properties;
            if (w.event && w.event !== "" && w.event !== activeEvent.id) {
                continue;
            }
            state.books.push({group: 1, id: w.id, path: w.id, title: w.title, content: app.stringApi.bookParser(w.content, w.id)});
        }

    });
};
