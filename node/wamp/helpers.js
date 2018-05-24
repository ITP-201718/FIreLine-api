const autobahn = require('autobahn')
let validatejs = require('validate.js')


let conf = null

async function register(_conf) {
    conf = _conf
    const {register_validators} = require('./validators')
    register_validators()
}

/**
 * Try catch wrapper for sql.execute. Throws 501
 * @throws {Error} 501
 * @returns {Promise<object>} Sql answer
 */
async function execute() {
    try {
        return await conf.sql_connection.execute(...arguments)
    } catch (e) {
        console.error(e)
        throw new autobahn.Error('io.fireline.error.internal_server_error', ['Internal server error (100)'])
    }
}

/**
 * Registers simple select function for auth id usages
 * @param uri Uri of the function
 * @param statement Select statement (:caller is replaced by the caller)
 * @param results Which results matter of the select
 * @returns {Promise<void>}
 */
async function register_authid_mysql(uri, statement, results) {
    if (typeof uri !== 'string') {
        throw 'Uri needs to be a string'
    }
    if (typeof statement !== 'string') {
        throw 'statement needs to be a string'
    }
    if (!(typeof results === 'string' || Array.isArray(results) || validatejs.isObject(results))) {
        throw 'results needs to a string or an array'
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

        if (validatejs.isObject(results)) {
            let columns = []
            let names = []
            for (let element of results) {
                columns.push(element.column)
                names.push(element.name)
            }
            let ret = {}
            for (let i of columns) {
                const index = columns.indexOf(i)
                ret[names[index]] = rows[0][i]
            }
            return ret
        } else if (Array.isArray(results)) {
            let ret = {}
            for (let i in results) {
                ret[results[i]] = rows[0][results[i]]
            }
            return ret
        } else {
            return rows[0][results]
        }
    }

    await s_register(uri, callback)
}

/**
 * Checks if data is already in given table/column
 * @param table Table to search in
 * @param column Column to search in
 * @param value Value to search for
 * @returns {Promise<boolean>} If it is in the table/column or not
 */
async function alreadySetSql(table, column, value) {
    let [res] = await conf.sql_connection.execute(`SELECT ${column} FROM ${table} WHERE ${column} = ?`, [value])
    return res.length !== 0
}

/**
 * Registers an WAMP method with logging output (And it is always good to do it centralized)
 * @param uri Uri to register method to
 * @param func Callback function
 * @returns {Promise<void>}
 */
async function s_register(uri, func) {
    await conf.ab_session.register(uri, func)
    console.log('Successfully Registered: \'' + uri + '\'')
}

/**
 * Generates Sql Data set ( (column, column2, ...)
 * @param {array} values To be in the data set. (Ordered)
 * @param {boolean} withParenthesis If the generated set should be with parenthesis
 * @returns {string} Sql data set
 */
function generateSqlDataSet(values, withParenthesis = true) {
    let ret = (withParenthesis ? '(' : '')
    for (let i of values) {
        ret += i + ', '
    }
    ret = ret.slice(0, -2) + (withParenthesis ? ')' : '')
    return ret
}

function generateSqlColumnSet(columns, withParenthesis = true, addAs=false) {
    let ret = (withParenthesis ? '(' : '')
    for (let i of columns) {
        ret += i + (addAs ? ' AS \'' + i +'\'' : '' ) +', '
    }
    ret = ret.slice(0, -2) + (withParenthesis ? ')' : '')
    return ret
}

function generateSqlDataValueSet(values) {
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

function generateUpdateDataValueSet(table, values, check) {
    let sql = 'UPDATE ' + table + ' SET '
    check = generateCheckSet(check)
}

function generateSetSet(values) {
    let sql = 'SET '
    let setValues = {}
    for (let i in values) {
        const val = values[i]
        if (validatejs.isObject(val)) {
            if (!!val.raw) {
                sql += i + ' = ' + val.value + ', '
                continue
            } else {
                values[i] = val.value
            }
        }
        sql += i + ' = :set_' + i + ', '
        setValues['set_' + i] = values[i]
    }
    sql = sql.slice(0, -2)
    return {sql, setValues}
}

function generateCheckSet(check) {
    let sql = 'WHERE '
    let checkValues = {}
    for (let i in check) {
        sql += i + ' = :check_' + i.replace('.', '_') + ' AND ';
        checkValues['check_' + i.replace('.', '_')] = check[i]
    }
    sql = sql.slice(0, -5)
    return {sql, checkValues}
}

function generateUpdateSet(table, check, values) {
    let sql = 'UPDATE ' + table + ' '
    let setSet = generateSetSet(values)
    let checkSet = generateCheckSet(check)
    sql += setSet.sql + ' ' + checkSet.sql
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
    } catch (err) {
        console.error('executeInsert', err)
        throw 'Internal Error (1004)'
    }
}

