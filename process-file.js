// Script auxiliar para executar o process-file compilado em dist.
const { processInstructionFile } = require("./dist/process-file");

const args = process.argv.slice(2);
const filePath = args[0] || "./input.txt";

processInstructionFile(filePath);
