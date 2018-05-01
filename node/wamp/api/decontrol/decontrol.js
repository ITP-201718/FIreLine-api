const autobahn = require('autobahn')
const validate = require('validate.js')

const helpers = require('../../helpers').helpers
async function register (conf) {

    /**
     * Creates a new decontrol
     * Tested
     * @param args
     * @param kwargs
     * @returns {Promise<boolean>}
     */

    async function createFreigabe(args, kwargs){
        const constraints = {
            name: {
                presence: { message: '^You must choose a name' }
            }
        }
        await helpers.validate(kwargs, constraints)

        let freigabeInsert = {
            name: kwargs.name
        }

        await helpers.executeInsert('freigabe', freigabeInsert)

        return true
    }
    await helpers.s_register(conf.uri + '.create_freigabe', createFreigabe)

    /**
     * Updates an existing decontrol
     * Tested
     * @param args
     * @param kwargs
     * @returns {Promise<boolean>}
     */

    async function updateFreigabe(args, kwargs) {
        const constraints = {
            name: {
                presence: {
                    message: '^You must choose a name'
                }
            },
            id: {
                presence:  {message: '^Internal Server Error'},
                numericality: {onlyInteger: true}
            }
        }

        await helpers.validate(kwargs, constraints)
        const {id, name} = kwargs
        helpers.executeUpdate('freigabe', {fid: id}, {name})
        return true
    }
    await helpers.s_register(conf.uri + '.update_freigabe', updateFreigabe)

    /**
     * Removes an existing Education
     * Tested
     * @param args
     * @param kwargs
     * @returns {Promise<boolean>}
     */

    async function removeFreigabe(args, kwargs) {
        const contraints = {
            id: {
                presence:  {message: '^Internal Server Error'},
                numericality: {onlyInteger: true}
            }
        }
        await helpers.validate(kwargs, contraints)
        const {id} = kwargs
        await helpers.execute('DELETE FROM freigabe WHERE fid = :id', {id})
        return true
    }
    await helpers.s_register(conf.uri + '.remove_freigabe', removeFreigabe)
}

module.exports = {register}