const helpers = require('../../helpers')
async function register (conf) {

    const baseCfg = {
        table: 'mitglied',
        elements: [
            {name: 'id', column: 'mid'},
            {name: 'sbuergerschaft', column: 'sbuergerschaft'},
            {name: 'gebdat', column: 'gebdat'},
            {name: 'zugehoerigkeit', column: 'zugehoerigkeit'},
            {name: 'geschlecht', column: 'geschlecht'},
            {name: 'rid', column: 'rid'},
            {name: 'zid', column: 'zid'},
            {name: 'uid', column: 'uid'}
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
        constraint: {},
    })

    await helpers.generateDelete({
        ...baseCfg,
        uri: conf.uri + '.delete',
    })

    await helpers.generateCreate({
        ...baseCfg,
        uri: conf.uri + '.create',
        constraint: {
            sbuergerschaft: {
                presence: { message: '^You must choose a nationality' }
            },
            gebdat: {
                presence: { message: '^You must choose a date of birth ' }
            },
            zugehoerigkeit: {
                presence: { message: '^You must choose a jurisdiction ' }
            },
            geschlecht: {
                presence: { message: '^You must choose a gender ' }
            },
            rid: {
                presence: { message: '^You must choose a rid' }
            },
            zid: {
                presence: { message: '^You must choose a zid ' }
            },
            uid: {
                presence: { message: '^You must choose a uid ' }
            },
        }
    })
}

module.exports = {register}