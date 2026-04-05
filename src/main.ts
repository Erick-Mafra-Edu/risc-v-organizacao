    import { readFileSync } from "node:fs";

    const inputFile = process.argv[2] || "input.txt";

    const input = readFileSync(inputFile, "utf-8");


    