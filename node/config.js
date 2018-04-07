const config = {
    mysql: {
        //host: 'localhost',
        host: 'fireline.io',
        database: 'fireline',
        user: 'fireline',
        password: 'v;6!ixoBon@C08IC+h@8m/&o=!V^4rrCsw=U`G1VVZaZ&6V7b3',
        port: 3306,
    },
    wamp: {
        url: 'wss://fireline.io:8080/server',
        realm: 'fireline',
        user: 'server',
        //password: 'f8K8A^5QkM@j}Dgmp"rq\'{R97y94f/8+'
        password: 'server',
        base_uri: 'io.fireline'
    },
}

module.exports = config