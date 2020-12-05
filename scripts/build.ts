import { build } from "../src/build";

async function run() {
  try {
    await build();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

run();
