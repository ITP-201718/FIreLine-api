const autobahn = require('autobahn')
const validate = require('validate.js')

const helpers = require('../../helpers')

async function register (conf){

    /**
     * Adds a Tour to a vehicle
     * Tested
     * @param args
     * @param kwargs
     * @returns {Promise<boolean>}
     */

    async function addTourToUser(args, kwargs) {
        const constraints = {
            faid: {
                presence: { message: '^Internal Server Error (2018)' },
                numericality: {onlyInteger: true}
            },
            km_anfang: {
                presence: { message: '^You must choose a start mileage' },
                numericality: {onlyInteger: true}
            },
            km_ende: {
                presence: { message: '^You must choose a start mileage' },
                numericality: {onlyInteger: true}
            },
            zweck: {
                presence: { message: '^You must choose a purpose' }
            },
            datum: {
                presence: { message: '^You must choose a date' },
                datetime: true
            },
            eid: {
                presence: { message: '^Internal Server Error (2019)' },
                numericality: {onlyInteger: true}
            },
            mid: {
                presence: { message: '^Internal Server Error (2020)' },
                numericality: {onlyInteger: true}
            },
            fid: {
                presence: { message: '^Internal Server Error (2021)' },
                numericality: {onlyInteger: true}
            }
        }
        await helpers.validate(kwargs, constraints)

        let fahrtInsert = {
            faid: kwargs.faid,
            km_anfang: kwargs.km_anfang,
            km_ende: kwargs.km_ende,
            zweck: kwargs.zweck,
            datum: kwargs.datum,
            eid: kwargs.eid,
            mid: kwargs.mid,
            fid: kwargs.fid,
        }
        await helpers.executeInsert('fahrt', fahrtInsert)

        return true
    }
    await helpers.s_register(conf.uri + '.create_fahrt', addTourToUser)

    /**
     * Removes a Tour from a vehicle
     * Tested
     * @param args
     * @param kwargs
     * @returns {Promise<boolean>}
     */

    async function removeTourFromUser(args, kwargs) {
        const constraints = {
            faid: {
                presence: { message: '^Internal Server Error (2022)' },
                numericality: {onlyInteger: true}
            },
            eid: {
                presence: { message: '^Internal Server Error (2023)' },
                numericality: {onlyInteger: true}
            },
            mid: {
                presence: { message: '^Internal Server Error (2024)' },
                numericality: {onlyInteger: true}
            },
            fid: {
                presence: { message: '^Internal Server Error (2025)' },
                numericality: {onlyInteger: true}
            }
        }
        helpers.validate(kwargs,constraints)
        const {faid,eid,mid,fid} = kwargs
        await helpers.execute('DELETE FROM fahrt WHERE faid = :faid AND eid = :eid AND mid = :mid AND fid = :fid', {faid,eid,mid,fid})
        return true
    }
    await helpers.s_register(conf.uri + '.remove_fahrt', removeTourFromUser)
}

module.exports = {register}