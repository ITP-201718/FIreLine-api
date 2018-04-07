const passwordHash = require('password-hash');
const autobahn = require('autobahn')
const helpers = require('../helpers')

async function register(conf) {

    async function authenticate(args) {
        let [realm, authid, details] = args
        let {ticket} = details

        console.log("Trying to authenticate '" + authid + "'")

        let [rows] = await helpers.execute(
            "SELECT `uname`, `pwd` FROM `user` WHERE `uname` = :caller OR `mail` = LOWER(:caller)",
            {caller: authid}
        )

        if(rows.length !== 1) {
            console.log("Could not authenticate user '" + authid + "': Could not find user in db")
            throw new autobahn.Error('io.fireline.error.no_such_user', ['No such user/password combination'])
        }

        let {uname: username, pwd: stored_password} = rows[0]

        if(!passwordHash.verify(ticket, stored_password)) {
            console.log("Could not authenticate user '" + authid + "': Wrong password")
            throw new autobahn.Error('io.fireline.error.no_such_user', ['No such user/password combination'])
        }

        console.log("Authenticated user '" + authid + "' as '" + username +"'")

        return {
            role: 'user',
            authid: username
        }
    }

    await helpers.s_register(conf.uri + '.authenticate', authenticate)

}

module.exports = {register}