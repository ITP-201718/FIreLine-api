const autobahn = require('autobahn')
const passwordHash = require('password-hash')
const validate = require('validate.js')

const helpers = require('../../helpers')

async function register (conf) {

    /*await helpers.register_authid_mysql(conf.uri + '.get_name',
        'SELECT `name` FROM `users` WHERE `username` = :caller', 'name')*/

    await helpers.register_authid_mysql(conf.uri + '.get_vname',
        'SELECT vname FROM user WHERE uname = :caller', 'vname')

    await helpers.register_authid_mysql(conf.uri + '.get_nname',
        'SELECT nname FROM user WHERE uname = :caller', 'nname')

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
                presence: {allowEmpty: false},
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

    async function setNName(args, kwargs, details) {
        args = {
            uname: details.caller_authid,
            ...kwargs
        }

        const constraints = {
            nname: {
                presence: {message: '^You must enter a valid name', allowEmpty: false},
            },
            uname: {
                inDB: {table: 'user', message: '^Username does not exists'},
                presence: true,
            }
        }

        await helpers.validate(args, constraints)

        const {uname, nname} = args
        await helpers.executeUpdate('user', {uname}, {nname})

        return true
    }
    await helpers.s_register(conf.uri + '.set_nname', setNName)

    async function createUser(args, kwargs) {
        const constraints = {
            username: {
                presence: { message: '^You must pick a username' },
                notInDB: { table: 'user', row: 'uname' }
            },
            password: {
                presence: { message: '^You must set a password' },
                length: { minimum: 8, row: 'pwd' }
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
                notInDB: { table: 'user' }
            },
        }

        await helpers.validate(kwargs, constraints)

        let userInsert = {
            uname: kwargs.username,
            vname: kwargs.first_name,
            nname: kwargs.last_name,
            pwd: passwordHash.generate(kwargs.password),
            mail: validate.isEmpty(kwargs.mail) ? undefined : kwargs.mail,
        }

        await helpers.executeInsert('user', userInsert)

        return true
    }
    await helpers.s_register(conf.uri + '.create_user', createUser)
}

module.exports = {register}