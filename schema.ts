import vs from 'https://deno.land/x/value_schema/mod.ts'

export type ApiConfig = {
  githubClientId: string
  githubClientSecret: string
  host: string
}

export type PortalConfig = {
  host: string
}

export type Config = {
  version: string
  api: ApiConfig
  portal: PortalConfig
  tlsCertRegistrationEmail: string
}

export const configSchema = {
  version: vs.string({
    ifUndefined: 'latest',
  }),
  tlsCertRegistrationEmail: vs.string(),
  api: vs.object({
    schemaObject: {
      githubClientId: vs.string(),
      githubClientSecret: vs.string(),
      host: vs.string(),
    },
  }),
  portal: vs.object({
    schemaObject: {
      host: vs.string(),
    },
  }),
}

export function applySchema(inputConfig: any): Promise<Config> {
  return new Promise((resolve, reject) => {
    const onError = (error: vs.ValueSchemaError) => {
      reject(error)
    }
    // This is not ideal, but due to the API of applySchemaObject, this is the best
    // we can do to ensure we only continue if an error hasn't occurred.
    let applied: Config
    const onFinished = () => {
      resolve(applied)
    }
    applied = vs.applySchemaObject<Config>(
      configSchema,
      inputConfig,
      onError,
      onFinished
    )
  })
}
