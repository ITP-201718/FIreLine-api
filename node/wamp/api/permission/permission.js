const autobahn = require('autobahn')
const validate = require('validate.js')

const helpers = require('../../helpers')
async function register (conf) {

    const baseCfg = {
        table: 'berechtigung',
        elements: [
            {name: 'id', column: 'bid'},
            {name: 'name', column: 'name'},
            {name: 'uri', column: 'uri'}
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
            uri: {
                presence: { message: '^You must choose a uri' }
            },
            name: {
                presence: {message: '^You must choose a name'}
            }
        }
    })
}

module.exports = {register}