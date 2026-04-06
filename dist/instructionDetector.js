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
exports.InstructionDetector = void 0;
const instructionsType_1 = require("./instructionsType");
const Instructions = __importStar(require("./instructions/"));
class InstructionDetector {
    constructor(instructionString) {
        // Test if input is hexadecimal (8 characters) or binary (32 characters)
        if (instructionString.length === 8) {
            // Convert hex to binary
            const binaryValue = parseInt(instructionString, 16).toString(2).padStart(32, "0");
            this.instructionHexadecimal = instructionString;
            this.InstructionBinary = binaryValue;
        }
        else if (instructionString.length === 32) {
            // Convert binary to hex
            this.InstructionBinary = instructionString;
            this.instructionHexadecimal = parseInt(instructionString, 2).toString(16).padStart(8, "0");
        }
        else {
            throw new Error("Invalid instruction format. Must be 8-char hex or 32-char binary");
        }
    }
    static detectInstruction(instructionString) {
        // Extract opcode from bits 0-6 (RISC-V standard)
        const opcode = instructionString.slice(25, 32);
        switch (opcode) {
            case instructionsType_1.InstructionOpcode.R_Type:
                return new Instructions.R_Instruction(opcode, instructionString.slice(20, 25), // rd
                instructionString.slice(17, 20), // funct3
                instructionString.slice(12, 17), // rs1
                instructionString.slice(7, 12), // rs2
                instructionString.slice(0, 7) // funct7
                );
            case instructionsType_1.InstructionOpcode.IAL_Type:
            case instructionsType_1.InstructionOpcode.IL_Type:
            case instructionsType_1.InstructionOpcode.JALR_Type:
                return new Instructions.I_Instruction(opcode, instructionString.slice(20, 25), // rd
                instructionString.slice(17, 20), // funct3
                instructionString.slice(12, 17), // rs1
                instructionString.slice(0, 12) // imm[11:0]
                );
            case instructionsType_1.InstructionOpcode.S_Type:
                return new Instructions.S_Instruction(opcode, instructionString.slice(17, 20), // funct3
                instructionString.slice(12, 17), // rs1
                instructionString.slice(7, 12), // rs2
                instructionString.slice(0, 7), // imm[11:5]
                instructionString.slice(25, 32) // imm[4:0]
                );
            case instructionsType_1.InstructionOpcode.B_Type:
                return new Instructions.B_Instruction(opcode, instructionString.slice(8, 12), // imm[4:1]
                instructionString.slice(25, 31), // imm[10:5]
                instructionString.slice(12, 15), // funct3
                instructionString.slice(15, 20), // rs1
                instructionString.slice(20, 25) // rs2
                );
            case instructionsType_1.InstructionOpcode.UAUIPC_Type:
            case instructionsType_1.InstructionOpcode.ULUI_Type:
                return new Instructions.U_Instruction(opcode, instructionString.slice(20, 25), // rd
                instructionString.slice(0, 20) // imm[31:12]
                );
            case instructionsType_1.InstructionOpcode.J_Type:
                return new Instructions.J_Instruction(opcode, instructionString.slice(20, 25), // rd
                instructionString.slice(0, 20) // imm[20|10:1|11|19:12]
                );
            case instructionsType_1.InstructionOpcode.SYSTEM_Type:
                return new Instructions.SYSTEM_Instruction(opcode, instructionString.slice(20, 25), // rd
                instructionString.slice(17, 20), // funct3
                instructionString.slice(12, 17), // rs1
                instructionString.slice(0, 12) // imm[11:0]
                );
            default:
                throw new Error("Opcode not recognized");
        }
    }
}
exports.InstructionDetector = InstructionDetector;
exports.default = InstructionDetector;
//# sourceMappingURL=instructionDetector.js.map