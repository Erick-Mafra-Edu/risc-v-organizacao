"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const node_fs_1 = require("node:fs");
const instructionDetector_1 = require("./instructionDetector");
const inputFile = process.argv[2] || "input.txt";
const input = (0, node_fs_1.readFileSync)(inputFile, "utf-8");
input.split("\n").forEach(line => {
    const instruction = instructionDetector_1.InstructionDetector.detectInstruction(line);
    console.log(instruction.formatedString());
});
//# sourceMappingURL=main.js.map