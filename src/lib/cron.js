import cron from 'cron'
import https from 'https'
import dotenv from 'dotenv'

dotenv.config();

const job = new cron.CronJob('*/14 * * * *', function () {
    https
        .get(process.env.API_URL, (res) => {
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
