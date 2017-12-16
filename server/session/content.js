
module.exports = app => {
    app.sessionApi.register(async (ctx, state) => {
        state.books = [];
        
        var content = await app.cypher('MATCH (c:Content), (s:Session) WHERE (c)<-[:HAS_ACCESS]-()-[*0..2]-(s) AND (c.lang={lang} OR NOT EXISTS(c.lang) OR c.lang="all") AND s.id={sessionId} RETURN c', {lang:await app.userApi.getLanguage(ctx), sessionId:ctx.session.localSession});
        var activeEvent = await app.userApi.getActiveEvent(ctx);

        var e = await app.userApi.getActiveEvent(ctx);

        if(e) state.books.push({group:1,id:e.id, path:e.id, title:e.name, content:app.stringApi.bookParser(e.description, e.id)});

        for(var v of content.records){
            var w = v.get('c').properties;
            if(w.event && w.event != "" && w.event != activeEvent.id){
                continue;
            }
            state.books.push({group:1,id:w.id, path:w.id, title:w.title, content:app.stringApi.bookParser(w.content, w.id)});
        } 

    });
}
