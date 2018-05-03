const autobahn = require('autobahn')
const validate = require('validate.js')

const helpers = require('../../helpers')

async function register (conf) {

    /**
     * Adds an Education to a user
     * Tested
     * @param args
     * @param kwargs
     * @returns {Promise<boolean>}
     */

    async function addEducationToUser(args, kwargs) {
        const constraints = {
            auid: {
                presence: { message: '^Internal Server Error (2012)' },
                numericality: { onlyInteger: true }
            },
            mid: {
                presence: { message: '^Internal Server Error (2013)' },
                numericality: { onlyInteger: true }
            }
        }
        await helpers.validate(kwargs, constraints)

        let ausbildungenInsert = {
            auid: kwargs.auid,
            mid: kwargs.mid,
        }
        await helpers.executeInsert('ausbildungen', ausbildungenInsert)

        return true
    }
    await helpers.s_register(conf.uri + '.create_ausbildungen', addEducationToUser)

    /**
     * Removes an Education from a user
     * Tested
     * @param args
     * @param kwargs
     * @returns {Promise<boolean>}
     */

    async function removeEducationFromUser (args, kwargs) {
        const constraints = {
            auid: {
                presence: { message: '^Internal Server Error (2012)' },
                numericality: { onlyInteger: true }
            },
            mid: {
                presence: { message: '^Internal Server Error (2013)' },
                numericality: { onlyInteger: true }
            }
        }
        helpers.validate(kwargs, constraints)
        const {auid,mid} = kwargs
        await helpers.execute('DELETE FROM ausbildungen WHERE auid = :auid AND mid = :mid', {auid,mid})
        return true
    }
    await helpers.s_register(conf.uri + '.remove_ausbildungen', removeEducationFromUser)
}

module.exports = {register}