async function validate(attributes, constraints, options) {
    try {
        await validatejs.async(attributes, constraints, options)
    } catch (err) {
        if (err instanceof Error) {
            console.error('Validation Error', err)
            throw 'Internal Error (1005)'
        } else {
            conf.logger.log('verbose', 'Validation error')
            throw new autobahn.Error('io.fireline.error.validate', [err])
        }
    }
}

/**
 * Generates Get
 * @param {object} options Options
 * @param {String} options.uri Uri to register it to
 * @param {String} options.table Table to get data from
 * @param {array} options.elements Array of objects. Object: {name: 'name', column: 'column'}
 * @returns {Promise<void>}
 */
async function generateGet(options) {

    let addToWhere = ''
    let tables = [options.table]
    let columns = []
    let names = []
    let replaces = {}
    for (let element of options.elements) {
        //console.log(element)
        const colName = options.table + '.' + element.column
        if('substitute' in element) {
            columns.push(element.substitute.table + '.' + element.substitute.column)
            tables.push(element.substitute.table)
            addToWhere += ' ' + options.table + '.' + element.substitute.colHostTable + ' = '
                + options.table + '.' + element.substitute.colGuestTable + ' AND'
            //console.log('if', addToWhere)
        } else {
            if(element.column !== null && element.name !== null) {
                columns.push(colName)
                names.push(element.name)
            }
            if('replace' in element) {
                replaces[element.name] = element.replace
            }
        }
    }

    addToWhere = addToWhere.slice(0, -4)
    if(addToWhere !== '') {
        //console.log('addToWhere', addToWhere)
    }

    const baseSelect = 'SELECT ' + generateSqlColumnSet(columns, false, true) +
        ' FROM ' + generateSqlDataSet(tables, false)

    let constraints = {
        order: {
            inclusion: {within: ['asc', 'desc']},
        },
        order_by: {
            inclusion: {within: names}
        },
        limit: {
            numericality: {
                onlyInteger: true,
                greaterThanOrEqual: -1,
                lessThanOrEqual: 100,
            },
        },
        limit_offset: {
            numericality: {
                onlyInteger: true,
                greaterThan: -1,
            },
        },
        id: {
            numericality: {
                onlyInteger: true,
                greaterThan: -1,
            },
        },
        filter: {
            objNamesInArray: {values: names, message: '^Internal Server Error (500)'}
        }
    }

    /**
     * Standard get function generated by generateGet
     * @param {Array} args Populated by Autobahn
     * @param {Object} kwargs Populated by Autobahn
     * @param {String} kwargs.order In witch order to get it [asc, desc]. Default: asc. Only in combination with order_by
     * @param {String} kwargs.order_by By what data to order by
     * @param {String} kwargs.limit How many datasets to return. Default 10. Min 1. Max 100
     * @param {String} kwargs.limit_offset From where to get datasets. Default 0. Min 0.
     * @param {object} kwargs.filter Object to filter column after (Only equals)
     * @param {object} details Set by autobahn
     * @returns {Promise<Array>}
     */
    async function get(args, kwargs, details) {
        //console.log('baseSelect: ', baseSelect)
        if(options.replaceIdWithCaller) {
            kwargs.id = (await execute(
                    'SELECT ' + columns[names.indexOf('id')] + ' FROM ' + options.table +
                    ' WHERE ' + options.replaceIdWithCallerColumn + ' = :col', {col: details.caller_authid})
            )[0][0][columns[names.indexOf('id')]]
        }

        await validate(kwargs, constraints)

        let select = baseSelect;

        if(validatejs.isObject(kwargs.filter) && !validatejs.isEmpty(kwargs.filter)) {
            const filter = convertKeys(kwargs.filter, names, columns)
            const {sql: checkSql, checkValues} = generateCheckSet(filter)
            select += ' ' + checkSql
            kwargs = {...kwargs, ...checkValues}
        }
        if ('order_by' in kwargs && kwargs.order_by) {
            kwargs.order_by = columns[names.indexOf(kwargs.order_by)]
            kwargs.order = kwargs.order ? kwargs.order : 'asc'
            select += ' ORDER BY ' + kwargs.order_by + ' ' + kwargs.order
        }
        kwargs.limit = kwargs.limit ? kwargs.limit : 10
        if (kwargs.limit > -1) {
            kwargs.limit_offset = kwargs.limit_offset ? kwargs.limit_offset : 0
            select += ' LIMIT :limit OFFSET :limit_offset'
        }

        let [result] = await execute(select, kwargs)
        let data = []

        for (let res of result) {
            let obj = {}
            // Gotten data => sending data
            for (let col in columns) {
                obj[names[col]] = res[columns[col]]
            }
            const oldObj = {...obj}
            // Replace
            for(const name in replaces) {
                let value = null
                if(names.includes(name)) {
                    value = oldObj[name]
                }
                obj[name] = await replaces[name](value, oldObj)
            }

            data.push(obj)
        }

        return {data}
    }

    await s_register(options.uri, get)
}

