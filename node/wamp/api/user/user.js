const passwordHash = require('password-hash')
const validate = require('validate.js')
const Component = require('../../../Component')

const helpers = require('../../helpers')
/**
 * User
 */
class User extends Component {
    constructor(conf) {
        super(conf)
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
     * Registers methods to WAMP
     * @returns {Promise<void>} Promise to await all registers
     */
    async register() {
        await helpers.s_register(this.conf.uri + '.create', User.createUser)
    }
}

async function register (conf) {
    let user = new User(conf)
    await user.register()
}

module.exports = {register}