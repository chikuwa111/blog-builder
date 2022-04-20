import { copyPublishedFiles } from "../src/copyPublishedFiles";
import { removeAll } from "../src/removeAll";

async function run() {
  try {
    const { SRC_PATH, DEST_PATH } = process.env;
    if (!SRC_PATH) {
      throw new Error("process.env.SRC_PATH is not specified.");
    }
    if (!DEST_PATH) {
      throw new Error("process.env.DEST_PATH is not specified.");
    }

    await removeAll(DEST_PATH);
    await copyPublishedFiles(SRC_PATH, DEST_PATH);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

run();
