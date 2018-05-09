const autobahn = require('autobahn')
const validate = require('validate.js')

const helpers = require('../../helpers')

async function register (conf) {

    /**
     * Adds a Passenger to a Tour.
     * Tested
     * @param args
     * @param kwargs
     * @returns {Promise<boolean>}
     */

    async function addPassengerToTour(args, kwargs) {
        const constraints = {
            faid: {
                presence: { message: '^Internal Server Error (2026)' },
                numericality: {onlyInteger: true}
            },
            mid: {
                presence: { message: '^Internal Server Error (2027)' },
                numericality: {onlyInteger: true}
            }
        }
        await helpers.validate(kwargs, constraints)

        let mitgefahrenInsert = {
            faid: kwargs.faid,
            mid: kwargs.mid,
        }
        await helpers.executeInsert('mitgefahren', mitgefahrenInsert)

        return true
    }
    await helpers.s_register(conf.uri + '.create_mitgefahren', addPassengerToTour)

    /**
     * Removes a Passenger from a Tour
     * Tested
     * @param args
     * @param kwargs
     * @returns {Promise<boolean>}
     */

    async function removePassengerFromTour(args, kwargs) {
        const constraints = {
            faid: {
                presence: { message: '^Internal Server Error (2026)' },
                numericality: {onlyInteger: true}
            },
            mid: {
                presence: { message: '^Internal Server Error (2027)' },
                numericality: {onlyInteger: true}
            }
        }
        helpers.validate(kwargs, constraints)
        const {faid,mid} = kwargs
        await helpers.execute('DELETE FROM mitgefahren WHERE faid = :faid AND mid = :mid', {faid,mid})
        return true
    }
    await helpers.s_register(conf.uri + '.remove_mitgefahren', removePassengerFromTour)
}

module.exports = {register}