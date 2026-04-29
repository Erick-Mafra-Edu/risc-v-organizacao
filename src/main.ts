import { readFileSync } from "node:fs";
import { InstructionDetector } from "./instructionDetector";
import { conflictsDetector } from "./instruction-scheduler/conflictsDetector";
import { Instruction } from "./instructionsType";
    const inputFile = process.argv[2] || "input.txt";

    const input = readFileSync(inputFile, "utf-8");

    const instructionsInFile: Instruction[] = [];
    input.split("\n").forEach(line => {
        const trimmedLine = line.trim();
        if (!trimmedLine) return;
        
        const instructionDetector = new InstructionDetector(trimmedLine);
        const instruction = instructionDetector.detectInstruction();
        console.log(instruction.formatedString());
        instructionsInFile.push(instruction);
    });
    const conflictedInstructions = conflictsDetector(instructionsInFile);
    console.log("Conflitos detectados:");
    conflictedInstructions.forEach(instruction => {
        console.log(instruction.formatedString());
    });