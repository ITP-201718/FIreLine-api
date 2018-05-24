const autobahn = require('autobahn')
const validate = require('validate.js')

const helpers = require('../../helpers')

async function register (conf) {

    const baseCfg = {
        table: 'fahrzeug',
        elements: [
            {name: 'id', column: 'fid'},
            {name: 'einsatzbereit', column: 'einsatzbereit'},
            {name: 'rufname', column: 'rufname'},
            {name: 'mannstaerke', column: 'mannstaerke'},
            {name: 'ps', column: 'ps'},
            {name: 'bez', column: 'bez'},
            {name: 'automatik', column: 'automatik'},
            {name: 'kennz', column: 'kennz'},
            {name: 'fmenge', column: 'fmenge'}
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
            einsatzbereit: {
                presence: { message: '^You must choose if the vehicle is usable' },
                inclusion: [true, false, "true", "false", '1', '0', 1, 0]
            },
            rufname: {
                presence: { message: '^You must choose a call name' }
            },
            mannstaerke: {
                presence: { message: '^You must choose the capacity of the vehicle' },
                numericality: { onlyInteger: true }
            },
            ps: {
                presence: { message: '^You must choose the HP' },
                numericality: {onlyInteger: true }
            },
            bez: {
                presence: { message: '^You must choose a vehicle designation' }
            },
            automatik: {
                presence: { message: '^You must choose a if the vehicle has automatic transmission' },
                inclusion: [true, false, "true", "false", '1', '0', 1, 0]
            },
            kennz: {
                presence: { message: '^You must choose a license plate' }
            },
            fmenge: {
                presence: { message: '^You must choose how many vehicles are in stock' },
                numericality: { onlyInteger: true }
            },
        }
    })
}

module.exports = {register}