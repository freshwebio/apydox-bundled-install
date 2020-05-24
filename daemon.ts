export default function daemon(): number {
  if (!Deno.env.get('__daemon')) {
    const args = [...Deno.args]
    const script = './' + args.shift()
    const env = { ...Deno.env.toObject(), __daemon: 'true' }
    Deno.run({
      cmd: [Deno.execPath(), 'run', '--allow-all', script, ...args],
      env,
      stdout: 'null',
      stdin: 'null',
      stderr: 'null',
    })
    Deno.exit()
  } else {
    return Deno.pid
  }
}
