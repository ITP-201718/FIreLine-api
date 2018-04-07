const { sleep } = require('../globalHelpers')

register = async (conf) => {

    const stopUri = conf.base_uri + ".server.stop"

    try {
        await conf.ab_session.call(stopUri)
        console.log('Stopped other backend. Waiting 3 seconds to let it close correctly')
        await sleep(3000)
    } catch (err) {
        console.log('No other backend found')
    }

    let exit_flag = false

    conf.ab_session.register(stopUri, () => {
        console.warn('Got signal from other backend to stop. Set exit signal')
        exit_flag = true
        return true
    })

    setInterval(() => {
        if(exit_flag) {
            console.warn('Got exit signal. Exiting...')
            process.emit('SIGTERM')
        }
    }, 1000)

    console.log("Successfully Registered: '" + stopUri + "'")
}

module.exports = {
    register
}