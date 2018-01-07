import https from "https";
module.exports = (app) => {

    // Login
    // Logout
    // Create account
    // Edit account
    // Forgot account details


    function query (target) {
        return new Promise((resolve, reject) => {
            const options = {
                hostname: app.ratsitkey.endpoint,
                port: 443,
                path: `/api/v1/personinformation?SSN=${target}`,
                method: "GET",
                headers: {
                    "Accept": "application/json",
                    "Authorization": app.ratsitkey.auth,
                    "Package": "personadress"
                }
            };
            console.dir(options);
            const req = https.request(options, (res) => {
                console.log("statusCode:", res.statusCode);
                console.log("headers:", res.headers);

                const body = [];
                res.on("data", (d) => {
                    body.push(d);
                });
                res.on("end", () => {
                    resolve(Buffer.concat(body).toString());
                });
                res.on("error", (e) => {
                    reject(e);
                });
            });
            req.on("error", (e) => {
                reject(e);
            });
            req.end();
        });
    }

    async function validateSsn (ssn) {
        return await query(ssn);
    }

    app.taskApi.create_task(
        "account", "add_super_role",
        ["admin"], [],
        app.taskApi.okcancel().concat({hide: true, autocancel: true, field: "role", type: "simpletext"}),
        async (inst, ctx) => {
            if (inst.response.cancel) {
                return "OK";
            }
            if (app.taskApi.emptyFields(inst)) {
                return "RETRY";
            }

            await app.roleApi.addRole(inst.data.start_data.id, inst.response.role, 2500);

            return "OK";
        }
    );
    app.taskApi.create_task(
        "account", "logout",
        ["user"], [],
        app.taskApi.okcancel().concat({onSession: true, unique: true, autocancel: true}),
        async (inst, ctx) => {
            if (inst.response.ok) {
                await app.userApi.logout(ctx);
            }
            return "OK";
        }
    );
    app.taskApi.create_task(
        "account", "login",
        ["anonymous"], [],
        app.taskApi.okcancel().concat(
            {field: "email_or_ssn", type: "text"},
            {field: "password", type: "password"},
            {unique: true, autocancel: true}
        ),
        async (inst, ctx) => {
            if (inst.response.ok) {
                const user = await app.userApi.findAccount({ssn: inst.response.email_or_ssn}) || await app.userApi.findAccount({email: inst.response.email_or_ssn});
                if (user) {
                    if (await app.userApi.tryLogin(ctx, user, inst.response.password)) {
                        return "OK";
                    }
                    inst.error = "{tasks.account.loginFailed}";
                    return "RETRY";

                }
                inst.error = "{tasks.account.noSuchUser}";
                return "RETRY";

            }
            return "OK";
        }
    );
    app.taskApi.create_task(
        "account", "register_account",
        ["anonymous"], [],
        [{field: "cancel", type: "button"}, {autocancel: true, unique: true}].concat(app.taskApi.yesno()),
        async (inst, ctx) => {
            if (inst.response.cancel) {
                return "OK";
            }

            if (inst.response.no) {
                inst.next_tasks.push("manual_ssn_details");
                inst.data.nossn = true;
                inst.data.ssn = "";
                return "OK";
            }
            inst.next_tasks.push("register_account_ssn");
            return "OK";

        }, (inst) => "OK"
    );
    app.taskApi.create_task(
        "account", "register_account_ssn",
        [], [],
        app.taskApi.okcancel().concat({field: "ssn", type: "ssn"}),
        async (inst, ctx) => {

            if (inst.response.cancel) {
                return "OK";
            }

            inst.data.ssnResult = JSON.parse(await validateSsn(inst.response.ssn));

            if (inst.data.ssnResult && inst.data.ssnResult.responseCode && inst.data.ssnResult.responseCode === "Ok") {
                const res = await app.userApi.findAccount({ssn: inst.data.ssnResult.ssn});
                if (res) {
                    inst.next_tasks.push("ssn_exists_forgot_details");
                } else {
                    inst.next_tasks.push("check_ssn_details");
                    inst.data.ssn = inst.response.ssn;
                    inst.data.givenName = inst.data.ssnResult.basic.givenName;
                    inst.data.lastName = inst.data.ssnResult.basic.lastName;
                    inst.data.street = inst.data.ssnResult.basic.street;
                    inst.data.zipCode = inst.data.ssnResult.basic.zipCode;
                    inst.data.city = inst.data.ssnResult.basic.city;
                    inst.data.country = "Sverige";
                }
            } else {
                return "RETRY";
            }
            return "OK";
        }, (inst) => "OK"
    );
    app.taskApi.create_task(
        "account", "check_ssn_details",
        [], [],
        app.taskApi.yesno(),
        async (inst) => {
            if (inst.response.yes) {
                inst.next_tasks.push("fill_user_details");
            } else {
                inst.next_tasks.push("manual_ssn_details");
            }

            return "OK";
        }
    );
    app.taskApi.create_task(
        "account", "manual_ssn_details", // e.g. for people whose preferred gender, name, etc, don't match their ssn details, or for people with bad ssn.
        [], [],
        app.taskApi.okcancel().concat(
            {field: "givenName", type: "text"},
            {field: "lastName", type: "text"},
            {field: "street", type: "text"},
            {field: "zipCode", type: "text"},
            {field: "city", type: "text"},
            {field: "country", type: "text"}
        ),
        async (inst) => {
            if (inst.response.cancel) {
                return "OK";
            }

            if (app.taskApi.emptyFields(inst)) {
                return "RETRY";
            }
            inst.data.givenName = inst.response.givenName;
            inst.data.lastName = inst.response.lastName;
            inst.data.street = inst.response.street;
            inst.data.zipCode = inst.response.zipCode;
            inst.data.city = inst.response.city;
            inst.data.country = inst.response.country;

            inst.next_tasks.push("fill_user_details");
            return "OK";
        }
    );
    app.taskApi.create_task(
        "account", "ssn_exists_forgot_details",
        [], [],
        [{field: "ok", type: "button"}],
        async (inst) => "OK"
    );
    app.taskApi.create_task(
        "account", "fill_user_details", // for email, avatar, nickname & password
        [], [],
        app.taskApi.okcancel().concat(
            {field: "nickname", type: "simpletext"},
            {field: "phone", type: "phone"},
            {field: "emergencyphone", type: "phone"},
            {field: "email", type: "email"},
            {field: "email_verify", type: "email"},
            {field: "password", type: "password"},
            {field: "password_verify", type: "password"}
        ),
        async (inst, ctx) => {
            if (inst.response.cancel) {
                return "OK";
            }
            if (inst.response.email !== inst.response.email_verify) {
                return "RETRY";
            }
            if (inst.response.password !== inst.response.password_verify) {
                return "RETRY";
            }

            if (app.taskApi.emptyFields(inst)) {
                return "RETRY";
            }

            if ((await app.userApi.findAccount({email: inst.response.email})) !== false) {
                inst.error = "{tasks.account.emailTaken}";
                return "RETRY";
            }
            if ((await app.userApi.findAccount({nickname: inst.response.nickname})) !== false) {
                inst.error = "{tasks.account.nickNameTaken}";
                return "RETRY";
            }

            inst.data.nickname = inst.response.nickname;
            inst.data.phone = inst.response.phone;
            inst.data.emergencyphone = inst.response.emergencyphone;
            inst.data.email = inst.response.email;
            inst.data.password = inst.response.password;

            await app.userApi.createUser(ctx, inst.data);

            delete inst.data.password;

            return "OK";
        }
    );
    app.taskApi.create_task(
        "account", "forgot_account_details",
        [], [],
        [],
        async (inst) => "OK"
    );

};
