import { exec } from "child_process";
import { format } from "date-fns";
import fs from "fs/promises";
import path from "path";
import util from "util";

const execPromise = util.promisify(exec);

export async function addLastModifiedDateToFrontMatter(srcPath: string, destPath: string) {
  const destFileNames = await fs.readdir(destPath);
  const promises = destFileNames.map(async (fileName) => {
    const { stdout } = await execPromise(
      `git log -1 --pretty="%ad" --date=iso -- "${fileName}"`,
      { cwd: srcPath }
    );
    const date =
      stdout.trimEnd() || format(new Date(), "yyyy-MM-dd HH:mm:ss +0900");

    const filePath = path.resolve(destPath, fileName);
    const content = await fs.readFile(filePath, "utf-8");
    const contentWithDate = content.replace(
      "---",
      `---\nlast_modified_date: ${date}`
    );
    await fs.writeFile(filePath, contentWithDate);
  });

  return Promise.all(promises);
}
