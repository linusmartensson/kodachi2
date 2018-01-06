
module.exports = app => {

    app.sessionApi.register(async (ctx, state) => {

        state.profile = {
            roles: await app.userApi.getUserRoles(ctx),
            lang: await app.userApi.getLanguage(ctx),
            event: await app.userApi.getActiveEvent(ctx),

        };
        if(app.userApi.userId(ctx)){
            var user = await app.userApi.getUser(await app.userApi.userId(ctx));
            if(user){
                delete user.password;
                state.profile.user = user;
                state.profile.mainRole = await app.roleApi.getBestRole(user.id);

                state.profile.mainRole.role = "{role."+state.profile.mainRole.role+"}";

            }

        }
        await app.stringApi.translate(ctx, state.profile);


    });

};
