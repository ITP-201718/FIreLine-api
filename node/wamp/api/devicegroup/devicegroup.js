const autobahn = require('autobahn')
const validate = require('validate.js')

const helpers = require('../../helpers')

async function register (conf) {

    /**
     * Creates a new device group
     * Tested
     * @param args
     * @param kwargs
     * @returns {Promise<boolean>}
     */

    async function createGeraetegrp(args, kwargs){
        const constraints = {
            name: {
                presence: { message: '^You must choose a name' }
            }
        }
        await helpers.validate(kwargs, constraints)

        let geraetegrpInsert = {
            name: kwargs.name,
        }

        await helpers.executeInsert('geraetegrp', geraetegrpInsert)

        return true
    }
    await helpers.s_register(conf.uri + '.create_geraetegrp', createGeraetegrp)

    /**
     * Updates an existing device group
     * Tested
     * @param args
     * @param kwargs
     * @returns {Promise<boolean>}
     */

    /*async function updateGeraetegrp(args, kwargs){
        const constraints = {
            name: {
                presence: { message: '^You must choose a name' }
            },
            id: {
                presence: { message: '^Internal Server Error (2028)' },
                numericality: {onlyInteger: true}
            }
        }
        await helpers.validate(kwargs, constraints)
        const {id,name} = kwargs
        helpers.executeUpdate('geraetegrp', {ggid: id}, {name})
        return true
    }
    await helpers.s_register(conf.uri + '.update_geraetegrp', updateGeraetegrp)
    */
    /**
     * Removes an existing device group
     * Tested
     * @param args
     * @param kwargs
     * @returns {Promise<boolean>}
     */

    async function removeGeraetegrp(args, kwargs) {
        const constraints = {
            id: {
                presence: { message: '^Internal Server Error (2029)' },
                numericality: {onlyInteger: true}
            }
        }
        helpers.validate(kwargs, constraints)
        const {id} = kwargs
        await helpers.execute('DELETE FROM geraetegrp WHERE ggid = :id', {id})
        return true
    }
    await helpers.s_register(conf.uri + '.remove_geraetegrp', removeGeraetegrp)

    const baseCfg = {
        table: 'geraetegrp',
        elements: [
            {name: 'id', column: 'ggid'},
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