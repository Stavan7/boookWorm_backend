import cron from 'cron'
import https from 'https'

const job = new cron.CronJob('*/14 * * * * *', function () {
    https
        .get('https://api.example.com/cron', (res) => {
            if (res.stausCode === 200) {
                console.log('Cron job completed successfully')
            } else {
                console.log('Cron job failed', res.stausCode)
            }
        }).on("error", (err) => {
            console.log('Error while sending request: ', err.message)
        })
})

export default job;
