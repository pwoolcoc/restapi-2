var Server = require("./server"),
    DB = require("./db"),
    login = require("./login"),
    config = require("./config"),
    crypto = require("crypto"),
    sessions = {},
    app = new Server({ debug: true }),
    user_db = new DB("data/users.dat"),
    config_db = new DB("data/configurations.dat");


app.sessions = sessions;
app.users = user_db;
app.configs = config_db;
var config_obj_route = /^\/configuration\/(\w+)$/;


/* Login-related endpoints */
app.post("/session", login.login(app));
app.delete(new RegExp(/^\/session\/(\w+)$/), login.logout(app));

/* Config-related endpoints */
app.get('/configuration', is_authed(config.all(app)));
app.post('/configuration', is_authed(config.create(app)));
app.get(new RegExp(config_obj_route), is_authed(config.get(app)));
app.put(new RegExp(config_obj_route), is_authed(config.update(app)));
app.delete(new RegExp(config_obj_route), is_authed(config.delete(app)));

app.serve();

function is_authed(handler) {
    return function(args) {
        var headers = args.headers;

        if (typeof headers === 'undefined') {
            return app.error(401, "Unauthorized");
        }

        var authorization = headers["authorization"];
        if (typeof authorization === 'undefined') {
            return app.error(401, "Unauthorized");
        }

        var session = app.sessions[authorization];
        if (typeof session === "undefined") {
            return app.error(401, "Unauthorized");
        }

        return handler(args);
    };
}
