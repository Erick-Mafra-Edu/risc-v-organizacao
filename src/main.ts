import { readFileSync } from "node:fs";
import { InstructionDetector } from "./instructionDetector";
import { conflictsDetectorPipelineClassico } from "./instruction-scheduler/conflictsDetector";
import { Instruction } from "./instructionsType";
import { ResolveConflict } from "./instruction-scheduler/resolveConflict";
import { RISCVSimulator } from "./simulator";

const inputFile = process.argv[2] || "input.txt";

try {
    const input = readFileSync(inputFile, "utf-8");

    const instructionsInFile: Instruction[] = [];
    console.log("\n" + "╔═══════════════════════════════════════════════════════════════╗");
    console.log("║           RISC-V INSTRUCTION DETECTOR & SIMULATOR             ║");
    console.log("╚═══════════════════════════════════════════════════════════════╝");
    
    console.log("\n--- Parsing Instructions ---");
    input.split("\n").forEach((line, index) => {
        const trimmedLine = line.trim();
        if (!trimmedLine) return;
        
        try {
            const instructionDetector = new InstructionDetector(trimmedLine);
            const instruction = instructionDetector.detectInstruction();
            console.log(`[${(index + 1).toString().padStart(2, '0')}] Hex: ${trimmedLine.padEnd(8)} -> ${instruction.formatedString()}`);
            instructionsInFile.push(instruction);
        } catch (e) {
            console.error(`Error parsing line ${index + 1}: ${trimmedLine}`);
        }
    });

    const conflictedInstructions = conflictsDetectorPipelineClassico(instructionsInFile);
    const conflictedInstructionsWithForwarding = conflictsDetectorPipelineClassico(instructionsInFile, "FORWARDING");
    
    console.log("\n--- Pipeline Analysis ---");
    console.log(`Total Instructions: ${instructionsInFile.length}`);
    console.log(`Conflicts (Classic):    ${conflictedInstructions.length}`);
    console.log(`Conflicts (Forwarding): ${conflictedInstructionsWithForwarding.length}`);

    const resolvedInstructions = ResolveConflict(conflictedInstructions, instructionsInFile);
    const resolvedInstructionsWithForwarding = ResolveConflict(conflictedInstructionsWithForwarding, instructionsInFile);

    console.log("\n--- Simulation: ORIGINAL CODE (with Hazards) ---");
    const simulatorOriginal = new RISCVSimulator(instructionsInFile, 'PIPELINE');
    simulatorOriginal.run();
    simulatorOriginal.printState();

    console.log("\n--- Simulation: RESOLVED CODE (with NOPs) ---");
    const simulatorResolved = new RISCVSimulator(resolvedInstructions, 'PIPELINE');
    simulatorResolved.run();
    simulatorResolved.printState();

} catch (err) {
    console.error("Could not read input file:", inputFile);
}