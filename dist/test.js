"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const instructionDetector_1 = require("./instructionDetector");
const testCases = [
    {
        hex: "0FC10297",
        expectedType: "U",
        expectedBinary: "00001111110000010000001010010111",
        description: "LUI - Load Upper Immediate"
    },
    {
        hex: "00028293",
        expectedType: "I",
        expectedBinary: "00000000000000101000001010010011",
        description: "ADDI - Add Immediate"
    },
    {
        hex: "0002A303",
        expectedType: "I",
        expectedBinary: "00000000000000101010001100000011",
        description: "LW - Load Word"
    },
    {
        hex: "00500513",
        expectedType: "I",
        expectedBinary: "00000000010100000000010100010011",
        description: "ADDI - Add Immediate with offset"
    },
    {
        hex: "006503B3",
        expectedType: "R",
        expectedBinary: "00000000011001010000001110110011",
        description: "ADD - Add Register"
    },
    {
        hex: "0072A023",
        expectedType: "S",
        expectedBinary: "00000000011100101010000000100011",
        description: "SW - Store Word"
    },
    {
        hex: "00A50263",
        expectedType: "B",
        expectedBinary: "00000000101001010000001001100011",
        description: "BEQ - Branch if Equal"
    },
    {
        hex: "004000EF",
        expectedType: "J",
        expectedBinary: "00000000010000000000000011101111",
        description: "JAL - Jump and Link"
    },
    {
        hex: "00A00893",
        expectedType: "I",
        expectedBinary: "00000000101000000000100010010011",
        description: "ADDI - Add Immediate"
    },
    {
        hex: "00000073",
        expectedType: "SYSTEM",
        expectedBinary: "00000000000000000000000001110011",
        description: "ECALL - Environment Call"
    }
];
console.log("╔════════════════════════════════════════════════════════════════╗");
console.log("║       RISC-V Instruction Detector - Test Suite com Validação    ║");
console.log("╚════════════════════════════════════════════════════════════════╝\n");
let passedTests = 0;
let failedTests = 0;
testCases.forEach((testCase, index) => {
    try {
        // Create detector instance to convert hex to binary
        const detector = new instructionDetector_1.InstructionDetector(testCase.hex);
        const actualBinary = detector.InstructionBinary;
        // Detect the instruction
        const instruction = instructionDetector_1.InstructionDetector.detectInstruction(actualBinary);
        const formatted = instruction.formatedString();
        // Validate binary conversion
        const binaryMatch = actualBinary === testCase.expectedBinary;
        // Validate instruction type
        const typeMatch = formatted.includes(`Type ${testCase.expectedType}`);
        // Overall test result
        const testPassed = binaryMatch && typeMatch;
        if (testPassed) {
            console.log(`✅ [${String(index + 1).padStart(2)}] PASS - ${testCase.description}`);
            console.log(`    Hex:      ${testCase.hex.toUpperCase()}`);
            console.log(`    Type:     ${testCase.expectedType}-Type`);
            console.log(`    Binary:   ${actualBinary}`);
            passedTests++;
        }
        else {
            console.error(`❌ [${String(index + 1).padStart(2)}] FAIL - ${testCase.description}`);
            console.error(`    Hex:      ${testCase.hex.toUpperCase()}`);
            if (!binaryMatch) {
                console.error(`    Binary Mismatch:`);
                console.error(`      Expected: ${testCase.expectedBinary}`);
                console.error(`      Got:      ${actualBinary}`);
            }
            if (!typeMatch) {
                console.error(`    Type Mismatch:`);
                console.error(`      Expected: ${testCase.expectedType}-Type`);
                console.error(`      Got:      ${formatted}`);
            }
            failedTests++;
        }
        console.log();
    }
    catch (error) {
        console.error(`❌ [${String(index + 1).padStart(2)}] ERROR - ${testCase.description}`);
        console.error(`    Hex:     ${testCase.hex.toUpperCase()}`);
        console.error(`    Erro:    ${error.message}`);
        console.log();
        failedTests++;
    }
});
console.log("╔════════════════════════════════════════════════════════════════╗");
console.log("║                         Resumo Final                           ║");
console.log("╚════════════════════════════════════════════════════════════════╝\n");
const totalTests = passedTests + failedTests;
const passPercentage = ((passedTests / totalTests) * 100).toFixed(1);
console.log(`📊 Total de Testes:  ${totalTests}`);
console.log(`✅ Passou:           ${passedTests}`);
console.log(`❌ Falhou:           ${failedTests}`);
console.log(`📈 Taxa de Sucesso:  ${passPercentage}%\n`);
if (failedTests === 0) {
    console.log("🎉 Todos os testes passaram com sucesso!\n");
}
else {
    console.log(`⚠️  ${failedTests} teste(s) falharam. Revise os resultados acima.\n`);
    process.exit(1);
}
//# sourceMappingURL=test.js.map