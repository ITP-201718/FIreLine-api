const moment = require('moment')
let v = require('validate.js')
const {validators} = v
const {
    alreadySetSql
} = require('./helpers')

function register_validators() {
    v.extend(v.validators.datetime, {
        parse: (value, options) => {
            return moment.utc(value)
        },

        format: (value, options) => {
            let format = options.dateOnly ? "YYYY-MM-DD" : "YYYY-MM-DD hh:mm:ss"
            return moment.utc(value).format(format)
        }
    })

    validators.notInDB = async (value, options, key) => {
        if(v.isEmpty(value)) {
            return
        }
        if(v.isEmpty(options.table)) {
            throw 'notInDB: Not all required options where set'
        }
        if(v.isEmpty(options.row)){
            options.row = key
        }
        if(await alreadySetSql(options.table, options.row, value)) {
            return options.message || this.message || 'is already in use'
        }
    }

    validators.inDB = async (value, options, key) => {
        if(v.isEmpty(value)) {
            return
        }
        if(v.isEmpty(options.table)) {
            throw 'inDB: Not all required options where set'
        }
        if(v.isEmpty(options.row)){
            options.row = key
        }
        if(!await alreadySetSql(options.table, options.row, value)) {
            return options.message || this.message || 'is not in use'
        }
    }

    validators.oneOf = (value, options, key, attributes) => {
        if(v.isArray(value)) {
            options = {attributes: options}
        }

        let message = options.message || "^None options where present."

        if(v.isEmpty(options.attributes) || !v.isArray(options.attributes)) {
            throw new Error("The attributes must a non empty array")
        }

        let count = 0
        for(let att of options.attributes) {
            att in attributes && count++
        }

        if(count === 0) {
            return message
        }

        if(count > 1 && !options.allowMore) {
            return message
        }
        return null
    }

    validators.isArray = (value) => {
        if(v.isEmpty(value)) {
            return
        }
        if(!v.isArray(value)) {
            return options.message || "is not an array."
        }
    }

    console.log('Initialized validators')
}

module.exports = {
    register_validators,
}