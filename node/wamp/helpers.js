const autobahn = require('autobahn')
let validatejs = require('validate.js')
const Component = require('../Component')

/**
 * Helpers
 */
class Helpers extends Component {

    /**
     * Registers Validators
     * @returns {Promise<void>}
     */
    async register() {
        const {register_validators} = require('./validators')
        register_validators()
    }

    /**
     * Try catch wrapper for sql.execute. Throws 501
     * @throws {Error} 501
     * @returns {Promise<object>} Sql answer
     */
    async execute() {
        try {
            return await this.conf.sql_connection.execute(...arguments)
        } catch (e) {
            console.log(...arguments)
            console.log(e)
            throw new autobahn.Error('io.fireline.error.internal_server_error', ['Internal server error (501)'])
        }
    }

    /**
     * Registers simple select function for auth id usages
     * @param uri Uri of the function
     * @param statement Select statement (:caller is replaced by the caller)
     * @param results Which results matter of the select
     * @returns {Promise<void>}
     */
    async register_authid_mysql(uri, statement, results) {
        if (typeof uri !== 'string') {
            throw "Uri needs to be a string"
        }
        if (typeof statement !== 'string') {
            throw "statement needs to be a string"
        }
        if (!(typeof results === 'string' || Array.isArray(results))) {
            throw "results needs to a string or an array"
        }

        async function callback(args, kwargs, details) {
            let caller = details.caller_authid

            if (caller === undefined) {
                throw new autobahn.Error('io.fireline.error.no_caller_authid',
                    ['Got not caller authid', 'This is a WAMP router misconfiguration'])
            }

            let [rows] = await execute(statement, {caller: caller})

            if (rows.length !== 1) {
                throw autobahn.Error('io.fireline.error.no_such_user', ['No such user'])
            }

            if (Array.isArray(results)) {
                let ret = {}
                for (let i in results) {
                    ret[results[i]] = row[0][results[i]]
                }
                return ret
            } else {
                return rows[0][results]
            }
        }

        await this.s_register(uri, callback)
    }

    /**
     * Checks if data is already in given table/column
     * @param table Table to search in
     * @param column Column to search in
     * @param value Value to search for
     * @returns {Promise<boolean>} If it is in the table/column or not
     */
    async alreadySetSql(table, column, value) {
        let [res] = await this.execute(`SELECT ${column} FROM ${table} WHERE ${column} = ?`, [value])
        return res.length !== 0
    }

    /**
     * Registers an WAMP method with logging output (And it is always good to do it centralized)
     * @param uri Uri to register method to
     * @param func Callback function
     * @returns {Promise<void>}
     */
    async s_register(uri, func) {
        await this.conf.ab_session.register(uri, func)
        console.log("Successfully Registered: '" + uri + "'")
    }

    /**
     * Generates Sql Data set ( (column, column2, ...)
     * @param {array} values To be in the data set. (Ordered)
     * @returns {string} Sql data set
     */
    generateSqlDataSet(values) {
        let ret = '('
        for (let i of values) {
            ret += "`" + i + "`, "
        }
        ret = ret.slice(0, -2) + ')'
        return ret
    }

    generateSqlDataValueSet(values) {
        let keys = Object.keys(values)
        let dataSet = generateSqlDataSet(keys)
        let valueSet = '('
        for (let i of keys) {
            let val = values[i]
            let value = ':' + i + ', '
            if (validatejs.isObject(val)) {
                if (!!val.raw) {
                    value = val.value + ', '
                } else {
                    value = ':' + val.value + ', '
                }
                values[i] = val.value
            }
            valueSet += value
        }
        valueSet = valueSet.slice(0, -2) + ')'
        return {
            dataSet,
            valueSet,
            values
        }
    }

    generateUpdateDataValueSet(table, values, check) {
        let sql = "UPDATE " + table + " SET "
        check = generateCheckSet(check)
    }

    generateSetSet(values) {
        let sql = "SET "
        let setValues = {}
        for (let i in values) {
            sql += i + ' = :set_' + i + ', '
            setValues['set_' + i] = values[i]
        }
        sql = sql.slice(0, -2)
        return {sql, setValues}
    }

    generateCheckSet(check) {
        let sql = "WHERE "
        let checkValues = {}
        for (let i in check) {
            sql += i + ' = :check_' + i + " AND ";
            checkValues['check_' + i] = check[i]
        }
        sql = sql.slice(0, -5)
        return {sql, checkValues}
    }

    generateUpdateSet(table, check, values) {
        let sql = "UPDATE " + table + " "
        let setSet = generateSetSet(values)
        let checkSet = generateCheckSet(check)
        sql += setSet.sql + " " + checkSet.sql
        return {sql, values: {...setSet.setValues, ...checkSet.checkValues}}
    }

    createJoinedTable(t1, t2, on) {
        return t1 + ' INNER JOIN ' + t2 + ' ON ' + t1 + '.' + on + ' = ' + t2 + '.' + on
    }

    async executeUpdate(table, check, values) {
        let update = generateUpdateSet(table, check, values)
        try {
            await
            this.conf.sql_connection.execute(update.sql, update.values)
        } catch (err) {
            console.error('executeUpdate', err)
            throw 'Internal Error (1006)'
        }
    }

    generateInsert(table, values) {
        let sql = 'INSERT INTO `' + table + '` '
        let dataValueSet = generateSqlDataValueSet(values)
        sql += dataValueSet.dataSet + ' VALUES ' + dataValueSet.valueSet
        return {
            sql,
            values: dataValueSet.values
        }
    }

    async executeInsert(table, values) {
        let insert = generateInsert(table, values)
        try {
            await
            this.conf.sql_connection.execute(insert.sql, insert.values)
        } catch (err) {
            console.error('executeInsert', err)
            throw 'Internal Error (1004)'
        }
    }

    async validate(attributes, constraints, options) {
        try {
            await
            validatejs.async(attributes, constraints, options)
        } catch (err) {
            if (err instanceof Error) {
                console.error('Validation Error', err)
                throw "Internal Error (1005)"
            } else {
                this.conf.logger.log('verbose', 'Validation error')
                throw new autobahn.Error('io.fireline.error.validate', [err])
            }
        }
    }
}

let helpers;

async function register(conf) {
    helpers = new Helpers(conf)
    await helpers.register()
}

module.exports = {
    register,
    helpers,
}