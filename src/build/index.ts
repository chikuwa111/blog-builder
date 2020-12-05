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
function syncDeletedFiles(
  distFileNames: string[],
  contentFileNames: string[],
  distPath: string
): Promise<void[]> {
  const deletedFiles = distFileNames.filter(
    (fileName) => !contentFileNames.includes(fileName)
  );

  return Promise.all(
    deletedFiles.map((fileName) => {
      const filePath = path.resolve(distPath, fileName);
      return fs.rm(filePath);
    })
  );
}

/** fileData 内の [[wikilink]] を [wikilink](wikilink "wikilink") に置き換える */
function updateWikilinks(fileData: string): string {
  return fileData.replace(/\[\[(.+)\]\]/g, '[$1]($1 "$1")');
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

  const syncDeletedFilesPromise = syncDeletedFiles(
    distFileNames,
    contentFileNames,
    DIST_PATH
  );

  const updateFilesPromise = Promise.all(
    contentFileNames.map(async (fileName) => {
      const contentPath = path.resolve(CONTENT_PATH, fileName);
      const distPath = path.resolve(DIST_PATH, fileName);

      const data = await fs.readFile(contentPath, "utf-8");
      const { attributes } = fm<MyFrontMatterAttributes>(data);

      const published = isPublished(attributes);
      if (!published) {
        // unpublished になったファイルは DIST_PATH から削除する
        if (distFileNames.includes(fileName)) {
          return fs.rm(distPath);
        }
      }

      const updatedData = updateWikilinks(data);
      return fs.writeFile(distPath, updatedData, "utf-8");
    })
  );

  await Promise.all([syncDeletedFilesPromise, updateFilesPromise]);
}
