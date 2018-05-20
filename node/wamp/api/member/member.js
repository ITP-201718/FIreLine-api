const helpers = require('../../helpers')
const passwordHash = require('password-hash')

async function register (conf) {

    const baseCfg = {
        table: 'mitglied',
        elements: [
            {name: 'id', column: 'mid'},
            {name: 'username', column: 'uname'},
            {name: 'password', column: 'pwd', format: (inp) => {return passwordHash.generate(inp)}},
            {name: 'mail', column: 'mail'},
            {name: 'first_name', column: 'vname'},
            {name: 'last_name', column: 'nname'},
            {name: 'sbuergerschaft', column: 'sbuergerschaft'},
            {name: 'birthday', column: 'gebdat'},
            {name: 'zugehoerigkeit', column: 'zugehoerigkeit'},
            {name: 'gender', column: 'geschlecht'},
            {name: 'rid', column: 'rid'},
            {name: 'zid', column: 'zid'},
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
            gebdat: {
                presence: { message: '^You must choose a date of birth ' },
                date: true,
            },
            zugehoerigkeit: {
                presence: { message: '^You must choose a jurisdiction ' }
            },
            geschlecht: {
                presence: { message: '^You must choose a gender ' },
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