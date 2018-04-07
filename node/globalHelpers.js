async function sleep(mills) {
    return new Promise((resolve, reject) => {
        setTimeout(resolve, mills)
    })
}

module.exports = {
    sleep,
}