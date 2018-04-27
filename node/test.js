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
<<<<<<< HEAD
        return "chrisPass"
=======
        return "davidPass"
>>>>>>> Added validate support for datatime
    } else {
        throw Error("dont know how to authenticate using '" + method + "'")
    }
}

let connection = new autobahn.Connection({
<<<<<<< HEAD
    url: "wss://chris.fireline.io/api",
    realm: 'fireline',
    authmethods: ['ticket'],
    authid: 'chris',
=======
    url: "wss://david.fireline.io/api",
    realm: 'fireline',
    authmethods: ['ticket'],
    authid: 'david',
>>>>>>> Added validate support for datatime
    onchallenge,
})

ran_create = false

connection.onopen = async (session) => {
    console.log("Autobahn connection open")

    if(ran_create) {
        return
    }

    ran_create = true

    try {
        //console.log(await session.call('io.fireline.api.profile.get_name', []))
        //console.log(await session.call('io.fireline.api.profile.get_mail', []))

<<<<<<< HEAD
        session.call('io.fireline.api.jurisdiction.create_zbereich', [], {
            name: 'Fahrmeister',
        }).then(
            function (result) {
                console.log("call", result)
            },
            function (error) {
                console.error("call", error)
=======
        session.call('io.fireline.api.activity.create_aktivitaet', [], {
            von: '2013-12-11 10:09:08',
            bis: '2013-12-11 12:09:08',
            taetigkeit: 'Test 1'
        }).then(
            function (result) {
                console.log("run", result)
            },
            function (error) {
                console.error("run", error)
>>>>>>> Added validate support for datatime
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