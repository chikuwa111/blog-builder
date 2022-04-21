import { exec } from "child_process";
import util from "util";

const execPromise = util.promisify(exec);

export async function updateWikilink(dirPath: string) {
  const { stdout, stderr } = await execPromise(
    `npx foam janitor -w "${dirPath}"`
  );
  console.log(stdout);
  console.error(stderr);
}
