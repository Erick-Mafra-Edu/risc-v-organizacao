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
exports.I_Instruction = void 0;
const instructionsType_1 = __importStar(require("../instructionsType"));
class I_Instruction extends instructionsType_1.Instruction {
    constructor(opcode, rd, funct3, rs1, imm) {
        super(opcode);
        if (this.opcode !== instructionsType_1.default.IL_Type && this.opcode !== instructionsType_1.default.JALR_Type && this.opcode !== instructionsType_1.default.IAL_Type) {
            throw new Error("Opcode Invalid for I-Type Instruction");
        }
        this.rd = rd;
        this.funct3 = funct3;
        this.rs1 = rs1;
        this.imm = imm;
    }
    formatedString() {
        return `Instruction of Type I with rd:${this.rd} and funct3:${this.funct3} and rs1:${this.rs1} and imm:${this.imm}`;
    }
}
exports.I_Instruction = I_Instruction;
exports.default = I_Instruction;
//# sourceMappingURL=I_Instruction.js.map