const autobahn = require('autobahn')
const validate = require('validate.js')

const helpers = require('../../helpers')
async function register (conf) {

    const baseCfg = {
        table: 'aktivitaet',
        elements: [
            {name: 'id', column: 'aid'},
            {name: 'von', column: 'von'},
            {name: 'bis', column: 'bis'},
            {name: 'taetigkeit', column: 'taetigkeit'}
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
            von: {
                presence: { message: '^You must choose a from date' },
                datetime: true
            },
            bis: {
                presence: { message: '^You must choose a to date'},
                datetime: true
            },
            taetigkeit: {
                presence: { message: '^You must choose a activity'}
            }
        }
    })
}

module.exports = {register}