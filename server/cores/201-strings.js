

module.exports = async (app) => {
    const api = {};
    app.strings = {};

    api.create_string = (name, string) => {
        app.strings[name] = string;
    };
    api.add_string = (lang, name, string, nolog) => {
        if (!app.strings[name]) {
            app.strings[name] = {};
        }
        app.strings[name][lang] = string;
        if (string === "" && !nolog) {
            console.log(`Empty string: ${name}`);
        }
    };
    api.add_strings = (nls) => {
        for (const v in nls) {
            if (!app.strings[v]) {
                app.strings[v] = {};
            }
            for (const q in nls[v]) {
                app.strings[v][q] = nls[v][q];
            }
        }
    };

    api.get_string = (name, t) => {
        const orig = name;

        if (typeof t !== "string") {
            if (typeof t[name] !== "undefined") {
                return t[name];
            }
            name = name.split(".");
            while (name.length) {
                if (typeof t[name[0]] === "undefined") {
                    return orig;
                }
                t = t[name[0]];
                name = name.slice(1);
            }
            return t;
        }
        while (name.length > 0) {
            const q = app.strings[name];
            if (!q) {
                const j = name;
                name = name.replace(/\.[^.]*$/, "");
                if (j === name) {
                    console.log(`s('${orig}', '')`);
                    return null;
                }
                continue;
            }
            return app.strings[name][t];
        }
        console.log(`s('${orig}', '')`);
        return null;

    };
    api.bookParser = (v, idbase) => {
        // We assume there's a localized string here, that may or may not be a book
        if (typeof v === "string") {
            v = v.split(/\r?\n/);
        } else {
            v = [];
        }

        const pages = [];
        let page = {id: 0 + idbase, tiers: []};
        let tier = {id: 0 + idbase, panels: []};
        let panel = {id: 0 + idbase, content: []};
        let pos = 0;

        const parsers = {
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
                const c = s.search(/[^(]/);
                const q = s.slice(c).split(")");
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
        };


        for (const w of v) {

            const p = parsers[w[0]];
            if (p) {
                p(w);
            } else {
                parsers[""](w);
            }
        }

        if (panel.content.length > 0) {
            tier.panels.push(panel);
        }
        if (tier.panels.length > 0) {
            page.tiers.push(tier);
        }
        if (page.tiers.length > 0) {
            pages.push(page);
        }

        for (const p of pages) {
            p.id = idbase + p.id;
        }

        return pages;

    };
    api.parse = (v, tokens) => {
        if (v.startsWith("{|")) {
            const q = v.slice(2, -1);
            v = api.get_string(q, tokens);
            return api.bookParser(v && v.length > 0 ? v : null, q);
        }
        let count = 1;
        const total = 0;
        const r = v.replace(/{[^{}]+}/g, (m) => {
            count++;
            m = m.slice(1, -1);
            const q = api.get_string(m, tokens);
            if (q === null) {
                return m;
            }
            return q;
        });
        return r;
    };
    api.userParse = async (ctx, v, lang) => {
        if (!lang) {
            lang = await app.userApi.getLanguage(ctx);
        }
        const w = api.parse(v, lang);
        return w;
    };

    api.translate = async (ctx, v, lang) => {
        if (!lang) {
            lang = await app.userApi.getLanguage(ctx);
        }
        if (v) {
            for (const w in v) {
                if (typeof v[w] === "object") {
                    await api.translate(ctx, v[w], lang);
                }
                if (typeof v[w] === "string") {
                    v[w] = await api.userParse(ctx, v[w], lang);
                }
            }
        }
    };

    api.parseDeep = (v, tokens) => {
        if (v) {
            for (const w in v) {
                if (typeof v[w] === "object") {
                    api.parseDeep(v[w], tokens);
                }
                if (typeof v[w] === "string") {
                    v[w] = api.parse(v[w], tokens);
                }
            }
        }
    };


    app.stringApi = api;

    await require("../tools/core").loader("strings", app);
};
