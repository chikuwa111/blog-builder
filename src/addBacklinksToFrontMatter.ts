import fs from "fs/promises";
import path from "path";

type BacklinkMap = {
  filePath: string;
  fileNameWithoutExt: string;
  backlinks: Array<string>;
};
type BacklinkMapList = Array<BacklinkMap>;

export async function addBacklinksToFrontMatter(dirPath: string) {
  const filePaths = (await fs.readdir(dirPath))
    .filter((fileName) => path.extname(fileName) === ".md")
    .map((fileName) => path.resolve(dirPath, fileName));

  const backlinkMapList: BacklinkMapList = filePaths.map((filePath) => ({
    filePath,
    fileNameWithoutExt: path.basename(filePath, ".md"),
    backlinks: [],
  }));

  await Promise.all(backlinkMapList.map(
    async ({ filePath, fileNameWithoutExt }) => {
      const content = await fs.readFile(filePath, "utf-8");
      backlinkMapList.forEach((it) => {
        if (content.includes(`[[${it.fileNameWithoutExt}]]`)) {
          it.backlinks.push(fileNameWithoutExt);
        }
      });
    }
  ));

  await Promise.all(
    backlinkMapList.map(async ({ filePath, backlinks }) => {
      const content = await fs.readFile(filePath, "utf-8");
      const contentWithBacklinks = content.replace(
        "---",
        `---\nbacklinks: [${backlinks.join(", ")}]`
      );
      await fs.writeFile(filePath, contentWithBacklinks);
    })
  );
}
