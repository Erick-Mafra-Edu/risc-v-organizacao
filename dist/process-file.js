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
const path = __importStar(require("path"));
const instructionDetector_1 = require("./instructionDetector");
// Get the file path from command line arguments
const args = process.argv.slice(2);
const filePath = args[0] || "./input.txt";
// Validate file exists
if (!fs.existsSync(filePath)) {
    console.error(`❌ Erro: Arquivo '${filePath}' não encontrado`);
    process.exit(1);
}
// Read and process the file
const fileContent = fs.readFileSync(filePath, "utf-8");
const instructions = fileContent.trim().split("\n").filter(line => line.trim());
console.log("╔════════════════════════════════════════════════════════════════╗");
console.log("║        RISC-V Instruction Detector - Processador de Arquivo     ║");
console.log("╚════════════════════════════════════════════════════════════════╝\n");
console.log(`📄 Arquivo: ${path.resolve(filePath)}`);
console.log(`📊 Total de instruções: ${instructions.length}\n`);
console.log("─".repeat(70));
let successCount = 0;
let errorCount = 0;
instructions.forEach((hexInstruction, index) => {
    try {
        const trimmedHex = hexInstruction.trim();
        if (!trimmedHex)
            return;
        // Create detector and convert
        const detector = new instructionDetector_1.InstructionDetector(trimmedHex);
        // Detect instruction
        const instruction = instructionDetector_1.InstructionDetector.detectInstruction(detector.InstructionBinary);
        console.log(`\n[${String(index + 1).padStart(3)}] ✅ Successo`);
        console.log(`     Hexadecimal: ${trimmedHex.toUpperCase()}`);
        console.log(`     Binário:     ${detector.InstructionBinary}`);
        console.log(`     Formato:     ${instruction.formatedString()}`);
        successCount++;
    }
    catch (error) {
        errorCount++;
        console.error(`\n[${String(index + 1).padStart(3)}] ❌ Erro`);
        console.error(`     Hex:      ${hexInstruction.trim()}`);
        console.error(`     Mensagem: ${error.message}`);
    }
});
console.log("\n" + "─".repeat(70));
console.log(`\n📈 Resumo:`);
console.log(`   ✅ Sucesso: ${successCount}`);
console.log(`   ❌ Erros:   ${errorCount}`);
console.log(`   📊 Taxa:    ${((successCount / (successCount + errorCount)) * 100).toFixed(1)}%\n`);
//# sourceMappingURL=process-file.js.map