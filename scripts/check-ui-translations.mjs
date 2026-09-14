import fs from "node:fs";
import path from "node:path";
import ts from "typescript";
import translations from "../src/data/ui-translations.json" with { type: "json" };

const root = path.resolve("src");
const keys = new Set();

function visitDirectory(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) visitDirectory(file);
    if (entry.isFile() && file.endsWith(".tsx")) visitFile(file);
  }
}

function visitFile(file) {
  const source = ts.createSourceFile(file, fs.readFileSync(file, "utf8"), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const walk = (node) => {
    if (
      ts.isCallExpression(node) &&
      node.expression.getText(source) === "t" &&
      node.arguments[0] &&
      ts.isStringLiteralLike(node.arguments[0])
    ) {
      keys.add(node.arguments[0].text);
    }
    ts.forEachChild(node, walk);
  };
  walk(source);
}

visitDirectory(root);

const missing = Object.entries(translations)
  .filter(([locale]) => locale !== "en")
  .map(([locale, dictionary]) => [locale, [...keys].filter((key) => !dictionary[key])])
  .filter(([, absent]) => absent.length > 0);

if (missing.length) {
  for (const [locale, absent] of missing) {
    console.error(`${locale}: missing ${absent.length} UI translation(s): ${absent.join(", ")}`);
  }
  process.exit(1);
}

console.log(`Verified ${keys.size} interface phrases in ${Object.keys(translations).length - 1} non-English locales.`);
