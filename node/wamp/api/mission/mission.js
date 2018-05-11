const autobahn = require('autobahn')
const validate = require('validate.js')

const helpers = require('../../helpers')

async function register (conf) {

    const baseCfg = {
        table: 'einsatz',
        elements: [
            {name: 'id', column: 'eid'},
            {name: 'ort', column: 'ort'},
            {name: 'von', column: 'von'},
            {name: 'bis', column: 'bis'},
            {name: 'stufe', column: 'estufe'},
            {name: 'beschreibung', column: 'beschreibung'}
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
            ort: {
                presence: { message: '^You must choose a location' }
            },
            von: {
                presence: { message: '^You must choose a start time' },
                datetime: true
            },
            bis: {
                presence: { message: '^You must choose a end time' },
                datetime: true
            },
            stufe: {
                presence: {message: '^You must choose an operational level'},
                length: {is: 2},
            },
            beschreibung: {
                presence: {message: '^You must choose a description'}
            }
        }
    })
}

module.exports = {register}
