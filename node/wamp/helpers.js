const autobahn = require('autobahn')
let validatejs = require('validate.js')


let conf = null

async function register(_conf) {
    conf = _conf
    const { register_validators } = require('./validators')
    register_validators()
}

async function execute() {
    try {
        return await conf.sql_connection.execute(...arguments)
    } catch (e) {
        console.log(...arguments)
        console.log(e)
        throw new autobahn.Error('io.fireline.error.internal_server_error', ['Internal server error'])
    }
}

async function register_authid_mysql(uri, statement, results) {
    if(typeof uri !== 'string') {
        throw "Uri needs to be a string"
    }
    if(typeof statement !== 'string') {
        throw "statement needs to be a string"
    }
    if(!(typeof results === 'string' || Array.isArray(results))) {
        throw "results needs to a string or an array"
    }

    async function callback(args, kwargs, details) {
        let caller = details.caller_authid

        if(caller === undefined) {
            throw new autobahn.Error('io.fireline.error.no_caller_authid',
                ['Got not caller authid', 'This is a WAMP router misconfiguration'])
        }

        let [rows] = await execute(statement, {caller: caller})

        if(rows.length !== 1) {
            throw autobahn.Error('io.fireline.error.no_such_user', ['No such user'])
        }

        if(Array.isArray(results)) {
            let ret = {}
            for(let i in results) {
                ret[results[i]] = row[0][results[i]]
            }
            return ret
        } else {
            return rows[0][results]
        }
    }

    await s_register(uri, callback)
}

async function alreadySetSql(table, column, value) {
    let [res] = await conf.sql_connection.execute(`SELECT ${column} FROM ${table} WHERE ${column} = ?`, [value])
    return res.length !== 0
}

async function s_register(uri, func) {
    await conf.ab_session.register(uri, func)
    console.log("Successfully Registered: '" + uri + "'")
}

/**
 * Generates Sql Data set ( (column, column2, ...)
 * @param values
 * @returns {string|string}
 */
function generateSqlDataSet(values) {
    let ret = '('
    for(let i of values) {
        ret += "`" + i + "`, "
    }
    ret = ret.slice(0, -2) + ')'
    return ret
}

function generateSqlDataValueSet(values) {
    let keys = Object.keys(values)
    let dataSet = generateSqlDataSet(keys)
    let valueSet = '('
    for(let i of keys) {
        let val = values[i]
        let value = ':' + i + ', '
        if(validatejs.isObject(val)) {
            if(!!val.raw) {
                value = val.value + ', '
            } else {
                value = ':' + val.value + ', '
            }
            values[i] = val.value
        }
        valueSet += value
    }
    valueSet = valueSet.slice(0, -2) +')'
    return {
        dataSet,
        valueSet,
        values
    }
}

function generateUpdateDataValueSet(table, values, check) {
    let sql = "UPDATE " + table + " SET "
    check = generateCheckSet(check)
}

function generateSetSet(values) {
    let sql = "SET "
    let setValues = {}
    for(let i in values) {
        sql += i + ' = :set_' + i + ', '
        setValues['set_' + i] = values[i]
    }
    sql = sql.slice(0, -2)
    return {sql, setValues}
}

function generateCheckSet(check) {
    let sql = "WHERE "
    let checkValues = {}
    for(let i in check) {
        sql += i + ' = :check_' + i + " AND ";
        checkValues['check_' + i] = check[i]
    }
    sql = sql.slice(0, -5)
    return {sql, checkValues}
}

function generateUpdateSet(table, check, values) {
    let sql = "UPDATE " + table + " "
    let setSet = generateSetSet(values)
    let checkSet = generateCheckSet(check)
    sql += setSet.sql + " " + checkSet.sql
    return {sql, values: {...setSet.setValues, ...checkSet.checkValues}}
}

function createJoinedTable(t1, t2, on) {
    return t1 + ' INNER JOIN ' + t2 + ' ON ' + t1 + '.' + on + ' = ' + t2 + '.' + on
}

async function executeUpdate(table, check, values) {
    let update = generateUpdateSet(table, check, values)
    try {
        await conf.sql_connection.execute(update.sql, update.values)
    } catch (err) {
        console.error('executeUpdate', err)
        throw 'Internal Error (1006)'
    }
}

function generateInsert(table, values) {
    let sql = 'INSERT INTO `' + table + '` '
    let dataValueSet = generateSqlDataValueSet(values)
    sql += dataValueSet.dataSet + ' VALUES ' + dataValueSet.valueSet
    return {
        sql,
        values: dataValueSet.values
    }
}

async function executeInsert(table, values) {
    let insert = generateInsert(table, values)
    try {
        await conf.sql_connection.execute(insert.sql, insert.values)
    } catch(err) {
        console.error('executeInsert', err)
        throw 'Internal Error (1004)'
    }
}

async function validate(attributes, constraints, options) {
    try {
        await validatejs.async(attributes, constraints, options)
    } catch (err) {
        if(err instanceof Error) {
            console.error('Validation Error', err)
            throw "Internal Error (1005)"
        } else {
            conf.logger.log('verbose', 'Validation error')
            throw new autobahn.Error('io.fireline.error.validate', [err])
        }
    }
}

module.exports = {
    register,
    register_authid_mysql,
    s_register,
    alreadySetSql,
    execute,
    generateSqlDataValueSet,
    generateSqlDataSet,
    generateCheckSet,
    generateSetSet,
    generateInsert,
    createJoinedTable,
    executeUpdate,
    executeInsert,
    validate,
}