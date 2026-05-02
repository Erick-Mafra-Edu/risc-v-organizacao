import { readFileSync } from "node:fs";
import { InstructionDetector } from "./instructionDetector";
import { conflictsDetectorPipelineClassico } from "./instruction-scheduler/conflictsDetector";
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
    const conflictedInstructions = conflictsDetectorPipelineClassico(instructionsInFile);
    console.log("Conflitos detectados Sem o Fowarding:");
    conflictedInstructions.forEach(instruction => {
        console.log(instruction.formatedString());
    });
    console.log("Conflitos detectados Com o Fowarding:");
    const conflictedInstructionsWithForwarding = conflictsDetectorPipelineClassico(instructionsInFile, "FORWARDING");
    conflictedInstructionsWithForwarding.forEach(instruction => {
        console.log(instruction.formatedString(),instruction.getType());
    });