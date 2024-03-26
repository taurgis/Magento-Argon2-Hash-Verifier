const argon2 = require('argon2');
const fs = require('fs');
const readline = require('readline');
const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');

const argv = yargs(hideBin(process.argv))
    .option('h', {
        alias: 'hash',
        describe: 'Path to the hash file',
        type: 'string',
        demandOption: true
    })
    .option('w', {
        alias: 'wordlist',
        describe: 'Path to the wordlist file',
        type: 'string',
        demandOption: true
    })
    .version()
    .alias('v', 'version')
    .help()
    .argv;

// Get the file paths from the command line arguments
const hashFilePath = argv.hash;
const wordlistFilePath = argv.wordlist;
/**
 * Verifies the given hash string with the given password.
 *
 * @param {string} hashString - The hash string to verify.
 * @param {string} password - The password to verify the hash with.
 *
 * @returns {Promise<void>}
 */
async function verifyHash(hashString, password) {
    const split = hashString.trim().split(":");
    if (split.length !== 3) {
        console.log(`Invalid hash format: ${hashString}`);
        return;
    }

    let [hash, salt_b64, version] = split;

    if (version === "2" || version === "3") {
        version += "_32_2_67108864";
        hashString = `${hash}:${salt_b64}:${version}`;
    }

    const salt = Buffer.from(salt_b64.substring(0, 16));
    const versionInfo = version.split("_");

    if (versionInfo.length !== 4) {
        console.log(`Invalid version format: ${hashString}`);

        return;
    }

    const hashLength = parseInt(versionInfo[1]);
    const hashTimeCost = parseInt(versionInfo[2]);
    const hashMemory = parseInt(versionInfo[3]) / 1024;

    password = Buffer.from(password.trim());

    const result = await argon2.hash(password, {
        salt,
        type: argon2.argon2id,
        memoryCost: hashMemory,
        timeCost: hashTimeCost,
        parallelism: 1,
        hashLength: hashLength,
        raw: true
    });

    const hexHash = result.toString('hex');

    if (hexHash === hash) {
        console.log(`${hashString.trim()}:${password.toString()}`);
    }
}

/**
 * Processes each line of the file at the given file path.
 *
 * @param {string} filePath - The path to the file to process.
 * @param {Function} processLine - The function to process each line of the file.
 *
 * @returns {Promise<void>}
 */
async function processFile(filePath, processLine) {
    const fileStream = fs.createReadStream(filePath);

    const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity
    });

    for await (const line of rl) {
        await processLine(line);
    }
}

/**
 * Processes each hash string in the hash file and verifies it with each password in the wordlist file.
 */
processFile(hashFilePath, async (hashString) => {
    await processFile(wordlistFilePath, async (password) => {
        await verifyHash(hashString, password);
    });
}).then(() => {
    console.log("Done");
});
