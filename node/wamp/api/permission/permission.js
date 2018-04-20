const autobahn = require('autobahn')
const validate = require('validate.js')

const helpers = require('../../helpers')

async function register (conf) {

    /**
     * Creates a new permission
     * @param args
     * @param kwargs
     * @returns {Promise<boolean>}
     */

    async function createBerechtigung(args, kwargs){
        const constraints = {
            uri: {
                presence: { message: '^You must choose a uri' }
            },
            name: {
                presence: { message: '^You must choose a name' }
            }
        }
        await helpers.validate(kwargs, constraints)

        let berechtigungInsert = {
            uri: kwargs.uri,
            name: kwargs.name
        }

        await helpers.executeInsert('berechtigung', berechtigungInsert)

        return true
    }
    await helpers.s_register(conf.uri + '.create_berechtigung', createBerechtigung())

    async function updateBerechtigung(args, kwargs){
        const constraints = {
            uri: {
                presence: { message: '^You must choose a uri' }
            },
            name: {
                presence: { message: '^You must choose a name' }
            },
            id: {
                presence : { message: '^Internal Server Error' }
                numericality: {onlyInteger: true}
            }
        }
        await helpers.validate(kwargs, constraints)
        const {id,uri,name} = kwargs
        helpers.executeUpdate('berechtigung', {id}, {uri,mame})
        return true
    }
    await helpers.s_register(conf.uri + '.update_berechtigung' updateBerechtigung())
}

module.exports = {register}