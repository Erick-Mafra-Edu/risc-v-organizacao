import { B_Instruction, I_Instruction, J_Instruction, R_Instruction } from "../instructions";
import { InstructionOpcode } from "../instructionsType";
import { conflictsDetectorPipelineClassico, forwardConflicts } from "./conflictsDetector";
import { ResolveConflict, ResolveConflictWithAddressMap } from "./resolveConflict";

describe("ResolveConflict address recalculation", () => {
  test("solves data conflicts without forwarding by inserting NOPs", () => {
    const producer = new I_Instruction(
      InstructionOpcode.IAL_Type,
      "00001",
      "000",
      "00000",
      "000000000001"
    );
    const consumer = new R_Instruction(
      InstructionOpcode.R_Type,
      "00010",
      "000",
      "00001",
      "00000",
      "0000000"
    );

    const conflicts = conflictsDetectorPipelineClassico([producer, consumer], "CLASSIC");
    const resolved = ResolveConflict(conflicts, [producer, consumer]);

    expect(conflicts).toEqual([
      expect.objectContaining({
        Type: "RAW",
        Index: 1,
        NeedsStall: true,
        StallCycles: 2
      })
    ]);
    expect(resolved).toHaveLength(4);
    expect(resolved.slice(1, 3).every(instruction => instruction.formatedString().includes("imm:000000000000"))).toBe(true);
  });

  test("solves load-use data conflicts with forwarding by inserting one NOP", () => {
    const load = new I_Instruction(
      InstructionOpcode.IL_Type,
      "00001",
      "010",
      "00010",
      "000000000000"
    );
    const consumer = new R_Instruction(
      InstructionOpcode.R_Type,
      "00011",
      "000",
      "00001",
      "00000",
      "0000000"
    );

    const conflicts = forwardConflicts(conflictsDetectorPipelineClassico([load, consumer], "FORWARDING"));
    const resolved = ResolveConflict(conflicts, [load, consumer]);

    expect(conflicts).toEqual([
      expect.objectContaining({
        Type: "LOAD",
        Index: 1,
        NeedsStall: true,
        StallCycles: 1
      })
    ]);
    expect(resolved).toHaveLength(3);
    expect(resolved[1].formatedString()).toContain("imm:000000000000");
  });

  test("solves control conflicts by inserting NOPs", () => {
    const branchToItself = new B_Instruction(
      InstructionOpcode.B_Type,
      "000000000000",
      "000",
      "00000",
      "00000"
    );

    const conflicts = conflictsDetectorPipelineClassico([branchToItself], "CLASSIC");
    const resolved = ResolveConflict(conflicts, [branchToItself]);

    expect(conflicts).toEqual([
      expect.objectContaining({
        Type: "CONTROL",
        Index: 0,
        NeedsStall: true,
        StallCycles: 2
      })
    ]);
    expect(resolved).toHaveLength(3);
    expect(resolved.slice(0, 2).every(instruction => instruction.formatedString().includes("imm:000000000000"))).toBe(true);
  });

  test("recalculates branch immediate when inserted NOPs move the target", () => {
    const branchToThirdInstruction = new B_Instruction(
      InstructionOpcode.B_Type,
      "000000000100",
      "000",
      "00000",
      "00000"
    );
    const producer = new I_Instruction(
      InstructionOpcode.IAL_Type,
      "00001",
      "000",
      "00000",
      "000000000001"
    );
    const targetMovedByRawStalls = new R_Instruction(
      InstructionOpcode.R_Type,
      "00010",
      "000",
      "00001",
      "00000",
      "0000000"
    );

    const instructions = [branchToThirdInstruction, producer, targetMovedByRawStalls];
    const conflicts = conflictsDetectorPipelineClassico(instructions, "CLASSIC");
    const resolved = ResolveConflict(conflicts, instructions);

    const recalculatedBranch = resolved.find(
      instruction => instruction instanceof B_Instruction
    ) as B_Instruction;

    expect(recalculatedBranch.getImmediateValue()).toBe(16);
    expect(recalculatedBranch.formatedString()).toContain("imm:0000000010000");
  });

  test("keeps branch immediate stable when NOPs are inserted before both origin and target", () => {
    const branchToItself = new B_Instruction(
      InstructionOpcode.B_Type,
      "000000000000",
      "000",
      "00000",
      "00000"
    );

    const conflicts = conflictsDetectorPipelineClassico([branchToItself], "CLASSIC");
    const resolved = ResolveConflict(conflicts, [branchToItself]);
    const recalculatedBranch = resolved.find(
      instruction => instruction instanceof B_Instruction
    ) as B_Instruction;

    expect(recalculatedBranch.getImmediateValue()).toBe(0);
  });

  test("recalculates jump immediate when inserted NOPs move the target", () => {
    const jumpToThirdInstruction = new J_Instruction(
      InstructionOpcode.J_Type,
      "00001",
      "00000000000000000100"
    );
    const producer = new I_Instruction(
      InstructionOpcode.IAL_Type,
      "00010",
      "000",
      "00000",
      "000000000001"
    );
    const targetMovedByRawStalls = new R_Instruction(
      InstructionOpcode.R_Type,
      "00011",
      "000",
      "00010",
      "00000",
      "0000000"
    );

    const instructions = [jumpToThirdInstruction, producer, targetMovedByRawStalls];
    const conflicts = conflictsDetectorPipelineClassico(instructions, "CLASSIC");
    const resolved = ResolveConflict(conflicts, instructions);

    const recalculatedJump = resolved.find(
      instruction => instruction instanceof J_Instruction
    ) as J_Instruction;

    expect(recalculatedJump.getImmediateValue()).toBe(16);
    expect(recalculatedJump.formatedString()).toContain("imm:000000000000000010000");
  });

  test("recalculates branch immediate when forwarding load-use NOPs move the target", () => {
    const branchToThirdInstruction = new B_Instruction(
      InstructionOpcode.B_Type,
      "000000000100",
      "000",
      "00000",
      "00000"
    );
    const load = new I_Instruction(
      InstructionOpcode.IL_Type,
      "00001",
      "010",
      "00010",
      "000000000000"
    );
    const targetMovedByLoadUseStall = new R_Instruction(
      InstructionOpcode.R_Type,
      "00011",
      "000",
      "00001",
      "00000",
      "0000000"
    );

    const instructions = [branchToThirdInstruction, load, targetMovedByLoadUseStall];
    const conflicts = forwardConflicts(conflictsDetectorPipelineClassico(instructions, "FORWARDING"));
    const resolved = ResolveConflict(conflicts, instructions);

    const recalculatedBranch = resolved.find(
      instruction => instruction instanceof B_Instruction
    ) as B_Instruction;

    expect(recalculatedBranch.getImmediateValue()).toBe(12);
  });

  test("returns an old-to-new instruction index map", () => {
    const branchToItself = new B_Instruction(
      InstructionOpcode.B_Type,
      "000000000000",
      "000",
      "00000",
      "00000"
    );

    const conflicts = conflictsDetectorPipelineClassico([branchToItself], "CLASSIC");
    const resolved = ResolveConflictWithAddressMap(conflicts, [branchToItself]);

    expect(resolved.addressMap).toEqual({ 0: 2 });
  });

  test("returns the resolved indexes where NOPs were inserted", () => {
    const producer = new I_Instruction(
      InstructionOpcode.IAL_Type,
      "00001",
      "000",
      "00000",
      "000000000001"
    );
    const consumer = new R_Instruction(
      InstructionOpcode.R_Type,
      "00010",
      "000",
      "00001",
      "00000",
      "0000000"
    );

    const conflicts = conflictsDetectorPipelineClassico([producer, consumer], "CLASSIC");
    const resolved = ResolveConflictWithAddressMap(conflicts, [producer, consumer]);

    expect(resolved.nopIndexes).toEqual([1, 2]);
  });
});
