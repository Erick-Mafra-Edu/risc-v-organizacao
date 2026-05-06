import { I_Instruction, R_Instruction } from "../instructions";
import { InstructionOpcode } from "../instructionsType";
import { conflictsDetectorPipelineClassico } from "./conflictsDetector";

describe("conflictsDetectorPipelineClassico", () => {
  test("detects WAW conflicts without adding stalls", () => {
    const firstWrite = new I_Instruction(
      InstructionOpcode.IAL_Type,
      "00001",
      "000",
      "00000",
      "000000000001"
    );
    const secondWrite = new I_Instruction(
      InstructionOpcode.IAL_Type,
      "00001",
      "000",
      "00000",
      "000000000010"
    );

    const conflicts = conflictsDetectorPipelineClassico([firstWrite, secondWrite], "CLASSIC");

    expect(conflicts).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          Type: "WAW",
          Index: 1,
          NeedsStall: false,
          StallCycles: 0
        })
      ])
    );
  });

  test("detects WAR conflicts without adding stalls", () => {
    const firstRead = new R_Instruction(
      InstructionOpcode.R_Type,
      "00010",
      "000",
      "00001",
      "00000",
      "0000000"
    );
    const secondWrite = new I_Instruction(
      InstructionOpcode.IAL_Type,
      "00001",
      "000",
      "00000",
      "000000000010"
    );

    const conflicts = conflictsDetectorPipelineClassico([firstRead, secondWrite], "CLASSIC");

    expect(conflicts).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          Type: "WAR",
          Index: 1,
          NeedsStall: false,
          StallCycles: 0
        })
      ])
    );
  });
});
