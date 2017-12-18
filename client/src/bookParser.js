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
            '!': function(s){
                var c = s.search(/[^!]/);
                if(c > 0) panel.content.push({
                    id:pos++,
                    type:'caption',
                    strength:c,
                    text:s.slice(c)
                });
            },
            '(': function(s){
                var c = s.search(/[^(]/);
                var q = s.slice(c).split(')');
                panel.content.push({
                    id:pos++,
                    type:'speechbubble',
                    position:c>1?'right':'left',
                    text:q[0],
                    image:q.length>1?q[1]:undefined
                });
            },
            '#': function(s){
                tier.panels.push(panel);
                panel = {id:pos++, content:[]};

                parsers['!']('!'+s.slice(1));
            },
            '_': function(s){
                tier.panels.push(panel);
                panel = {id:pos++, content:[]};

                page.tiers.push(tier);
                tier = {id:pos++, panels:[]};

                parsers['!']('!'+s.slice(1));
            },
            '|': function(s){
                tier.panels.push(panel);
                panel = {id:pos++, content:[]};

                page.tiers.push(tier);
                tier = {id:pos++, panels:[]};

                pages.push(page);
                page = {id:pos++, tiers:[]};
            },
            '*': function(s){
                if(s.length > 1) panel.content.push({
                    id:pos++,
                    type:'point',
                    text:s.slice(1)
                });
            },
            '': function(s){
                if(s.length > 0) panel.content.push({
                    id:pos++,
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

        for(var q of pages){
           q.id = idbase + q.id;
        }

        return pages;

    }


export default bookParser;
