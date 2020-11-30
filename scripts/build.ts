import fm from "front-matter";
import fs from "fs/promises";
import path from "path";

async function isPublished(filePath: string): Promise<boolean> {
  const data = await fs.readFile(filePath, "utf-8");
  const content = fm(data);
  // front matterで`published: true`となっているものだけpublishする
  return !!(content.attributes as { published: boolean | undefined }).published;
}

async function build() {
  const { CONTENT_PATH, DIST_PATH } = process.env;
  if (!CONTENT_PATH) {
    throw new Error("process.env.CONTENT_PATH is not specified.");
  }
  if (!DIST_PATH) {
    throw new Error("process.env.DIST_PATH is not specified.");
  }

  const fileNames = await fs.readdir(CONTENT_PATH);
  await Promise.all(
    fileNames
      .filter((fileName) => path.extname(fileName) === ".md")
      .map(async (fileName) => {
        const contentPath = path.resolve(CONTENT_PATH, fileName);

        const published = await isPublished(contentPath);
        if (!published) {
          return;
        }

        const distPath = path.resolve(DIST_PATH, fileName);
        await fs.copyFile(contentPath, distPath);
      })
  );
}

async function run() {
  try {
    await build();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

run();
