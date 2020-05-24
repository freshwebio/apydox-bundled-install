import { exec } from 'https://deno.land/x/execute/mod.ts'
import { cron } from 'https://deno.land/x/deno_cron/cron.ts'
import { parse } from 'https://deno.land/std/flags/mod.ts'

import daemon from './daemon.ts'

const { args } = Deno

const parsedArgs = parse(args)

// Run this script as a background process.
daemon()

async function renew() {
  const renewOutput = await exec(
    'docker-compose --no-ansi run certbot renew && docker-compose --no-ansi kill -s SIGHUP webserver'
  )
  const pruneOutput = await exec('docker system prune -af')
  await Deno.writeFile(
    `${parsedArgs.dataDir}/cron.log`,
    new TextEncoder().encode(`
  ${renewOutput}
  ${pruneOutput}
  `),
    { append: true }
  )
}

// Run job daily at midnight.
cron('0 0 0 * * *', () => {
  renew()
})
