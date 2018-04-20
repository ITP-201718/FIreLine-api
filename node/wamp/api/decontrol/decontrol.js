const autobahn = require('autobahn')
const validate = require('validate.js')

const helpers = require('../../helpers')

async function register (conf) {

    /**
     * Creates a new decontrol
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
    await helpers.s_register(conf.uri, '.create_freigabe', createFreigabe())

    async function updateFreigabe(args, kwargs) {
        const constraints = {
            name: {
                presence: {
                    message: '^You must choose a name'
                }
            },
            id: {
                message: { message: '^Internal Server Error' },
                numericality: {onlyInteger: true}
            }
        }
        await helpers.validate(kwargs, constraints)
        const {id, name} = kwargs
        helpers.executeUpdate('freigabe', {id}, {name})
        return true
    }
    await helpers.s_register(conf.uri + '.update_freigabe', updateFreigabe())

}

module.exports = {register}