const autbahn = require('autobahn')
const validate = require('validate.js')

const helpers = require('../../helpers')
async function register (conf) {

    const baseCfg = {
        table: 'rang',
        elements: [
            {name: 'id', column: 'rid'},
            {name: 'name', column: 'name'},
            {name: 'kname', column: 'kform'}
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
                presence: { message: '^You must choose a name' }
            },
            kname: {
                presence: { message: '^You must choose a short form ' }
            },
        }
    })
}

module.exports = {register}