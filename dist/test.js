"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const fs = __importStar(require("fs"));
const instructionDetector_1 = require("./instructionDetector");
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
        const detector = new instructionDetector_1.InstructionDetector(trimmedHex);
        // Detect the instruction
        const instruction = instructionDetector_1.InstructionDetector.detectInstruction(detector.InstructionBinary);
        console.log(`[${index + 1}] Hex: ${trimmedHex.toUpperCase()}`);
        console.log(`    Binary: ${detector.InstructionBinary}`);
        console.log(`    Formatted: ${instruction.formatedString()}`);
        console.log();
    }
    catch (error) {
        console.error(`[${index + 1}] ERROR processing ${hexInstruction}: ${error.message}`);
        console.log();
    }
});
console.log("=== Test Complete ===");
//# sourceMappingURL=test.js.map