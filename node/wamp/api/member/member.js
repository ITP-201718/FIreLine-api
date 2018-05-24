const helpers = require('../../helpers')
const passwordHash = require('password-hash')

async function register(conf) {

    const baseCfg = {
        table: 'mitglied',
        elements: [
            {name: 'id', column: 'mid'},
            {name: 'username', column: 'uname'},
            {
                name: 'password', column: 'pwd', format: (inp) => {
                    return passwordHash.generate(inp)
                }
            },
            {name: 'mail', column: 'mail'},
            {name: 'first_name', column: 'vname'},
            {name: 'last_name', column: 'nname'},
            {name: 'sbuergerschaft', column: 'sbuergerschaft'},
            {name: 'birthday', column: 'gebdat'},
            {name: 'zugehoerigkeit', column: 'zugehoerigkeit'},
            {name: 'gender', column: 'geschlecht'},
            {name: 'rank', column: 'rid'},
            {name: 'jurisdiction', column: 'zid'},
            {
                name: 'educations', column: null, replace: async (v, row) => {
                    const data = (await conf.ab_session.call('io.fireline.api.educations.get', [], {
                        filter: {
                            mid: row.id,
                        }
                    })).data
                    let ret = []
                    for(const set of data) {
                        ret.push(set.auid)
                    }
                    return ret
                }
            }
        ],
    }

    /**
     * Generates get
     */
    await helpers.generateGet({
        ...baseCfg,
        uri: conf.uri + '.get',
    })

    await helpers.generateUpdate({
        ...baseCfg,
        uri: conf.uri + '.update',
        constraint: {
            gender: {
                inclusion: {within: ['o', 'm', 'w']}
            },
            rid: {
                inDB: {table: 'rang'}
            },
            zid: {
                inDB: {table: 'zugehoerigkeit'}
            },
        }
    })

    await helpers.generateDelete({
        ...baseCfg,
        uri: conf.uri + '.delete',
    })

    await helpers.generateCreate({
        ...baseCfg,
        uri: conf.uri + '.create',
        constraint: {
            username: {
                presence: {message: '^You must choose a username', allowEmpty: false},
                notInDB: {table: 'mitglied', row: 'uname'},
            },
            mail: {
                email: {message: '^Does not seem to be a valid email'},
                notInDB: {table: 'mitglied'},
            },
            first_name: {
                presence: {message: '^You must choose a first name', allowEmpty: false}
            },
            last_name: {
                presence: {message: '^You must choose a last name', allowEmpty: false}
            },
            password: {
                presence: {message: '^You must choose a password', allowEmpty: false}
            },
            password_confirm: {
                equality: {attribute: 'password', message: 'Is not equal to password'},
            },
            birthday: {
                presence: {message: '^You must choose a date of birth', allowEmpty: false},
                date: true,
            },
            zugehoerigkeit: {
                presence: {message: '^You must choose a jurisdiction ', allowEmpty: false}
            },
            gender: {
                presence: {message: '^You must choose a gender', allowEmpty: false},
                inclusion: {within: ['o', 'm', 'w']}
            },
            rid: {
                inDB: {table: 'rang'}
            },
            zid: {
                inDB: {table: 'zugehoerigkeit'}
            },
        }
    })
}

module.exports = {register}