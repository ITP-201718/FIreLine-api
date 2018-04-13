const config = require('./config')
const mysql = require('mysql2/promise')
const fs = require('fs')
const path_module = require('path')
const { sleep } = require('./globalHelpers')
const winston = require('winston')

//AUTOBAHN_DEBUG = true
const autobahn = require('autobahn')

let logger = null
let sql_connection = null
let sql_interval = null
let autobahn_connection = null
let session = null

async function connectWamp() {
    console.log("Trying to connect to " + config.wamp.url)
    return new Promise((resolve, reject) => {
        let onchallenge = (session, method, extra) => {
            if(method === 'wampcra') {
                return autobahn.auth_cra.sign(config.wamp.password, extra.challenge)
            } else {
                reject("dont know how to authenticate using '" + method + "'")
            }
        }

        let connection = new autobahn.Connection({
            url: config.wamp.url,
            realm: config.wamp.realm,
            authmethods: ['wampcra'],
            authid: config.wamp.user,
            onchallenge,
        })

        connection.onopen = (session) => {
            resolve([connection, session])
        }
        connection.onclose = (reason, details) => {
            console.log(reason, details)
            reject(reason)
        }

        connection.open()
    })
}

async function connectSql() {
    sql_connection = await mysql.createConnection({ ...config.mysql, namedPlaceholders: true})
    console.log("Connected to Mysql")

    sql_interval = setInterval(async () => {
        try {
            await sql_connection.ping()
        } catch (e) {
            console.log('Connection to mysql lost. Trying to reconnect')
            sql_connection = null
            clearInterval(sql_interval)
            connectSql()
        }
    }, 1000)
}

async function loadModules(path, base_uri) {
    let stat = fs.lstatSync(path)
    let base_cfg = {
        ab_session: session,
        sql_connection,
        logger,
    }

    if(stat.isDirectory()) {
        let files = fs.readdirSync(path)
        files = files.map((_in) => {
            return {name: _in, path: path_module.join(path, _in), stats: fs.lstatSync(path_module.join(path, _in))}
        })
        files.sort((a, b) => {
            if(a.stats.isFile() && b.stats.isDirectory()) {
                return -1
            }
            if(a.stats.isDirectory()) {
                return 1
            }
            return (a.stats.name < a.stats.name) ? -1 : (a.stats.name > b.stats.name) ? 1 : 0;
        })
        for(let i in files) {
            let next_uri = base_uri
            if(files[i].stats.isDirectory()) {
                next_uri += '.' + files[i].name
            }
            await loadModules(files[i].path, next_uri)
        }
    } else {
        try {
            console.log('Require:', path)
            let conf = {
                ...base_cfg,
                base_uri: config.wamp.base_uri,
                uri: base_uri,
            }
            let pathReg = require(path).register
            if(typeof pathReg === 'function')
                await require(path).register(conf)
        } catch (err) {
            console.error("Could not require ", path)
            console.error(err)
        }
    }
}

const { generateSetSet, generateCheckSet } = require('./wamp/helpers')

async function connect() {

    let ArgumentParser = require('argparse').ArgumentParser
    let parser = new ArgumentParser({
        addHelp: true,
        description: 'FireLine Api'
    })
    parser.addArgument(
        ['-v', '--verbose'],
        {
            help: 'Activates verbose logging',
            action: 'storeTrue',
        }
    )
    let args = parser.parseArgs()

    logger = new (winston.Logger)({
        transports: [
            new (winston.transports.Console)({
                name: 'console',
                level: args.verbose ? 'verbose' : 'warn'
            }),
            new (winston.transports.File)({
                name: 'error-file',
                filename: 'error.log',
                level: 'silly'
            })
        ]
    })

    // Wait for crossbar to start in docker-compose
    await sleep(5000)

    await connectSql()

    let [_autobahn_connection, _session] = await connectWamp()
    autobahn_connection = _autobahn_connection
    session = _session
    console.log("Connected to WAMP")

    const DIR = path_module.join(__dirname, 'wamp');
    await loadModules(DIR, config.wamp.base_uri);

    // Emergency add user
    /*setTimeout(() => {
        session.call('io.fireline.api.profile.create_user', [], {
            username: 'david',
            password: 'davidPass',
            first_name: 'David',
            last_name: 'Langheiter',
            mail: 'david@langheiter.com',
        }).then(
            function (result) {
                console.log("create_user", result)
            },
            function (error) {
                console.error("create_user", error)
            }
        )
    }, 5000)*/
}


// Close connections on ctrl+c / SIGINT
if (process.platform === "win32") {
    let rl = require("readline").createInterface({
        input: process.stdin,
        output: process.stdout
    });

    rl.on("SIGINT", function () {
        process.emit("SIGINT");
    });
    rl.on("SIGTERM", function () {
        process.emit("SIGTERM");
    })
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

function shutdown() {
    console.log()
    if(autobahn_connection)
        autobahn_connection.close()
    console.log('Closed wamp connection')
    if(sql_connection)
        sql_connection.close()
    console.log('Closed sql connection')
    //graceful shutdown
    process.exit();
}

connect().catch(console.error)