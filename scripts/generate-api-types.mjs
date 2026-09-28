import { readFileSync, writeFileSync } from "node:fs";
const spec = JSON.parse(
  readFileSync(new URL("../api.json", import.meta.url), "utf8"),
);
function type(schema) {
  if (schema.$ref) return schema.$ref.split("/").at(-1);
  if (schema.type === "array") return `${type(schema.items)}[]`;
  if (schema.type === "object")
    return `{\n${Object.entries(schema.properties ?? {})
      .map(
        ([key, value]) =>
          `  ${key}${schema.required?.includes(key) ? "" : "?"}: ${type(value)}`,
      )
      .join(";\n")};\n}`;
  return (
    {
      integer: "number",
      number: "number",
      boolean: "boolean",
      string: "string",
    }[schema.type] ?? "unknown"
  );
}
writeFileSync(
  new URL("../src/types/api.ts", import.meta.url),
  "// Generated from api.json by bun run api:types. Do not edit.\n" +
    Object.entries(spec.components.schemas)
      .map(([name, schema]) => `export type ${name} = ${type(schema)};`)
      .join("\n") +
    "\n",
);
