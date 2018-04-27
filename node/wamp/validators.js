const moment = require('moment')
let validatejs = require('validate.js')
const {validators} = validatejs
const {
    alreadySetSql
} = require('./helpers')

function register_validators() {
    validatejs.extend(validatejs.validators.datetime, {
        parse: (value, options) => {
            return moment.utc(value)
        },

        format: (value, options) => {
            let format = options.dateOnly ? "YYYY-MM-DD" : "YYYY-MM-DD hh:mm:ss";
            return moment.utc(value).format(format);
        }
    })

    validators.notInDB = async (value, options, key) => {
        if(validatejs.isEmpty(options.table)) {
            throw 'notInDB: Not all required options where set'
        }
        if(validatejs.isEmpty(options.row)){
            options.row = key
        }
        if(await alreadySetSql(options.table, options.row, value)) {
            return options.message || this.message || 'is already in use'
        }
    }

    validators.inDB = async (value, options, key) => {
        if(validatejs.isEmpty(options.table)) {
            throw 'inDB: Not all required options where set'
        }
        if(validatejs.isEmpty(options.row)){
            options.row = key
        }
        if(!await alreadySetSql(options.table, options.row, value)) {
            return options.message || this.message || 'is not in use'
        }
    }

    console.log('Initialized validators')
}

module.exports = {
    register_validators,
}