function convertKeys(object, from, to) {
    let newObj = {}
    for(let i in object) {
        const index = from.indexOf(i)
        if(index !== -1) {
            newObj[to[index]] = object[i]
        } else {
            newObj[i] = object[i]
        }
    }

    return newObj
}

/**
 * Generates Update
 * @param {object} options Options
 * @param {String} options.uri Uri to register update to
 * @param {String} options.table Table to get data from
 * @param {array} options.elements Array of objects. Objects: {name: 'name', column: 'column'}
 * @param {object} options.constraint Constraint to check arguments against
 * @param {object} options.idConstraint Replace the default id constraints
 * @param {boolean} options.replaceIdWithCaller Replace the name id with the value of caller
 * @param {string} options.replaceIdWithCallerColumn Needs to be set if replaceIdWithCaller is true
 * @returns {Promise<void>}
 */
async function generateUpdate(options) {

    let columns = []
    let names = []
    let formaters = {}
    let replaceWiths = []
    for (let element of options.elements) {
        columns.push(element.column)
        names.push(element.name)
        if('replaceWith' in element) {
            replaceWiths.push(element)
        }
        if('format' in element) {
            formaters[element.name] = element.format
        }
    }

    const baseSelect = 'SELECT ' + generateSqlDataSet(columns, false) + ' FROM ' + options.table

    const defaultIdConstriant = {
        presence: true,
        numericality: {
            onlyInteger: true,
            greaterThan: -1,
        },
        inDB: {
            table: options.table,
            row: columns[names.indexOf('id')],
        }
    }

    const constraints = {
        id: (options.idConstraint ? options.idConstraint : defaultIdConstriant),
        values: {
            presence: true
        }
    }

    /**
     * Standard update function generated by generateUpdate
     * @param {Array} args Populated by Autobahn
     * @param {Object} kwargs Populated by Autobahn
     * @param {number} kwargs.id Id to update
     * @param {object} kwargs.values Values to update
     * @param {object} details Populated by Autobahn
     * @param {string|number} details.caller_authid Caller id of Autobahn
     * @returns {Promise<void>}
     */
    async function update(args, kwargs, details) {
        for(const replace of replaceWiths) {
            if(replace.replaceWith.type === 'caller') {
                kwargs[replace.name] = (await execute(
                    'SELECT ' + replace.column + ' FROM ' + options.table +
                    ' WHERE ' + replace.replaceWith.column + ' = :col', {col: details.caller_authid})
                )[0][0][replace.column]
            }
        }

        await validate(kwargs, constraints)
        await validate(kwargs.values, options.constraint)

        const {id, values} = kwargs

        let updateData = {}
        for (let i in values) {
            if (i === 'id') {
                continue
            }
            let index = names.indexOf(i)
            if (index === -1) {
                console.log(options.uri, i + ' was not found in names')
                throw new autobahn.Error('io.fireline.error.error', ['Internal server error 1081'])
            }
            if (i in formaters) {
                updateData[columns[index]] = formaters[i](values[i], args, kwargs, details)
            } else {
                updateData[columns[index]] = values[i]
            }
        }

        delete updateData.null

        updateData[columns[names.indexOf('id')]] = {
            raw: true,
            value: 'LAST_INSERT_ID(' + columns[names.indexOf('id')] + ')'
        }

        console.log('::::::', updateData)

        await executeUpdate(options.table, {[columns[names.indexOf('id')]]: id}, updateData)
        const row = (await execute(baseSelect + ' WHERE ' + columns[names.indexOf('id')] + ' = LAST_INSERT_ID() LIMIT 1'))[0][0]
        await conf.ab_session.publish(options.uri, [], {data: convertKeys(row, columns, names)})
    }

    await s_register(options.uri, update)
}

