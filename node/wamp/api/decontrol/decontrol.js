const autobahn = require('autobahn')
const validate = require('validate.js')

const helpers = require('../../helpers')
async function register (conf) {

    const baseCfg = {
        table: 'freigabe',
        elements: [
            {name: 'id', column: 'fid'},
            {name: 'name', column: 'name'}
        ],
    }

    /**
     * Generates get
     */
    helpers.generateGet({
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
                presence: { message: '^You must choose a name' }
            }
        }
    })
}

module.exports = {register}