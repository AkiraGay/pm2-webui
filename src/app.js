#!/usr/bin/env node

const config = require('./config')
const { setEnvDataSync } = require('./utils/env.util')
const { generateRandomString } = require('./utils/random.util')
const path = require('path');
const serve = require('koa-static');
const render = require('koa-ejs');
const koaBody = require('koa-body');
const session = require('koa-session');
const Koa = require('koa');

// Init Application

if(!config.APP_USERNAME || !config.APP_PASSWORD){
    console.log("You must first setup admin user. Run command -> npm run setup-admin-user")
    process.exit(2)
}

if(!config.APP_SESSION_SECRET){
    const randomString = generateRandomString()
    setEnvDataSync(config.APP_DIR, { APP_SESSION_SECRET: randomString})
    config.APP_SESSION_SECRET = randomString
}

// Create App Instance
const app = new Koa();
const server = require('http').createServer(app.callback());
const io = require('socket.io')(server);
const gritty = require('gritty');

server.proxy = true;
server.keys = [config.APP_SESSION_SECRET];

// Middlewares
server.use(session(app));

server.use(koaBody());

server.use(serve(path.join(__dirname, 'public')));

const router = require("./routes");
server.use(router.routes());

render(server, {
    root: path.join(__dirname, 'views'),
    layout: 'base',
    viewExt: 'html',
    cache: false,
    debug: false
});

// ---- Gritty ----
server.use(gritty());
gritty.listen(io, {
    autoRestart: true, // default
});
// ---- WebUI ----
server.listen(config.PORT, config.HOST, ()=>{
    console.log(`Application started at http://${config.HOST}:${config.PORT}`)
})
