

module.exports = async (app) => {
    var api = {};
    app.strings = {};

    api.create_string = (name, string) => {
        app.strings[name] = string;
    };
    api.add_string = (lang, name, string, nolog) => {
        if(!app.strings[name]) app.strings[name] = {};
        app.strings[name][lang] = string;
        if(string === "" && !nolog) console.log("Empty string: "+name);
    };
    api.add_strings = (nls) => {
        for(var v in nls){
            if(!app.strings[v]) app.strings[v] = {};
            for(var q in nls[v]){
                app.strings[v][q] = nls[v][q];
            }
        }
    };

    api.get_string = (name, t) => {
        var orig = name;

        if(typeof t !== "string"){
            if(typeof t[name] !== "undefined") return t[name];
            name = name.split(".");
            while(name.length){
                if(typeof t[name[0]] == "undefined") {
                    return orig;
                }
                t = t[name[0]];
                name = name.slice(1);
            }
            return t;
        } else {
            while(name.length > 0){
                var q = app.strings[name];
                if(!q) {
                    var j = name;
                    name = name.replace(/\.[^.]*$/, "");   
                    if(j == name){
                        console.log("s('"+orig+"', '')"); 
                        return undefined;
                    }
                    continue;
                }
                return app.strings[name][t];
            }
            console.log("s('"+orig+"', '')"); 
            return undefined;
        }
    };
    api.bookParser = (v, idbase) => {
        //We assume there's a localized string here, that may or may not be a book
        if(typeof v !== "string") v = [];
        else
            v = v.split(/\r?\n/);

        var pages = [];
        var page = {id:0+idbase, tiers:[]};
        var tier = {id:0+idbase, panels:[]};
        var panel = {id:0+idbase, content:[]};
        var pos = 0;

        var parsers = {
            "!": function(s){
                var c = s.search(/[^!]/);
                if(c > 0) panel.content.push({
                    id:pos++ + idbase,
                    type:"caption",
                    strength:c,
                    text:s.slice(c)
                });
            },
            "(": function(s){
                var c = s.search(/[^(]/);
                var q = s.slice(c).split(")");
                panel.content.push({
                    id:pos++ + idbase,
                    type:"speechbubble",
                    position:c>1?"right":"left",
                    text:q[0],
                    image:q.length>1?q[1]:undefined
                });
            },
            "@": function(s){
               var c = s.search(/[^(]/);
               var q = s.slice(c).split(")");
                panel.content.push({
                    id:pos++ + idbase,
                    type:"image",
                    image:q[0]
                });
            },
            "#": function(s){
                tier.panels.push(panel);
                panel = {id:pos++ + idbase, content:[]};

                parsers["!"]("!"+s.slice(1));
            },
            "_": function(s){
                tier.panels.push(panel);
                panel = {id:pos++ + idbase, content:[]};

                page.tiers.push(tier);
                tier = {id:pos++ + idbase, panels:[]};

                parsers["!"]("!"+s.slice(1));
            },
            "|": function(s){
                tier.panels.push(panel);
                panel = {id:pos++ + idbase, content:[]};

                page.tiers.push(tier);
                tier = {id:pos++ + idbase, panels:[]};

                pages.push(page);
                page = {id:pos++ + idbase, tiers:[]};
                
                parsers["!"]("!"+s.slice(1));
            },
            "*": function(s){
                if(s.length > 1) panel.content.push({
                    id:pos++ + idbase,
                    type:"point",
                    text:s.slice(1)
                });
            },
            "": function(s){
                if(s.length > 0) panel.content.push({
                    id:pos++ + idbase,
                    type:"text",
                    text:s
                });
            }
        };


        for(var w of v){

            var p = parsers[w[0]];
            if(p) p(w); else parsers[""](w);
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

    };
    api.parse = (v, tokens) => {
        if(v.startsWith("{|")){
            var q = v.slice(2, -1);
            v = api.get_string(q, tokens);
            return api.bookParser(v&&v.length>0?v:undefined, q);
        }
        var count = 1;
        var total = 0;
        var r = v.replace(/{[^{}]+}/g, function(m){
            count++;
            m = m.slice(1, -1);
            var q = api.get_string(m, tokens);
            if(q === undefined) return m;
            return q;
        });
        return r;
    };
    api.userParse = async (ctx, v, lang) => {
        if(!lang)
            lang = await app.userApi.getLanguage(ctx);
        var w = api.parse(v, lang);
        return w;
    };

    api.translate = async (ctx, v, lang) => {
        if(!lang) lang = await app.userApi.getLanguage(ctx);
        if(v) for(var w in v) {
            if(typeof v[w] === "object") await api.translate(ctx, v[w], lang);
            if(typeof v[w] === "string") v[w] = await api.userParse(ctx, v[w], lang);
        }
    };
    
    api.parseDeep = (v, tokens) => {
        if(v) for(var w in v) {
            if(typeof v[w] === "object") api.parseDeep(v[w], tokens);
            if(typeof v[w] === "string") v[w] = api.parse(v[w], tokens);
        }
    };


    app.stringApi = api;
	
    await require("../tools/core").loader("strings", app);
};
