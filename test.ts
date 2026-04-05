import * as fs from "fs";
import { InstructionDetector } from "./src/instructionDetector";
import { InstructionOpcode } from "./src/instructionsType";

// Read the input file
const inputPath = "./input.txt";
const fileContent = fs.readFileSync(inputPath, "utf-8");
const instructions = fileContent.trim().split("\n");

console.log("=== RISC-V Instruction Detector Test ===\n");
console.log(`Processing ${instructions.length} instructions from ${inputPath}\n`);

instructions.forEach((hexInstruction, index) => {
    try {
        const trimmedHex = hexInstruction.trim();
        
        // Create detector instance to convert hex to binary
        const detector = new InstructionDetector(trimmedHex);
        
        // Detect the instruction
        const instruction = InstructionDetector.detectInstruction(detector["InstructionBinary"]);
        
        console.log(`[${index + 1}] Hex: ${trimmedHex.toUpperCase()}`);
        console.log(`    Binary: ${detector["InstructionBinary"]}`);
        console.log(`    Formatted: ${instruction.formatedString()}`);
        console.log();
    } catch (error) {
        console.error(`[${index + 1}] ERROR processing ${hexInstruction}: ${(error as Error).message}`);
        console.log();
    }
});

console.log("=== Test Complete ===");
