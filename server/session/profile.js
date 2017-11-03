
module.exports = app => {

    app.sessionApi.register(async (ctx, state) => {

        state.profile = {
            roles: await app.userApi.getUserRoles(ctx),
            lang: await app.userApi.getLanguage(ctx),
            event: await app.userApi.getActiveEvent(ctx)
        }
        if(app.userApi.userId(ctx)){
            var user = await app.userApi.getUser(await app.userApi.userId(ctx));
            if(user){
                user = user.get('u').properties;
                delete user.password;
                state.profile.user = user;
            }

        }


    });

}
