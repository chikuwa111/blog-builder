import fm from "front-matter";
import fs from "fs/promises";
import path from "path";

type MyFrontMatterAttributes = {
  published: boolean | undefined;
};

/** front matter で `published: true` となっているものだけ publish する */
function isPublished(attributes: MyFrontMatterAttributes): boolean {
  return !!attributes.published;
}

function filterMarkdown(fileName: string): boolean {
  return path.extname(fileName) === ".md";
}

/** DIST_PATH にあって CONTENT_PATH からなくなっているファイルがあったら DIST_PATH からも削除する */
async function syncDeletedFiles(
  distFileNames: string[],
  contentFileNames: string[],
  distPath: string
): Promise<void> {
  const deletedFiles = distFileNames.filter(
    (fileName) => !contentFileNames.includes(fileName)
  );

  await Promise.all(
    deletedFiles.map(async (fileName) => {
      const filePath = path.resolve(distPath, fileName);
      await fs.rm(filePath);
    })
  );
}

export async function build() {
  const { CONTENT_PATH, DIST_PATH } = process.env;
  if (!CONTENT_PATH) {
    throw new Error("process.env.CONTENT_PATH is not specified.");
  }
  if (!DIST_PATH) {
    throw new Error("process.env.DIST_PATH is not specified.");
  }

  const distFileNames = (await fs.readdir(DIST_PATH)).filter(filterMarkdown);
  const contentFileNames = (await fs.readdir(CONTENT_PATH)).filter(
    filterMarkdown
  );

  await syncDeletedFiles(distFileNames, contentFileNames, DIST_PATH);

  await Promise.all(
    contentFileNames.map(async (fileName) => {
      const contentPath = path.resolve(CONTENT_PATH, fileName);
      const distPath = path.resolve(DIST_PATH, fileName);

      const data = await fs.readFile(contentPath, "utf-8");
      const { attributes } = fm<MyFrontMatterAttributes>(data);

      const published = isPublished(attributes);
      if (!published) {
        // unpublished になったファイルは DIST_PATH から削除する
        if (distFileNames.includes(fileName)) {
          await fs.rm(distPath);
        }
        return;
      }

      await fs.copyFile(contentPath, distPath);
    })
  );
}
