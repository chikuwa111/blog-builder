import fs from "fs/promises";
import path from "path";
import { describe, expect, test } from "vitest";
import { addBacklinksToFrontMatter } from "../../src/addBacklinksToFrontMatter";

async function copyDir(from: string, to: string) {
  try {
    await fs.mkdir(to);
  } catch (e) {}

  const fileNames = await fs.readdir(from);
  const promises = fileNames.map(async (fileName) => {
    const srcFilePath = path.resolve(from, fileName);
    const toFilePath = path.resolve(to, fileName);
    return fs.copyFile(srcFilePath, toFilePath);
  });

  return Promise.all(promises);
}

async function removeAll(dirPath: string) {
  const fileNames = await fs.readdir(dirPath);
  const promises = fileNames.map((fileName) =>
    fs.unlink(path.resolve(dirPath, fileName))
  );
  return Promise.all(promises);
}

async function assertEqualDirContents(
  targetPath: string,
  expectedPath: string
) {
  // ファイルが一致していること
  const targetFileNames = (await fs.readdir(targetPath)).sort();
  const expectedFileNames = (await fs.readdir(expectedPath)).sort();

  expect(targetFileNames).toEqual(expectedFileNames);

  // 各ファイルの中身が一致していること
  const promises = targetFileNames.map(async (fileName) => {
    const targetFilePath = path.resolve(targetPath, fileName);
    const expectedFilePath = path.resolve(expectedPath, fileName);
    const [targetFileBody, expectedFileBody] = await Promise.all([
      fs.readFile(targetFilePath, "utf-8"),
      fs.readFile(expectedFilePath, "utf-8"),
    ]);
    expect(targetFileBody).toEqual(expectedFileBody);
  });
  await Promise.all(promises);
}

describe("addBacklinksToFrontMatter", async () => {
  const testcasesPath = path.resolve(__dirname, "testcases");
  const testcases = await fs.readdir(testcasesPath);

  testcases.forEach((testcase) => {
    test(testcase, async () => {
      const beforePath = path.resolve(testcasesPath, testcase, "before");
      const targetPath = path.resolve(testcasesPath, testcase, "target");
      const afterPath = path.resolve(testcasesPath, testcase, "after");

      // setup
      await removeAll(targetPath);
      await copyDir(beforePath, targetPath);

      // test
      await addBacklinksToFrontMatter(targetPath);

      // assert
      await assertEqualDirContents(targetPath, afterPath);
    });
  });
});
