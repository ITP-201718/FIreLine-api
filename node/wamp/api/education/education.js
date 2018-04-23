const autobahn = require('autobahn')
const validate = require('validate.js')

const helpers = require('../../helpers')

async function register (conf){

    /**
     * Creates a new Education
     * @param args
     * @param kwargs
     * @returns {Promise<boolean>}
     */

    async function createAusbildung(args, kwargs){
        const constraints = {
            name: {
                presence: { message: '^You must choose a name' }
            }
        }
        await helpers.validate(kwargs, constraints)

        let ausbildungInsert = {
            name: kwargs.name
        }

        await helpers.executeInsert('ausbildung', ausbildungInsert)

        return true
    }
    await helpers.s_register(conf.uri + '.create_ausbildung', createAusbildung())

    /**
     * Updates an existing Education
     * @param args
     * @param kwargs
     * @returns {Promise<boolean>}
     */

    async function updateAusbildung(args, kwargs){
        const constraints = {
            name: {
                presence: { message: '^You must choose a name' }
            },
            id: {
                presence: { message: 'Internal Server Error' },
                numericality: { onlyInteger: true }
            }
        }
        await helpers.validate(kwargs, constraints)
        const {id, name} = kwargs
        helpers.executeUpdate('ausbildung', {id},{name})
        return true
    }
    await helpers.s_register(conf.uri + '.update_Ausbildung', updateAusbildung())

    /**
     * Removes an existing Education
     * @param args
     * @param kwargs
     * @returns {Promise<boolean>}
     */

    async function removeAusbildung(args, kwargs){
        const contraints = {
            id: {
                presence: { message: 'Internal Server Error' },
                numericality: { onlyInteger: true }
            }
        }
        await helpers.validate(kwargs, contraints)
        const {id} = kwargs
        await helpers.execute('DELETE FROM ausbildung WHERE auid = :id', {id})
        return true
    }
    await helpers.s_register(conf.uri + '.remove_Ausbildung', removeAusbildung())
}

module.exports = {register}