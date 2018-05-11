const autobahn = require('autobahn')
const validate = require('validate.js')

const helpers = require('../../helpers')

async function register (conf) {

    /**
     * Creates a new vehicle
     * Tested
     * @param args
     * @param kwargs
     * @returns {Promise<boolean>}
     */

    async function createFahrzeug(args, kwargs){
        const constraints = {
            einsatzbereit: {
                presence: { message: '^You must choose if the vehicle is usable' },
                inclusion: [true, false, "true", "false"]
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
                inclusion: [true, false, "true", "false"]
            },
            kennz: {
                presence: { message: '^You must choose a license plate' }
            },
            fmenge: {
                presence: { message: '^You must choose how many vehicles are in stock' },
                numericality: { onlyInteger: true }
            },
        }
        await helpers.validate(kwargs, constraints)

        let fahrzeugInsert = {
            einsatzbereit: kwargs.einsatzbereit,
            rufname: kwargs.rufname,
            mannstaerke: kwargs.mannstaerke,
            ps: kwargs.ps,
            bez: kwargs.bez,
            automatik: kwargs.automatik,
            kennz: kwargs.kennz,
            fmenge: kwargs.fmenge
        }

        await helpers.executeInsert('fahrzeug', fahrzeugInsert)

        return true
    }
    await helpers.s_register(conf.uri + '.create_fahrzeug', createFahrzeug)

    /**
     * Updates an existing vehicle
     * Tested
     * @param args
     * @param kwargs
     * @returns {Promise<boolean>}
     */
    /*
    async function updateFahrzeug(args, kwargs) {
        const constraints = {
            einsatzbereit: {
                presence: { message: '^You must choose if the vehicle is usable' },
                inclusion: [true, false, "true", "false"]
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
                inclusion: [true, false, "true", "false"]
            },
            kennz: {
                presence: { message: '^You must choose a license plate' }
            },
            fmenge: {
                presence: { message: '^You must choose how many vehicles are in stock' },
                numericality: { onlyInteger: true }
            },
            id: {
                presence: { message: '^Internal Server Error (2016)' },
                numericality: {onlyInteger: true}
            }
        }
        await helpers.validate(kwargs, constraints)
        const {id,einsatzbereit,rufname,mannstaerke,ps,bez,automatik,kennz,fmenge} = kwargs
        helpers.executeUpdate('fahrzeug', {fid: id}, {einsatzbereit,rufname,mannstaerke,ps,bez,automatik,kennz,fmenge})
        return true
    }
    await helpers.s_register(conf.uri + '.update_fahrzeug', updateFahrzeug)
    */
    /**
     * Removes an existing vehicle
     * Tested
     * @param args
     * @param kwargs
     * @returns {Promise<boolean>}
     */

    async function removeFahrzeug(args, kwargs){
        const constraints = {
            id: {
                presence: { message: '^Internal Server Error (2017)' },
                numericality: {onlyInteger: true}
            }
        }
        helpers.validate(kwargs,constraints)
        const {id} = kwargs
        await helpers.execute('DELETE FROM fahrzeug WHERE fid = :id', {id})
        return true
    }
    await helpers.s_register(conf.uri + '.remove_fahrzeug', removeFahrzeug)

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
}

module.exports = {register}