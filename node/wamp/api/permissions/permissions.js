const autobahn = require('autobahn')
const validate = require('validate.js')

const helpers = require('../../helpers')

async function register (conf){

    const baseCfg = {
        table: 'berechtigungen',
        elements: [
            {name: 'id', column: 'bmid'},
            {name: 'bid', column: 'bid'},
            {name: 'mid', column: 'mid'},
            {name: 'hat', column: 'hat'}
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

    await helpers.generateDelete({
        ...baseCfg,
        uri: conf.uri + '.delete',
    })

    await helpers.generateCreate({
        ...baseCfg,
        uri: conf.uri + '.create',
        constraint: {
            bid: {
                presence: { message: '^Internal Server Error (2004)' },
                numericality: { onlyInteger: true }
            },
            mid: {
                presence: { message: '^Internal Server Error (2005)' },
                numericality: { onlyInteger: true }
            },
            hat: {
                presence: { message: '^You must choose if the user has this permission' },
                inclusion: [true, false, "true", "false"],
            },
        }
    })
}

module.exports = {register}