async function generateDelete(options) {

    let columns = []
    let names = []
    for (let element of options.elements) {
        columns.push(element.column)
        names.push(element.name)
    }

    const baseDelete = 'DELETE FROM ' + options.table + ' '
    const baseSelect = 'SELECT ' + generateSqlDataSet(columns, false) + ' FROM ' + options.table

    const constraints = {
        id: {
            presence: true,
            numericality: {
                onlyInteger: true,
                greaterThan: -1,
            },
            inDB: {
                table: options.table,
                row: columns[names.indexOf('id')],
            }
        },
    }

    async function _delete(args, kwargs) {
        await validate(kwargs, constraints)

        const {id} = kwargs
        const {sql, checkValues} = generateCheckSet({[columns[names.indexOf('id')]]: id})

        const row = (await execute(baseSelect + ' WHERE ' + columns[names.indexOf('id')] + ' = :id LIMIT 1', {id}))[0][0]
        await execute(baseDelete + sql, checkValues)
        await conf.ab_session.publish(options.uri, [], {data: convertKeys(row, columns, names)})
    }

    await s_register(options.uri, _delete)

}

async function generateCreate(options) {
    let columns = []
    let names = []
    let formaters = {}
    for (let element of options.elements) {
        columns.push(element.column)
        names.push(element.name)
        if('format' in element) {
            formaters[element.name] = element.format
        }
    }

    const baseInsert = 'INSERT INTO ' + options.table + ' '
    const baseSelect = 'SELECT ' + generateSqlDataSet(columns, false) + ' FROM ' + options.table +
        ' WHERE ' + columns[names.indexOf('id')] + ' = LAST_INSERT_ID() LIMIT 1'

    const constraints = {
        values: {
            presence: true,
        }
    }

    async function create(args, kwargs, details) {
        await validate(kwargs, constraints)
        await validate(kwargs.values, options.constraint)

        let insert = {}
        for(let name of names) {
            if(name in kwargs.values) {
                if(name in formaters) {
                    insert[name] = formaters[name](kwargs.values[name])
                } else {
                    insert[name] = kwargs.values[name]
                }
            }
        }

        const {dataSet, valueSet, values} = generateSqlDataValueSet(convertKeys(insert, names, columns))

        await execute(baseInsert + ' ' + dataSet + ' VALUES ' + valueSet, values)
        const row = (await execute(baseSelect))[0][0]
        await conf.ab_session.publish(options.uri, [], {data: convertKeys(row, columns, names)})
    }
    await s_register(options.uri, create)
}

/**
 *
 * @type {{register: register, register_authid_mysql: register_authid_mysql, s_register: s_register, alreadySetSql: function(*, *, *): boolean, execute: execute, generateSqlDataValueSet: function(*=): {dataSet: string, valueSet: string|string, values: *}, generateSqlDataSet: function(*): (string|string), generateCheckSet: function(*): {sql: string, checkValues}, generateSetSet: function(*): {sql: string, setValues}, generateInsert: function(*, *=): {sql: string, values: *}, createJoinedTable: function(*, *, *): string, executeUpdate: executeUpdate, executeInsert: executeInsert, validate: validate}}
 */
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
    generateGet,
    generateUpdate,
    generateDelete,
    generateCreate,
}