import { build } from "../src/build";

async function run() {
  try {
    const { CONTENT_PATH, DIST_PATH } = process.env;
    if (!CONTENT_PATH) {
      throw new Error("process.env.CONTENT_PATH is not specified.");
    }
    if (!DIST_PATH) {
      throw new Error("process.env.DIST_PATH is not specified.");
    }
    
    await build(CONTENT_PATH, DIST_PATH);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

run();
