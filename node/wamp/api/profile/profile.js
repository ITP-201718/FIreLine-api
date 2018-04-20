const autobahn = require('autobahn')
const passwordHash = require('password-hash')
const validate = require('validate.js')

const helpers = require('../../helpers')

async function register (conf) {

    await helpers.register_authid_mysql(conf.uri + '.get_vname',
        'SELECT vname FROM user WHERE uname = :caller', 'vname')

    await helpers.register_authid_mysql(conf.uri + '.get_nname',
        'SELECT nname FROM user WHERE uname = :caller', 'nname')

    await helpers.register_authid_mysql(conf.uri + '.get_mail',
        'SELECT `mail` FROM `user` WHERE `uname` = :caller', 'mail')

    /**
     * Set mail of the current user
     * @param args
     * @param kwargs
     * @param details
     * @returns {Promise<boolean>}
     */
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

    /**
     * Set firstname of the current user
     * @param args
     * @param kwargs
     * @param details
     * @returns {Promise<boolean>}
     */
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

    /**
     * Set lastname of the current user
     * @param args
     * @param kwargs
     * @param details
     * @returns {Promise<boolean>}
     */
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

    /**
     * Set the gender of the User
     * @param args
     * @param kwargs
     * @param details
     * @returns {Promise<boolean>}
     */
    async function setGeschlecht(args, kwargs, details) {

        args = {
            uname: details.caller_authid,
            ...kwargs
        }

        const constraints = {
            gender: {
                presence: {message: '^You must choose a gender', allowEmpty: false},
                length: {is: 1},
            },
            uname: {
                inDB: {table: 'user', message: '^Username does not exists'},
                presence: true,
            }
        }

        await helpers.validate(args, constraints)
        
        const {uname, gender} = args
        await helpers.executeUpdate(helpers.createJoinedTable('user', 'mitglied', 'uid'), {uname}, {geschlecht: gender})
        
        return true
    }
    helpers.s_register(conf.uri + '.set_gender', setGeschlecht)

    async function  setGebDat(args, kwargs, details) {
        args = {
            uname: details.caller_authid,
            ...kwargs
        }

        const constraints = {
            gebdat: {
                presence: {message: '^You must choose a date of birth' },
                date: true,
            },
            uname: {
                inDB: {table: 'user', message: '^Username does not exists' },
                presence: true,
            }
        }

        await helpers.validate(args, constraints)

        const {uname, gebdat} = args
        await helpers.executeUpdate(helpers.createJoinedTable('user', 'mitglied', 'uid'), {uname}, {gebdat})

        return true
    }

    async function setZugehoerigkeit(args, kwargs, details) {
        args = {
            uname: details.caller_authid,
            ...kwargs
        }

        const constraints = {
            zugehoerigkeit: {
                presence: { message: '^You must choose a membership' }
            },
            uname: {
                inDB: {table: 'user', message: '^Username does not exists' },
                presence: true,
            }
        }

        await helpers.validate(args, constraints)

        const {uname, zugehoerigkeit} = args
        await helpers.executeUpdate(helpers.createJoinedTable('user', 'mitglied', 'uid'), {uname}, {zugehoerigkeit})

        return true
    }

    /**
     * Creates a new user
     * @param args
     * @param kwargs
     * @returns {Promise<boolean>}
     */
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
            geschlecht: {
                presence: { message: '^You must pick a gender' },
                inclusion: {
                    within: ['m','w','o'],
                    message: '^You must pick a valid gender'
                }
            },
            gebdat: {
                presence: { message: '^You must pick a birth date' },
                date: true,
            },
            zugehoerigkeit: {
                presence: { message: '^You must pick a membership' }
            }
        }

        await helpers.validate(kwargs, constraints)

        let userInsert = {
            uname: kwargs.username,
            vname: kwargs.first_name,
            nname: kwargs.last_name,
            pwd: passwordHash.generate(kwargs.password),
            mail: validate.isEmpty(kwargs.mail) ? undefined : kwargs.mail,
        }

        await conf.sql_connection.beginTransaction()
        await helpers.executeInsert('user', userInsert)
        await helpers.executeInsert('mitglied', {
            uid: {raw: true, value: 'LAST_INSERT_ID()'},
            gebdat: kwargs.gebdat,
            zugehoerigkeit: kwargs.zugehoerigkeit,
            geschlecht: kwargs.gender,
        })
        try {
            await conf.sql_connection.commit();
        } catch (e) {
            await conf.sql_connection.rollback();
            throw new Error('io.fireline.error.internal_server_error', ['Internal server error (1020)'])
        }

        return true
    }
    await helpers.s_register(conf.uri + '.create_user', createUser)
}

module.exports = {register}