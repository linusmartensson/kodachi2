

module.exports = (app) => {

    app.cypher('DETACH DELETE (s:Session)'); //On server boot, delete all sessions.

    var patcher = require('jsondiffpatch').create({
        objectHash: (obj) => {
            return obj.id || obj._id;
        }
    });
    var api = {};

    //Core function for updating live clients.
    api.notifySessions = async (ss) => {
        try{
        for(var s of ss){
            if(app.clients[s]){
                for(var id in app.clients[s]){
                    var ctx = app.clients[s][id];
                    var current = await api.buildSession(ctx);
                    var patch = patcher.diff(ctx.session.state, current);
                    ctx.socket.emit('update', patch);
                    ctx.session.state = current;
                }
            }
        }
        }catch(e){
            console.dir(e);
        }
    }
        
    //Build a complete session state -> The data we send to the client.
    api.buildSession = async (ctx) => {//TODO
        //Pages
        //Tasks
        //Tools
        //State
    
        //Pick out accessible tasks.
        var tools = [];
        var roles = await app.userApi.getUserRoles(ctx);
        for(var t in app.tasks){
            var rs = app.tasks[t].starter_roles;
            for(let v of rs){
                if(roles.includes(v)){
                    tools.push({id:t, task:t, title:app.tasks[t].task_name});
                    break;
                }
            }
        }
        //----------------------
    
        var tasks = [];
        var s = (await app.cypher("MATCH (t:Task)-[:HANDLED_BY]->()-[*0..2]-(s:Session) WHERE s.id={id} RETURN t", {id:ctx.session.localSession})).records;
        
        for(let q of s){
            var task = JSON.parse(q.get('t').properties.data);
            task.type = app.tasks[task.task_name];
            tasks.push(task);
        }


        var state = {
            tools,
            tasks,
            profile:{

            },
            books:[
            {id:0, path:'my-test-book', title:'My test book', content:[
                {id:0, tiers:[
                    {
                        id:0, 
                        panels:[
                        {id:0,content:[
                            {id:0, type:'caption', text:"Hallå där!"},
                            {id:11, type:'speechbubble', position:'left', text:"Mwahaa! Det blir bättre med mer text!", image:"/img/kodachi_lores2.png"},
                            {id:111, type:'speechbubble', position:'right', text:"Mwahaa!", image:"/img/kodachi_lores2.png"},
                            {id:2, type:'text', text:"Lorem ipsum dolor sit amet"},
                            {id:3, type:'text', text:"Nu är det dags för version 2.0 av Kodachicon! Jag har ingen aning om hur det här kommer att sluta, men. woop nu kör vi!"},
                            {id:30, type:'text', text:"Nu är det dags för version 2.0 av Kodachicon! Jag har ingen aning om hur det här kommer att sluta, men. woop nu kör vi!"},
                            {id:31, type:'text', text:"Nu är det dags för version 2.0 av Kodachicon! Jag har ingen aning om hur det här kommer att sluta, men. woop nu kör vi!"},
                            {id:22, type:'clear'},
                            {id:4, type:'text', text:"Nu är det dags för version 2.0 av Kodachicon! Jag har ingen aning om hur det här kommer att sluta, men woop nu kör vi!"},

                            {id:5, type:'caption', text:"Hallå där!"},
                            {id:8, type:'speechbubble', position:'left', text:"Woop! Om det bara fanns glass så hade jag varit lycklig!", image:"/img/kodachi_lores2.png"},
                            {id:6, type:'text', text:"Nu är det dags för version 2.0 av Kodachicon! Jag har ingen aning om hur det här kommer att sluta, men wo--op nu kör vi!"},
                            {id:7, type:'text', text:"Nu är det dags för version 2.0 av Kodachicon! Jag har ingen aning om hur det här kommer att sluta, men woop nu kör vi!"},
                            {id:9, type:'text', text:"Nu är det dags för version 2.0 av Kodachicon! Jag har ingen aning om hur det här kommer att sluta, men woop nu kör vi!"},
                            {id:10, type:'text', text:"Nu är det dags för version 2.0 av Kodachicon! Jag har ingen aning om hur det här kommer att sluta, men woop--- nu kör vi!"},
                        ],width:32,border:true}


                        ]
                    },
                    {
                        id:2,
                        panels:[{id:0, border:false, content:[{id:0, type:'speechbubble', image:'/img/kodachi_lores2.png', text:'Hey there! Jag hoppar bara in här i mitten och tar en massa plats!'}]}]
                    },
                    {
                        id:1,
                        panels:[
                        {id:1,content:[
                            {id:0, type:'caption', text:"Hallå där!"},
                            {id:2, type:'text', text:"Nu är det dags för version 2.0 av Kodachicon! Jag har ingen aning om hur det här kommer att sluta, men woop nu kör vi!"},
                            {id:3, type:'text', text:"Nu är det dags för version 2.0 av Kodachicon! Jag har ingen aning om hur det här kommer att sluta, men. woop nu kör vi!"},
                            {id:4, type:'text', text:"Nu är det dags för version 2.0 av Kodachicon! Jag har ingen aning om hur det här kommer att sluta, men woop nu kör vi!"},
                            {id:5, type:'caption', text:"Hallå där!"},
                            {id:6, type:'text', text:"Nu är det dags för version 2.0 av Kodachicon! Jag har ingen aning om hur det här kommer att sluta, men wo--op nu kör vi!"},
                            {id:7, type:'text', text:"Nu är det dags för version 2.0 av Kodachicon! Jag har ingen aning om hur det här kommer att sluta, men woop nu kör vi!"},
                            {id:9, type:'text', text:"Nu är det dags för version 2.0 av Kodachicon! Jag har ingen aning om hur det här kommer att sluta, men woop nu kör vi!"},
                            {id:10, type:'text', text:"Nu är det dags för version 2.0 av Kodachicon! Jag har ingen aning om hur det här kommer att sluta, men woop--- nu kör vi!"},
                        ],width:62,border:true}
                        ,{id:2,content:[
                            {id:0, type:'caption', text:"Hallå där!"},
                            {id:2, type:'text', text:"Nu är det dags för version 2.0 av Kodachicon! Jag har ingen aning om hur det här kommer att sluta, men woop nu kör vi!"},
                            {id:3, type:'text', text:"Nu är det dags för version 2.0 av Kodachicon! Jag har ingen aning om hur det här kommer att sluta, men. woop nu kör vi!"},
                            {id:4, type:'text', text:"Nu är det dags för version 2.0 av Kodachicon! Jag har ingen aning om hur det här kommer att sluta, men woop nu kör vi!"},
                            {id:5, type:'caption', text:"Hallå där!"},
                            {id:6, type:'text', text:"Nu är det dags för version 2.0 av Kodachicon! Jag har ingen aning om hur det här kommer att sluta, men wo--op nu kör vi!"},
                            {id:7, type:'text', text:"Nu är det dags för version 2.0 av Kodachicon! Jag har ingen aning om hur det här kommer att sluta, men woop nu kör vi!"},
                            {id:8, type:'speechbubble', position:'right', text:"Woop! Om det bara fanns glass så hade jag varit lycklig!", image:"/img/kodachi_lores2.png"},
                            {id:9, type:'text', text:"Nu är det dags för version 2.0 av Kodachicon! Jag har ingen aning om hur det här kommer att sluta, men woop nu kör vi!"},
                            {id:10, type:'text', text:"Nu är det dags för version 2.0 av Kodachicon! Jag har ingen aning om hur det här kommer att sluta, men woop--- nu kör vi!"},
                        ],width:62,border:true}
                        ]
                    }
                    ]}
                ]}
            
            ]
        }
        return state;

    }

    app.sessionApi = api;
}
