const autobahn = require('autobahn')
const passwordHash = require('password-hash')
const validate = require('validate.js')

const helpers = require('../../helpers')

/**
 * Profile
 * @param {object} conf Populated by index.js
 */
class Profile {
    constructor(conf) {
        this.conf = conf
    }

    /**
     * Set mail of the current user
     * @param args
     * @param kwargs
     * @param details
     * @returns {Promise<boolean>}
     */
    static async setMail(args, kwargs, details) {
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

    /**
     * Set firstname of the current user
     * @param args
     * @param kwargs
     * @param details
     * @returns {Promise<boolean>}
     */
    static async setVName(args, kwargs, details) {
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

    /**
     * Set lastname of the current user
     * @param args
     * @param kwargs
     * @param details
     * @returns {Promise<boolean>}
     */
    static async setNName(args, kwargs, details) {
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

    /**
     * Set the gender of the User
     * @param args
     * @param kwargs
     * @param details
     * @returns {Promise<boolean>}
     */
    static async setGeschlecht(args, kwargs, details) {

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

    static async setGebDat(args, kwargs, details) {
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

        const {gebdat, uname} = args
        await helpers.executeUpdate(helpers.createJoinedTable('user', 'mitglied', 'uid'), {uname}, {gebdat})

        return true
    }

    static async setZugehoerigkeit(args, kwargs, details) {
        args = {
            uname: details.caller_authid,
            ...kwargs
        }

        const constraints = {
            zugehoerigkeit: {
                presence: {message: '^You must choose a membership'}
            },
            uname: {
                inDB: {table: 'user', message: '^Username does not exists'},
                presence: true,
            }
        }

        await helpers.validate(args, constraints)

        const {uname, zugehoerigkeit} = args
        await helpers.executeUpdate(helpers.createJoinedTable('user', 'mitglied', 'uid'), {uname}, {zugehoerigkeit})

        return true
    }

    /**
     * Creates a new usery
     * @uri: testing
     * @param {Array} args Populated by Autobahn
     * @param {Object} kwargs Populated by Autobahn
     * @param {String} kwargs.username User's username
     * @param {String} kwargs.password User's password
     * @param {String} kwargs.confirm_password User's confirm password
     * @param {String} kwargs.first_name User's first name
     * @param {String} kwargs.last_name User's last name
     * @param {String} kwargs.mail User's email
     * @param {String} kwargs.geschlecht User's gender. Must be one of [m, f, o]
     * @param {Date} kwargs.gebdat User's birth date
     * @param {String} kwargs.zugehoerigkeit User's affiliation
     * @returns {Promise<boolean>} True for Autobahn
     */
    static async createUser(args, kwargs) {
        const constraints = {
            username: {
                presence: {message: '^You must pick a username'},
                notInDB: {table: 'user', row: 'uname'}
            },
            password: {
                presence: {message: '^You must set a password'},
                length: {minimum: 8, row: 'pwd'}
            },
            confirm_password: {
                equality: {
                    attribute: 'password',
                    message: '^Confirm password not equal to password'
                }
            },
            first_name: {
                presence: {message: '^You must pick a first name'}
            },
            last_name: {
                presence: {message: '^You must pick a first name'}
            },
            mail: {
                email: true,
                notInDB: {table: 'user', message: '^Email does already exist'}
            },
            geschlecht: {
                presence: {message: '^You must pick a gender'},
                inclusion: {
                    within: ['m', 'w', 'o'],
                    message: '^You must pick a valid gender'
                }
            },
            gebdat: {
                presence: {message: '^You must pick a birth date'},
                date: true,
            },
            zugehoerigkeit: {
                presence: {message: '^You must pick a membership'}
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

    /**
     * Registers methods to Autobahn
     * @returns {Promise<void>}
     */
    async register() {
        await helpers.register_authid_mysql(conf.uri + '.get_vname',
            'SELECT vname FROM user WHERE uname = :caller', 'vname')

        await helpers.register_authid_mysql(conf.uri + '.get_nname',
            'SELECT nname FROM user WHERE uname = :caller', 'nname')

        await helpers.register_authid_mysql(conf.uri + '.get_mail',
            'SELECT `mail` FROM `user` WHERE `uname` = :caller', 'mail')

        await helpers.s_register(conf.uri + '.set_mail', Profile.setMail)
        await helpers.s_register(conf.uri + '.set_vname', Profile.setVName)
        await helpers.s_register(conf.uri + '.set_nname', Profile.setNName)
        await helpers.s_register(conf.uri + '.set_gender', Profile.setGeschlecht)
        await helpers.s_register(conf.uri + '.set_gebdat', Profile.setGebDat)
        await helpers.s_register(conf.uri + '.set_Zugehoerigkeit', Profile.setZugehoerigkeit)
        await helpers.s_register(conf.uri + '.create_user', Profile.createUser)
    }

}

async function register (conf) {
    let profile = new Profile(conf)
    await profile.register()
}

module.exports = {register}