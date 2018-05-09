const autobahn = require('autobahn')
const validate = require('validate.js')

const helpers = require('../../helpers')

async function register (conf) {

    /**
     * Adds a Decontrol to a user
     * Tested
     * @param args
     * @param kwargs
     * @returns {Promise<boolean>}
     */

    async function addDecontrolToUser(args, kwargs) {
        const constraints = {
            fid: {
                presence: { message: '^Internal Server Error (2008)' },
                numericality: { onlyInteger: true }
            },
            mid: {
                presence: { message: '^Internal Server Error (2009)' },
                numericality: { onlyInteger: true }
            }
        }
        await helpers.validate(kwargs, constraints)

        let freigabenInsert = {
            fid: kwargs.fid,
            mid: kwargs.mid,
        }
        await helpers.executeInsert('freigaben', freigabenInsert)

        return true
    }
    await helpers.s_register(conf.uri + '.create_freigaben', addDecontrolToUser)

    /**
     * Removes a Decontrol from a user
     * Tested
     * @param args
     * @param kwargs
     * @returns {Promise<boolean>}
     */

    async function removeDecontrolFromUser(args, kwargs){
        const constraints = {
            fid: {
                presence: { message: '^Internal Server Error (2010)' },
                numericality: { onlyInteger: true }
            },
            mid: {
                presence: { message: '^Internal Server Error (2011)' },
                numericality: { onlyInteger: true }
            }
        }
        await helpers.validate(kwargs, constraints)
        const {fid,mid} = kwargs
        await helpers.execute('DELETE FROM freigaben WHERE fid = :fid AND mid = :mid', {fid,mid})
        return true
    }
    await helpers.s_register(conf.uri + '.remove_freigaben', removeDecontrolFromUser)
}

module.exports = {register}