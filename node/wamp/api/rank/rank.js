const autbahn = require('autobahn')
const validate = require('validate.js')

const helpers = require('../../helpers')

async function register (conf) {

    /**
     * Creates a new rank
     * Tested
     * @param args
     * @param kwargs
     * @returns {Promise<boolean>}
     */

    async function createRank(args, kwargs) {
        const constraints = {
            name: {
                presence: { message: '^You must choose a name' }
            },
            kform: {
                presence: { message: '^You must choose a short form ' }
            }
        }
        await helpers.validate(kwargs, constraints)

        let rankInsert = {
            name: kwargs.name,
            kform: kwargs.kform
        }

        await helpers.executeInsert('rang', rankInsert)

        return true
    }
    await helpers.s_register(conf.uri + '.create_rank', createRank)

    /**
     * Updates an existing Rank
     * Tested
     * @param args
     * @param kwargs
     * @returns {Promise<boolean>}
     */

    async function updateRank(args, kwargs) {
        const constraints = {
            name: {
                presence: { message: '^You must choose a name' }
            },
            kform: {
                presence: { message: '^You must choose a short form ' }
            },
            id: {
                presence: { message: 'Internal Server Error' },
                numericality: {onlyInteger: true}
            }
        }
        await helpers.validate(kwargs, constraints)
        const {id,name,kform} = kwargs
        helpers.executeUpdate('rang', {rid: id}, {name, kform})
        return true
    }
    await helpers.s_register(conf.uri + '.update_rank', updateRank)

    /**
     * Removes an existing Rank
     * Tested
     * @param args
     * @param kwargs
     * @returns {Promise<boolean>}
     */

    async function removeRank(args, kwargs){
        const constraints = {
            id: {
                presence: { message: 'Internal Server Error' },
                numericality: {onlyInteger: true}
            }
        }
        await helpers.validate(kwargs, constraints)
        const {id} = kwargs
        helpers.execute('DELETE FROM rang WHERE rid = :id', {id})
        return true
    }
    helpers.s_register(conf.uri + '.remove_rank', removeRank)
}

module.exports = {register}