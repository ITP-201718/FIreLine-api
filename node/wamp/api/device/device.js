const autobahn = require('autobahn')
const validate = require('validate.js')

const helpers = require('../../helpers')

async function register (conf) {

    /**
     * Creates a new device
     * Tested
     * @param args
     * @param kwargs
     * @returns {Promise<boolean>}
     */

    async function createGeraet(args, kwargs) {
        const constraints = {
            name: {
                presence: {message: '^You must choose a name'}
            },
            zinfo: {
                presence: {message: '^You must choose an extra information'}
            },
            fid: {
                presence: {message: '^Internal Server Error (2030)'},
                numericality: {onlyInteger: true}
            },
            ggid: {
                presence: {message: '^Internal Server Error (2031)'},
                numericality: {onlyInteger: true}
            },
        }
        await helpers.validate(kwargs, constraints)

        let geraetInsert = {
            name: kwargs.name,
            zinfo: kwargs.zinfo,
            fid: kwargs.fid,
            ggid: kwargs.ggid,
        }

        await helpers.executeInsert('geraet', geraetInsert)

        return true
    }
    await helpers.s_register(conf.uri + '.create_geraet', createGeraet)

    /**
     * Updates an existing device
     * Tested
     * @param args
     * @param kwargs
     * @returns {Promise<boolean>}
     */

    async function updateGeraet(args, kwargs){
        const constraints = {
            name: {
                presence: {message: '^You must choose a name'}
            },
            zinfo: {
                presence: {message: '^You must choose an extra information'}
            },
            fid: {
                presence: {message: '^Internal Server Error (2032)'},
                numericality: {onlyInteger: true}
            },
            ggid: {
                presence: {message: '^Internal Server Error (2033)'},
                numericality: {onlyInteger: true}
            },
            id: {
                presence: {message: '^Internal Server Error (2034)'},
                numericality: {onlyInteger: true}
            }
        }
        await helpers.validate(kwargs, constraints)
        const {id,name,zinfo,fid,ggid} = kwargs
        helpers.executeUpdate('geraet', {gid: id}, {name,zinfo,fid,ggid})
        return true
    }
    await helpers.s_register(conf.uri + '.update_geraet', updateGeraet)

    /**
     * Removes an existing device
     * Tested
     * @param args
     * @param kwargs
     * @returns {Promise<boolean>}
     */

    async function removeGeraet(args, kwargs){
        const constraints = {
            id: {
                presence: {message: '^Internal Server Error (2035)'},
                numericality: {onlyInteger: true}
            }
        }
        helpers.validate(kwargs, constraints)
        const {id} = kwargs
        await helpers.execute('DELETE FROM geraet WHERE gid = :id',{id})
        return true
    }
    await helpers.s_register(conf.uri + '.remove_geraet', removeGeraet)
}

module.exports = {register}