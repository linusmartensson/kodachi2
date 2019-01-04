var bookParser = (v, idbase) => {
        //We assume there's a localized string here, that may or may not be a book
        if(typeof v !== 'string') return v;

        v = v.split(/\r?\n/);

        var pages = [];
        var page = {id:0, tiers:[]};
        var tier = {id:0, panels:[]};
        var panel = {id:0, content:[]};
        var pos = 0;

        var parsers = {
            "!" (s) {
                const c = s.search(/[^!]/);
                if (c > 0) {
                    panel.content.push({
                        id: pos++ + idbase,
                        type: "caption",
                        strength: c,
                        text: s.slice(c)
                    });
                }
            },
            "[" (s) {
                let q = s.slice(1,-1).split(',');
                const text = q[0];
                const task = q[1];
                q = q.slice(2);
                let data = {};
                for(var w of q){
                    const m = w.split(":");
                    const o = m.slice(1).join(":");
                    data[m[0]] = o;
                }
                panel.content.push({
                    id: pos++ + idbase,
                    type: "editbutton",
                    text,
                    task,
                    data
                });
            },
            "(" (s) {
                const c = s.search(/[^(]/);
                const q = s.slice(c).split(")");
                panel.content.push({
                    id: pos++ + idbase,
                    type: "speechbubble",
                    position: c > 1 ? "right" : "left",
                    text: q[0],
                    image: q.length > 1 ? q[1] : null
                });
            },
            "@" (s) {
                const q = s.slice(2).split(")");
                panel.content.push({
                    id: pos++ + idbase,
                    type: "image",
                    image: q[0]
                });
            },
            "#" (s) {
                tier.panels.push(panel);
                panel = {id: pos++ + idbase, content: []};

                parsers["!"](`!${s.slice(1)}`);
            },
            "_" (s) {
                tier.panels.push(panel);
                panel = {id: pos++ + idbase, content: []};

                page.tiers.push(tier);
                tier = {id: pos++ + idbase, panels: []};

                parsers["!"](`!${s.slice(1)}`);
            },
            "|" (s) {
                tier.panels.push(panel);
                panel = {id: pos++ + idbase, content: []};

                page.tiers.push(tier);
                tier = {id: pos++ + idbase, panels: []};

                pages.push(page);
                page = {id: pos++ + idbase, tiers: []};

                parsers["!"](`!${s.slice(1)}`);
            },
            "*" (s) {
                if (s.length > 1) {
                    panel.content.push({
                        id: pos++ + idbase,
                        type: "point",
                        text: s.slice(1)
                    });
                }
            },
            "" (s) {
                if (s.length > 0) {
                    panel.content.push({
                        id: pos++ + idbase,
                        type: "text",
                        text: s
                    });
                }
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

        for(var q of pages){
           q.id = idbase + q.id;
        }

        return pages;

    }


export default bookParser;
