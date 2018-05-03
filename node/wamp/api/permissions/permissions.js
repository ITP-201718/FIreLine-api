const autobahn = require('autobahn')
const validate = require('validate.js')

const helpers = require('../../helpers')

async function register (conf){

    /**
     * Adds a Permission to a user
     * Tested
     * @param args
     * @param kwargs
     * @returns {Promise<boolean>}
     */

    async function addPermissionToUser(args, kwargs){
        const constraints = {
            bid: {
                presence: { message: '^Internal Server Error (2004)' },
                numericality: { onlyInteger: true }
            },
            mid: {
                presence: { message: '^Internal Server Error (2005)' },
                numericality: { onlyInteger: true }
            },
            hat: {
                presence: { message: '^You must choose if the user has this permission' },
                inclusion: [true, false, "true", "false"],
            }
        }
        await helpers.validate(kwargs, constraints)

        let berechtigungenInsert = {
            bid: kwargs.bid,
            mid: kwargs.mid,
            hat: kwargs.hat,
        }
        await helpers.executeInsert('berechtigungen', berechtigungenInsert)

        return true
    }
    await helpers.s_register(conf.uri + '.create_berechtigungen', addPermissionToUser)

    /**
     * Removes a Permission from a user
     * Tested
     * @param args
     * @param kwargs
     * @returns {Promise<boolean>}
     */
    async function removePermissionFromUser(args, kwargs) {
        const constraints = {
            bid: {
                presence: { message: '^Internal Server Error (2004)' },
                numericality: { onlyInteger: true }
            },
            mid: {
                presence: { message: '^Internal Server Error (2005)' },
                numericality: { onlyInteger: true }
            }
        }
        helpers.validate(kwargs, constraints)
        const {bid,mid} = kwargs
        await helpers.execute('DELETE FROM berechtigungen WHERE bid = :bid AND mid = :mid', {bid,mid})
        return true
    }
    await helpers.s_register(conf.uri + '.remove_berechtigungen', removePermissionFromUser)
}

module.exports = {register}