const autobahn = require('autobahn')
const passwordHash = require('password-hash')
const validate = require('validate.js')

const helpers = require('../../helpers')

async function register (conf) {

    /*await helpers.register_authid_mysql(conf.uri + '.get_name',
        'SELECT `name` FROM `users` WHERE `username` = :caller', 'name')*/

    await helpers.register_authid_mysql(conf.uri + '.get_vname',
        'SELECT vname FROM mitglied INNER JOIN user ON user.uid = mitglied.uid WHERE uname = :caller', 'vname')

    await helpers.register_authid_mysql(conf.uri + '.get_nname',
        'SELECT nname FROM mitglied INNER JOIN user ON user.uid = mitglied.uid WHERE uname = :caller', 'nname')

    await helpers.register_authid_mysql(conf.uri + '.get_mail',
        'SELECT `mail` FROM `user` WHERE `uname` = :caller', 'mail')

    async function setMail(args, kwargs, details) {
        args = {
            uname: details.caller_authid,
            ...kwargs
        }

        const constraints = {
            mail: {
                presence: {message: '^You must enter a mail address', allowEmpty: false},
                email: {message: '^%{value} is not a valid mail address'},
            },
            uname: {
                inDB: {table: 'user', message: '^Username does not exists'},
                presence: true,
            }
        }

        await helpers.validate(args, constraints)

        const {uname, mail} = args
        await helpers.executeUpdate('user', {uname}, {mail})

        return true
    }
    await helpers.s_register(conf.uri + '.set_mail', setMail)

    async function setVName(args, kwargs, details) {
        args = {
            uname: details.caller_authid,
            ...kwargs
        }

        const constraints = {
            vname: {
                presence: {message: '^You must enter a valid name', allowEmpty: false},
            },
            uname: {
                inDB: {table: 'user', message: '^Username does not exists'},
                presence: true,
            }
        }

        await helpers.validate(args, constraints)

        const {uname, vname} = args
        await helpers.executeUpdate('user', {uname}, {vname})

        return true
    }
    await helpers.s_register(conf.uri + '.set_vname', setVName)

    async function createUser(args, kwargs) {
        const constraints = {
            username: {
                presence: { message: '^You must pick a username' },
                notInDB: { table: 'users' }
            },
            password: {
                presence: { message: '^You must set a password' },
                length: { minimum: 8 }
            },
            confirmPassword: {
                equality: {
                    attribute: 'password',
                    message: '^Confirm password not equal to password'
                }
            },
            first_name: {
                presence: { message: '^You must pick a first name' }
            },
            last_name: {
                presence: { message: '^You must pick a first name' }
            },
            mail: {
                email: true,
                notInDB: { table: 'users' }
            },
        }

        await helpers.validate(kwargs, constraints)

        let userInsert = {
            username: kwargs.username,
            password: passwordHash.generate(kwargs.password),
            name: kwargs.first_name + ' ' + kwargs.last_name,
            mail: validate.isEmpty(kwargs.mail) ? undefined : kwargs.mail,
        }

        await helpers.executeInsert('users', userInsert)

        return true
    }
    await helpers.s_register(conf.uri + '.create_user', createUser)
}

module.exports = {register}