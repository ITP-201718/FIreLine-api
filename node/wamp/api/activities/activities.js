const autobahn = require('autobahn')
const validate = require('validate.js')

const helpers = require('../../helpers')

async function register (conf) {
    async function addActivityToUser(args, kwargs) {
        const constraints = {
            aid: {
                presence: { message: '^Internal Server Error (2000)' },
                numericality: { onlyInteger: true }
            },
            mid: {
                presence: { message: '^Internal Server Error (2001)' },
                numericality: { onlyInteger: true }
            }
        }
        await helpers.validate(kwargs, constraints)

        let aktivitaetenInsert = {
            aid: kwargs.aid,
            mid: kwargs.mid,
        }
        await helpers.executeInsert('aktivitaeten', aktivitaetenInsert)

        return true
    }
    await helpers.s_register(conf.uri + '.create_aktivitaeten', addActivityToUser())

    async function removeActivityFromUser(args, kwargs) {
        const constraints = {
            aid: {
                presence: { message: '^Internal Server Error (2002)' },
                numericality: { onlyInteger: true }
            },
            mid: {
                presence: { message: '^Internal Server Error (2003)' },
                numericality: { onlyInteger: true }
            }
        }
        helpers.validate(kwargs, constraints)
        const {aid,mid} = kwargs
        await helpers.execute('DELETE FROM aktivitaeten WHERE aid = :aid AND mid = :mid', {aid,mid})
        return true
    }
    await helpers.s_register(conf.uri + '.remove_aktivitaeten', removeActivityFromUser())
}

module.exports = {register}