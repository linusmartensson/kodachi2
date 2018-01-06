
module.exports = (app) => {

    app.sessionApi.register(async (ctx, state) => {

        state.profile = {
            roles: await app.userApi.getUserRoles(ctx),
            lang: await app.userApi.getLanguage(ctx),
            event: await app.userApi.getActiveEvent(ctx)

        };
        if (await app.userApi.userId(ctx)) {
            const user = await app.userApi.getUser(await app.userApi.userId(ctx));
            if (user) {
                delete user.password;
                state.profile.user = user;
                state.profile.mainRole = await app.roleApi.getBestRole(user.id);

                state.profile.mainRole.role = `{role.${state.profile.mainRole.role}}`;

            }

            var achievements = await app.roleApi.getAchievements(user.id);
            var achievementList = [{
                id:0,
                type:'caption',
                text:'{profile.achievements}'
            }];
            
            for(const v in achievements){
                const a = achievements[v];
                if(a.achieved) {
                    achievementList.push({
                        id:achievementList.length,
                        type:"text",
                        text: `{achievement.${a.achievement}} - CHECK!`
                    })
                } else {
                    achievementList.push({
                        id:achievementList.length,
                        type:"text",
                        text: `{achievement.${a.achievement}} - ${a.points}/${a.req}`
                    })

                }
            }
            var roles = await app.roleApi.getAllRoles(user.id);
            var roleList = [{
                id:0,
                type:'caption',
                text:'{profile.roles}'
            }];
            for(var v in roles){
                if(roles[v].role.match(/\./) !== null) continue;
                roleList.push({
                    id:roleList.length,
                    type:"text",
                    text: `{role.${roles[v].role}} - Level ${roles[v].level}`
                })
            }

            state.profile.content = [
                {//page 1
                    id:0,
                    tiers:[
                        {id:0,
                            panels:[
                                {
                                    id:0,
                                    content:[{id:0, type:"text", text:"Tjohej! Här kommer att dyka upp mer info inom kort, men tillsvidare kan du se vad du lyckats hitta på hittills här på kodachi.se!"}]
                                }
                            ]
                        },
                        {//tier 2
                            id:1,
                            panels:[
                                {//panel 1
                                    id:0,
                                    content:roleList
                                },
                                {
                                    id:1,
                                    content:achievementList
                                }
                            ] 
                        }
                    ]
                }
            ];


        } else {

            state.profile.content = [
                {//page 1
                    id:0,
                    tiers:[
                        {//tier 1
                            id:1,
                            panels:[
                                {//panel 1
                                    id:0,
                                    content:[{id:0, type:"text", text:"När du är medlem på kodachi.se så dyker din profil upp här! Den är jättecool!"}]
                                }
                            ] 
                        }
                    ]
                }
            ];
        }

        await app.stringApi.translate(ctx, state.profile);


    });

};
