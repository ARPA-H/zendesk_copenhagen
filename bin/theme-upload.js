/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-env node */
const brandId = process.env.BRAND_ID;
const { execFileSync } = require("child_process");

// Use execFileSync with an argv array (no shell) so that values coming
// indirectly from the zcli/API responses (e.g. themeId) can never be
// interpreted as shell metacharacters and injected into the command line.
function zcli(args) {
  try {
    const data = execFileSync("yarn", ["zcli", ...args, "--json"]);
    return JSON.parse(data.toString());
  } catch (e) {
    console.error(e.message);
    console.error(e.stdout.toString());
    process.exit(1);
  }
}

const { themeId } = zcli(["themes:import", `--brandId=${brandId}`]);

zcli(["themes:publish", `--themeId=${themeId}`]);

const { themes } = zcli(["themes:list", `--brandId=${brandId}`]);

for (const { live, id } of themes) {
  if (!live) zcli(["themes:delete", `--themeId=${id}`]);
}
