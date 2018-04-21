const autbahn = require('autobahn')
const validate = require('validate.js')

const helpers = require('../../helpers')

async function register (conf) {

    /**
     * Creates a new rank
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
    await helpers.s_register(conf.uri + '.create_rank', createRank())

    async function updateRank(args, kwargs) {
        const constraints = {
            name: {
                presence: { message: '^You must choose a name' }
            },
            kform: {
                presence: { message: '^You must choose a short form ' }
            },
            id: {
                presence: { message: 'Internal Server Error' }
                numericality: {onlyInteger: true}
            }
        }
        await helpers.validate(kwargs, constraints)
        const {id,name,kform} = kwargs
        helpers.executeUpdate('rang', {id}, {name, kform})
        return true
    }
    await helpers.s_register(conf.uri + '.update_rank', updateRank())
}

module.exports = {register}