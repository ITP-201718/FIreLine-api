/*let passwordHash = require('password-hash')
let mysql = require('mysql2')

let con = mysql.createConnection({
    host: 'fireline.thekingdave.com',
    database: 'fireline_test',
    user: 'fireline',
    password: 'v;6!ixoBon@C08IC+h@8m/&o=!V^4rrCsw=U`G1VVZaZ&6V7b3',
})

con.connect(function (err) {
    if (err) throw err;
    console.log('Connected!')
})*/

AUTOBAHN_DEBUG = false;

let autobahn = require('autobahn')

let onchallenge = (session, method, extra) => {
    if(method === 'wampcra') {
        //return autobahn.auth_cra.sign("f8K8A^5QkM@j}Dgmp\"rq'{R97y94f/8+", extra.challenge)
        return autobahn.auth_cra.sign("123sekret", extra.challenge)
    } else if (method === 'ticket') {
        return "davidPass"
    } else {
        throw Error("dont know how to authenticate using '" + method + "'")
    }
}

let connection = new autobahn.Connection({
    url: "wss://fireline.io:8080/api",
    realm: 'fireline',
    authmethods: ['ticket'],
    authid: 'david',
    onchallenge,
})

connection.onopen = async (session) => {
    console.log("Autobahn connection open")

    try {
        //console.log(await session.call('io.fireline.api.profile.get_name', []))
        //console.log(await session.call('io.fireline.api.profile.get_mail', []))

        session.call('io.fireline.api.profile.create_user', [], {
            username: 'oguz',
            password: 'oguzPass',
            confirmPassword: 'oguzPass',
            first_name: 'Oguzhan',
            last_name: 'Guenguer',
            mail: 'hallo@test.txtx',
        }).then(
            function (result) {
                console.log("create_user", result)
            },
            function (error) {
                console.error("create_user", error)
            }
        )

        /*console.log(await session.call('io.fireline.api.profile.set_mail', [], {mail: 'david@langheiter.com'}))
        console.log(await session.call('io.fireline.api.profile.get_mail', []))
        console.log(await session.call('io.fireline.api.profile.set_name', [], {name: 'David Langheiter'}))
        console.log(await session.call('io.fireline.api.profile.get_name', []))*/
    } catch (err) {
        console.error(err)
    }

}

connection.onclose = (reason, details) => {
    console.log(reason, details)
}

connection.open()


// Close connections on ctrl+c / SIGINT
if (process.platform === "win32") {
    let rl = require("readline").createInterface({
        input: process.stdin,
        output: process.stdout
    });

    rl.on("SIGINT", function () {
        process.emit("SIGINT");
    });
}

process.on("SIGINT", function () {
    connection.close()
    //graceful shutdown
    process.exit();
});