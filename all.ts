import { exec } from 'https://deno.land/x/execute/mod.ts'
import { parse } from 'https://deno.land/std/flags/mod.ts'
import { renderFile } from 'https://deno.land/x/dejs@0.7.0/mod.ts'

import { applySchema } from './schema.ts'
import { isAlreadyInstalled, incrementRunCount } from './install_state.ts'
import { gracefulMkdir, startLoadingAnimation } from './utils.ts'

const { args } = Deno

const parsedArgs = parse(args)
const decoder = new TextDecoder('utf-8')
const configPath = `${Deno.cwd()}/config.json`
const data = await Deno.readFile(configPath)
const inputConfig = JSON.parse(decoder.decode(data))
const config = await applySchema(inputConfig)

// Let's write the api configuration to the expected location.
// One thing that isn't made configurable is the port the api is running on
// inside the docker container as that is defined at build time for the docker image.
const apiConfigData = `
apydox_api_github_client_id ${config.api.githubClientId}
apydox_api_github_client_secret ${config.api.githubClientSecret}
apydox_api_port 4305
`
await Deno.writeFile(
  `${parsedArgs.dataDir}/apydox-api.conf`,
  new TextEncoder().encode(apiConfigData)
)

await gracefulMkdir(`${parsedArgs.dataDir}/web`)

// Generate the nginx configuration file.
await renderFile(`${parsedArgs.dataDir}/nginx.conf`, {
  portalHost: config.portal.host,
  portalPort: 5640,
  apiHost: config.api.host,
  apiPort: 4305,
})

// Let's write the relevant environment variables used by docker compose
// to a .env file.
const dockerComposeEnvData = `
APYDOX_VERSION=${config.version}
HOST_APYDOX_API_CONFIG_FILE=${parsedArgs.dataDir}/apydox-api.conf
APYDOX_API_CONFIG_FILE=/apydox-api.conf
APYDOX_PORTAL_HOST=${config.portal.host}
APYDOX_API_HOST=${config.api.host}
NGINX_CONFIG_LOCATION=${parsedArgs.dataDir}/nginx.conf
WEB_ASSETS_LOCATION=${parsedArgs.dataDir}/web/
DHPARAM_LOCATION=${parsedArgs.dataDir}/dhparam/
TLS_CERT_EMAIL=${config.tlsCertRegistrationEmail}
`
await Deno.writeFile(`.env`, new TextEncoder().encode(dockerComposeEnvData))

const alreadyInstalled = await isAlreadyInstalled()
if (!alreadyInstalled) {
  await gracefulMkdir(`${parsedArgs.dataDir}/dhparam`)
  await exec(
    `openssl dhparam -out ${parsedArgs.dataDir}/dhparam/dhparam-2048.pem 2048`
  )

  // Set up an auto-renewal cron job for the TLS certificate associated with the apydox hosts.
  // This runs in the background with it's own cron server, no need to get into the root OS
  // crontab.
  await exec(
    `deno run --allow-read=${Deno.cwd()},${
      parsedArgs.dataDir
    } --allow-write=${Deno.cwd()},${
      parsedArgs.dataDir
    } --allow-env renew_cert.ts --dataDir ${parsedArgs.dataDir}`
  )
} else {
  // Let's shut down the already running instance for an update or a fresh install.
  await exec('docker-compose stop && docker-compose rm -v -f')
}

// load up the apydox containers.
await exec('docker-compose up -d')
console.log(
  'Bringing up services, this will take a few minutes, go grab yourself a coffee ...'
)
const loadingAnimation = startLoadingAnimation()

async function checkStatus() {
  const output = await exec('docker-compose ps')
  const matches = Array.from(output.matchAll(/Up \(healthy\)/))
  // Once all services except from the one-time certbot container
  // are up and running we'll assume we're good to go.
  // Might be worth considering a more robust solution.
  if (matches.length < 4) {
    setTimeout(() => {
      checkStatus()
    }, 1000)
  } else {
    loadingAnimation.stop()
    console.log('All services are up and running!')
  }
}

setTimeout(() => {
  checkStatus()
}, 1000)

await incrementRunCount()
