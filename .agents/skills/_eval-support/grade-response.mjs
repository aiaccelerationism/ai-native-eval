import { existsSync, readFileSync } from "node:fs";

const expectationPath = process.argv[2];

function result(score, details, checks) {
  process.stdout.write(`${JSON.stringify({ score, details, checks })}\n`);
}

function check(name, passed, message) {
  return { name, passed, message };
}

if (!expectationPath || !existsSync(expectationPath)) {
  result(0, "Missing expectation file.", [
    check("expectation-file", false, expectationPath || "(none)")
  ]);
  process.exit(0);
}

const expectations = JSON.parse(readFileSync(expectationPath, "utf8"));
const outputPath = expectations.output_path || "outputs/final-response.md";
const checks = [];

if (!existsSync(outputPath)) {
  result(0, `Missing ${outputPath}.`, [
    check("output-file", false, outputPath)
  ]);
  process.exit(0);
}

const output = readFileSync(outputPath, "utf8");

for (const needle of expectations.must_contain || []) {
  checks.push(
    check(
      `contains:${needle}`,
      output.includes(needle),
      `Expected output to contain ${needle}`
    )
  );
}

for (const needle of expectations.must_not_contain || []) {
  checks.push(
    check(
      `omits:${needle}`,
      !output.includes(needle),
      `Expected output not to contain ${needle}`
    )
  );
}

for (const pattern of expectations.must_match || []) {
  const regex = new RegExp(pattern, "m");
  checks.push(
    check(
      `matches:${pattern}`,
      regex.test(output),
      `Expected output to match ${pattern}`
    )
  );
}

const passed = checks.every((item) => item.passed);
result(
  passed ? 1 : 0,
  passed ? "All checks passed." : "One or more checks failed.",
  checks
);
