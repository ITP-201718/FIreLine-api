const passwordHash = require('password-hash')
const helpers = require('../../helpers')

async function registerGet(conf) {
    const options = {
        table: 'mitglied',
        elements: [
            {name: 'id', column: 'uname'},
            {name: 'first_name', column: 'vname'},
            {name: 'last_name', column: 'nname'},
            {name: 'mail', column: 'mail'},
            {name: 'sbuergerschaft', column: 'sbuergerschaft'},
            {name: 'birthday', column: 'gebdat'},
            {name: 'zugehoerigkeit', column: 'zugehoerigkeit'},
            {name: 'gender', column: 'geschlecht'},
            {name: 'rid', column: 'rid'},
            {name: 'zid', column: 'zid'},
        ],
        uri: conf.uri + '.get'
    }

    let columns = []
    let names = []
    for (let element of options.elements) {
        columns.push(element.column)
        names.push(element.name)
    }

    await helpers.register_authid_mysql(options.uri,
        'SELECT ' + helpers.generateSqlDataSet(columns, false) + ' FROM ' +
        options.table + ' WHERE uname = :caller', options.elements)

}

async function registerUpdate(conf) {
    const updateCfg = {
        table: 'mitglied',
        replaceIdWithCaller: true,
        replaceIdWithCallerColumn: 'uname',
        idConstraint: {
            presence: true,
            inDB: {
                table: 'mitglied',
                row: 'uname',
            }
        },
        elements: [
            {name: 'id', column: 'mid'},
            {name: 'first_name', column: 'vname'},
            {name: 'last_name', column: 'nname'},
            {name: 'mail', column: 'mail'},
            {name: 'sbuergerschaft', column: 'sbuergerschaft'},
            //{name: 'gebdat', column: 'gebdat'}, // Why not?
            //{name: 'zugehoerigkeit', column: 'zugehoerigkeit'}, // Only admin
            //{name: 'gender', column: 'geschlecht'}, // Why not?
            //{name: 'rid', column: 'rid'}, // Only admin
            //{name: 'zid', column: 'zid'}, // Only admin
        ],
        uri: conf.uri + '.update'
    }

    await helpers.generateUpdate(updateCfg)
}

async function register(conf) {

    await registerGet(conf)
    await registerUpdate(conf)
}

module.exports={register}