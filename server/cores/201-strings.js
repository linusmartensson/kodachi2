

module.exports = (app) => {
    var api = {};
    app.strings = {};

    api.create_string = (name, string) => {
        app.strings[name] = string;
    }
    api.add_string = (lang, name, string) => {
        if(!app.strings[name]) app.strings[name] = {};
        app.strings[name][lang] = string;
    }
    api.add_strings = (nls) => {
        for(var v in nls){
            if(!app.strings[v]) app.strings[v] = {};
            for(var q in nls[v]){
                app.strings[v][q] = nls[v][q];
            }
        }
    }

    api.get_string = (name, lang) => {
        var q = app.strings[name];
        if(!q) return undefined;
        return app.strings[name][lang];
    }
    api.bookParser = (v, idbase) => {
        //We assume there's a localized string here, that may or may not be a book
        if(typeof v !== 'string') return v;

        v = v.split(/\r?\n/);

        var pages = [];
        var page = {id:0, tiers:[]};
        var tier = {id:0, panels:[]};
        var panel = {id:0, content:[]};

        var parsers = {
            '!': function(s){
                var c = s.search(/[^!]/);
                if(c > 0) panel.content.push({
                    id:panel.content.length,
                    type:'caption',
                    strength:c,
                    text:s.slice(c)
                });
            },
            '(': function(s){
                var c = s.search(/[^(]/);
                var q = s.slice(c).split(')');
                panel.content.push({
                    id:panel.content.length,
                    type:'speechbubble',
                    position:c>1?'right':'left',
                    text:q[0],
                    image:q.length>1?q[1]:undefined
                });
            },
            '#': function(s){
                tier.panels.push(panel);
                panel = {id:tier.panels.length, content:[]};

                parsers['!']('!'+s.slice(1));
            },
            '_': function(s){
                tier.panels.push(panel);
                panel = {id:0, content:[]};

                page.tiers.push(tier);
                tier = {id:page.tiers.length, panels:[]};

                parsers['!']('!'+s.slice(1));
            },
            '|': function(s){
                tier.panels.push(panel);
                panel = {id:0, content:[]};

                page.tiers.push(tier);
                tier = {id:page.tiers.length, panels:[]};

                pages.push(page);
                page = {id:pages.length, tiers:[]};
            },
            '*': function(s){
                if(s.length > 1) panel.content.push({
                    id:panel.content.length,
                    type:'point',
                    text:s.slice(1)
                });
            },
            '': function(s){
                if(s.length > 0) panel.content.push({
                    id:panel.content.length,
                    type:'text',
                    text:s
                });
            }
        }


        for(var w of v){

            var p = parsers[w[0]];
            if(p) p(w); else parsers[''](w);
        }

        if(panel.content.length > 0)
            tier.panels.push(panel);
        if(tier.panels.length > 0)
            page.tiers.push(tier);
        if(page.tiers.length > 0)
            pages.push(page);

        for(var p of pages){
            p.id = idbase + p.id;
        }

        return pages;

    }
    api.parse = (v, lang) => {
        if(v.startsWith("{|")){
            var q = v.slice(2, -1);
            v = api.get_string(q, lang);
            return api.bookParser(v&&v.length>0?v:"", q);
        }
        var r = v.replace(/{[^}]+}/g, function(m){
            m = m.slice(1, -1);
            var q = api.get_string(m, lang);
            if(q === undefined) return m;
            return q;
        });
        return r;
    }
    api.userParse = async (ctx, v) => {
        var lang = await app.userApi.getLanguage(ctx);
       
        var w = api.parse(v, lang);
        return w;
    }

    api.translate = async (ctx, v) => {
        if(v) for(var w in v) {
            if(typeof v[w] === 'object') await api.translate(ctx, v[w]);
            if(typeof v[w] === 'string') v[w] = await api.userParse(ctx, v[w]);
        }
    }
    


    app.stringApi = api;
	
    require('../tools/core').loader("strings", app);
}
