import { readFileSync } from "node:fs";
import { InstructionDetector } from "./instructionDetector";

    const inputFile = process.argv[2] || "input.txt";

    const input = readFileSync(inputFile, "utf-8");


    input.split("\n").forEach(line => {
        const instruction = InstructionDetector.detectInstruction(line);
        console.log(instruction.formatedString());
    });