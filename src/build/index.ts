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

/** DEST_PATH にあって SRC_PATH からなくなっているファイルがあったら DEST_PATH からも削除する */
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

export async function build(contentPath: string, distPath: string) {
  const distFileNames = (await fs.readdir(distPath)).filter(filterMarkdown);
  const contentFileNames = (await fs.readdir(contentPath)).filter(
    filterMarkdown
  );

  const syncDeletedFilesPromise = syncDeletedFiles(
    distFileNames,
    contentFileNames,
    distPath
  );

  const updateFilesPromise = Promise.all(
    contentFileNames.map(async (fileName) => {
      const contentFilePath = path.resolve(contentPath, fileName);
      const distFilePath = path.resolve(distPath, fileName);

      const data = await fs.readFile(contentFilePath, "utf-8");
      const { attributes } = fm<MyFrontMatterAttributes>(data);

      const published = isPublished(attributes);
      if (!published) {
        // unpublished になったファイルは DEST_PATH から削除する
        if (distFileNames.includes(fileName)) {
          return fs.rm(distFilePath);
        }
        return;
      }

      const updatedData = updateWikilinks(data);
      return fs.writeFile(distFilePath, updatedData, "utf-8");
    })
  );

  return Promise.all([syncDeletedFilesPromise, updateFilesPromise]);
}
