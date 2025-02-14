import {
    getFSAsync,
    getPath
} from "velor-utils/utils/sysProvider.mjs";

const __dirname = import.meta.dirname;

export const assets =
    async ({services}, use, testInfo) => {
        let assetsDir = getPath().join(__dirname, "..", "assets");
        let testFile = await getFSAsync().readFile(getPath().join(assetsDir, "test-file.txt"));

        await use({
            'test-file.txt': testFile.toString(),
        });
    }