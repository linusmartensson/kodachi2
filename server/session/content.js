
module.exports = app => {
    app.sessionApi.register(async (ctx, state) => {
        state.books = [];
        
        var content = await app.cypher('MATCH (c:Content), (s:Session) WHERE (c)<-[:HAS_ACCESS]-()-[*0..2]-(s) AND (c.lang={lang} OR NOT EXISTS(c.lang)) AND s.id={sessionId} RETURN c', {lang:await app.userApi.getLanguage(ctx), sessionId:ctx.session.localSession});

        for(var v of content.records){
            var w = v.get('c').properties;
            state.books.push({id:w.id, path:w.id, title:w.title, content:app.stringApi.bookParser(w.content, w.id)});
        } 
    });
}
