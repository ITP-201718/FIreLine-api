const autobahn = require('autobahn')
const validate = require('validate.js')

const helpers = require('../../helpers')
async function register (conf) {

    /**
     * Creates a new jurisdiction
     * @param args
     * @param kwargs
     * @returns {Promise<boolean>}
     */

    async function createZbereich(args, kwargs) {
        const constraints = {
            name: {
                presence: {message: '^You must choose a name'}
            }
        }
        await helpers.validate(kwargs, constraints)

        let zbereichInsert = {
            name: name.kwargs
        }

        await helpers.executeInsert('zbereich', zbereichInsert)

        return true
    }
    await helpers.s_register(conf.uri + '.create_zbereich', createZbereich)

    /*async function updateZbereich(args, kwargs) {
        const constraints = {
            name: {
                presence: { message: '^You must choose a name' }
            },
            id: {
                presence: { message: '^Internal Server Error' },
                numericality: { onlyInteger: true }
            }
        }
        await helpers.validate(kwargs, constraints)
        const {id, name} = kwargs
        helpers.executeUpdate('zbereich', {id}, {name})
        return true
    }
    await helpers.s_register(conf.uri + '.update_zbereich', updateZbereich)
    */

    const baseCfg = {
        table: 'zbereich',
        elements: [
            {name: 'id', column: 'zid'},
            {name: 'name', column: 'name'}
        ],
    }

    /**
     * Generates get
     */
    await helpers.generateGet({
        ...baseCfg,
        uri: conf.uri + '.get',
    })

    await helpers.generateUpdate({
        ...baseCfg,
        uri: conf.uri + '.update',
        constraint: {},
    })
}

module.exports = {register}