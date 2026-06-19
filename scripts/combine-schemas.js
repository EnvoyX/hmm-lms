import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// ES Module equivalent for __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const schemasDir = path.join(__dirname, "../prisma/schemas");
const outputFile = path.join(__dirname, "../prisma/schema.prisma");

const main = () => {
  try {
    const files = fs.readdirSync(schemasDir);

    // Ensure _base.prisma and enums.prisma are first to avoid dependency issues
    const sortedFiles = files.sort((a, b) => {
      if (a.startsWith("_")) return -1;
      if (b.startsWith("_")) return 1;
      if (a.includes("enums")) return -1;
      if (b.includes("enums")) return 1;
      return 0;
    });

    let combinedSchema = `// ----------------------------------------------------------------\n// THIS IS A GENERATED FILE. DO NOT EDIT.\n// ----------------------------------------------------------------\n\n`;

    for (const file of sortedFiles) {
      if (path.extname(file) === ".prisma") {
        const content = fs.readFileSync(path.join(schemasDir, file), "utf-8");
        combinedSchema += content + "\n";
      }
    }

    fs.writeFileSync(outputFile, combinedSchema);
    console.log("✅ Prisma schemas combined successfully!");
  } catch (error) {
    console.error("Error combining Prisma schemas:", error);
    process.exit(1);
  }
};

main();
