# Magento Argon2 Hash Verifier

This project is a utility tool written in JavaScript that verifies Magento Argon2 hashes. It is based on the [Magento Cracker](https://github.com/cyclone-github/magento_cracker) project.

## Description

The tool reads a file containing hashes and a file containing a wordlist. It then verifies each hash with each password in the wordlist. If a password matches a hash, it prints the hash and the password.

## Installation

This project uses npm for dependency management. To install the dependencies, run the following command in the project root directory:

```bash
npm install
```

## Usage

The tool requires two command line arguments: the path to the hash file and the path to the wordlist file. Here is an example of how to run the tool:

```bash
node index.js --hash path/to/hashfile --wordlist path/to/wordlist
```

## Dependencies

This project depends on the following npm packages:

- argon2: For hash verification.
- yargs: For command line argument parsing.

## License

This project is licensed under the MIT License. See the `LICENSE` file for more details.
