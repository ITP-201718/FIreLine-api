const autobahn = require('autobahn')
const validate = require('validate.js')

const helpers = require('../../helpers')

async function register (conf) {

    /**
     * Creates a new mission
     * Tested
     * @param args
     * @param kwargs
     * @returns {Promise<boolean>}
     */

    async function createEinsatz(args, kwargs) {
        const constraints = {
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
            }
        }
        await helpers.validate(kwargs, constraints)

        let einsatzInsert = {
            ort: kwargs.ort,
            von: kwargs.von,
            bis: kwargs.bis,
        }

        await helpers.executeInsert('einsatz', einsatzInsert)

        return true
    }
    await helpers.s_register(conf.uri + '.create_einsatz', createEinsatz)

    /**
     * Updates an existing mission
     * Tested
     * @param awgs
     * @param kwargs
     * @returns {Promise<boolean>}
     */

    async function updateEinsatz(awgs, kwargs) {
        const constraints = {
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
            id: {
                presence: { message: '^Internal Server Error (2014)' },
                numericality: { onlyInteger: true }
            }
        }
        await helpers.validate(kwargs, constraints)
        const {id, ort, von, bis} = kwargs
        helpers.executeUpdate('einsatz', {eid: id}, {ort, von, bis})
        return true
    }
    await helpers.s_register(conf.uri + '.update_einsatz', updateEinsatz)

    /**
     * Removes an existing mission
     * Tested
     * @param args
     * @param kwargs
     * @returns {Promise<boolean>}
     */

    async function removeEinsatz(args, kwargs) {
        const constraints = {
            id: {
                presence: { message: '^Internal Server Error (2015)' },
                numericality: { onlyInteger: true }
            }
        }
        await helpers.validate(kwargs, constraints)
        const {id} = kwargs
        await helpers.execute('DELETE FROM einsatz WHERE eid = :id', {id})
        return true
    }
    await helpers.s_register(conf.uri + '.remove_einsatz', removeEinsatz)
}

module.exports = {register}
