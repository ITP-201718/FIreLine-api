/**
 * Base class of other components
 * @param {object} conf Configuration of the component
 * @param {object} conf.ab_session Autobahn Session
 * @param {object} conf.sql_connection SQL Connection
 * @param {object} conf.logger Logger
 */
class Component {
    constructor(conf) {
        this.conf = conf
    }

    async register() {

    }
}

module.exports = Component