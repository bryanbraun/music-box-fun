import { install } from 'esinstall';
import { readFile } from 'fs/promises';

const json = JSON.parse(
  await readFile(
    new URL('./package.json', import.meta.url)
  )
);
const moduleList = json.buildModules.install;
const installOptions = json.buildModules.installOptions;

await install(moduleList, installOptions);
