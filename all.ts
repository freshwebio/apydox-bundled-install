// import { exec } from 'https://deno.land/x/execute/mod.ts'
import { parse } from 'https://deno.land/std/flags/mod.ts';

const { args } = Deno;

const parsedArgs = parse(args);

const decoder = new TextDecoder('utf-8');
const configPath = `${Deno.cwd()}/config.json`;
const data = await Deno.readFile(configPath);
const config = JSON.parse(decoder.decode(data));

// Let's write the portal configuration to the expected location.
console.log(parsedArgs.dataDir);
console.log(configPath);
console.log(config);