import fm from "front-matter";
import fs from "fs/promises";
import path from "path";

type MyFrontMatterAttributes = {
  published: boolean | undefined;
};

function isPublished(attributes: MyFrontMatterAttributes): boolean {
  return !!attributes.published;
}

function filterMarkdown(fileName: string): boolean {
  return path.extname(fileName) === ".md";
}

export async function copyPublishedFiles(
  srcPath: string,
  destPath: string
) {
  const srcFileNames = (await fs.readdir(srcPath)).filter(
    filterMarkdown
  );
  const promises = srcFileNames.map(async (fileName) => {
    const srcFilePath = path.resolve(srcPath, fileName);

    const data = await fs.readFile(srcFilePath, "utf-8");
    const { attributes } = fm<MyFrontMatterAttributes>(data);
    const published = isPublished(attributes);
    if (!published) return;

    const destFilePath = path.resolve(destPath, fileName);
    return fs.copyFile(srcFilePath, destFilePath);
  });

  return Promise.all(promises);
}
