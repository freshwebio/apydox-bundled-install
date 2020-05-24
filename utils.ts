export async function gracefulMkdir(directory: string) {
  try {
    return Deno.mkdir(directory)
  } catch (err) {}
}

export function startLoadingAnimation() {
  const loading = (function () {
    const P = ['\\', '|', '/', '-']
    let x = 0
    return setInterval(function () {
      Deno.stdout.write(new TextEncoder().encode('\r' + P[x++]))
      x &= 3
    }, 250)
  })()
  return {
    stop: () => {
      clearInterval(loading)
    },
  } as const
}
