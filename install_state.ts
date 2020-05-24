async function getRunCount() {
  try {
    const countText = await Deno.readTextFile('runcount')
    const count = Number.parseInt(countText)
    return !Number.isNaN(count) ? count : 0
  } catch (error) {
    return 0
  }
}

export async function isAlreadyInstalled() {
  const runCount = await getRunCount()
  return runCount > 0
}

export async function incrementRunCount() {
  const runCount = await getRunCount()
  await Deno.writeTextFile('runcount', `${runCount + 1}`)
}
