const autobahn = require('autobahn')
const validate = require('validate.js')

const helpers = require('../../helpers')

async function register (conf) {

    const baseCfg = {
        table: 'freigaben',
        elements: [
            {name: 'id', column: 'fmid'},
            {name: 'fid', column: 'fid'},
            {name: 'mid', column: 'mid'}
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
            fid: {
                presence: { message: '^Internal Server Error (2008)' },
                numericality: { onlyInteger: true }
            },
            mid: {
                presence: { message: '^Internal Server Error (2009)' },
                numericality: { onlyInteger: true }
            },
        }
    })
}

module.exports = {register}