const { DEST_PATH } = process.env;
if (!DEST_PATH) {
  throw new Error("process.env.DEST_PATH is not specified.");
}
console.log(DEST_PATH);
