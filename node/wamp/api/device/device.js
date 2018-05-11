const autobahn = require('autobahn')
const validate = require('validate.js')

const helpers = require('../../helpers')

async function register (conf) {

    const baseCfg = {
        table: 'geraet',
        elements: [
            {name: 'id', column: 'gid'},
            {name: 'name', column: 'name'},
            {name: 'zinfo', columns: 'zinfo'},
            {name: 'fid', column: 'fid'},
            {name: 'ggid', column: 'ggid'}
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
            name: {
                presence: {message: '^You must choose a name'}
            },
            zinfo: {
                presence: {message: '^You must choose an extra information'}
            },
            fid: {
                presence: {message: '^Internal Server Error (2030)'},
                numericality: {onlyInteger: true}
            },
            ggid: {
                presence: {message: '^Internal Server Error (2031)'},
                numericality: {onlyInteger: true}
            },
        }
    })
}

module.exports = {register}