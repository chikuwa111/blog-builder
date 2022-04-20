import fs from "fs/promises";
import path from "path";

export async function removeAll(dirPath: string) {
  const fileNames = await fs.readdir(dirPath);
  const promises = fileNames.map((fileName) =>
    fs.unlink(path.resolve(dirPath, fileName))
  );
  return Promise.all(promises);
}
