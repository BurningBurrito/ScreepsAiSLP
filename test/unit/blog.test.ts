import {assert} from "chai";
import {readFileSync, readdirSync} from "fs";
import * as path from "path";

// Guard for the two blog posts that got broken on GitHub (owner feedback
// 2026-11-04, v8.9): shell echo/heredocs escaped every apostrophe as \' and
// stripped underscores and backticks. This test reads every file in blog/ and
// fails on the two fingerprints of that corruption, so the damage cannot come
// back silently:
//   1. a stray backslash-apostrophe sequence (\' ) anywhere in the file,
//   2. an unclosed code fence (an odd number of lines starting with
//      three backticks).
// It runs in Node (the unit suite), so fs is available; it never touches the
// game sandbox.
describe("blog posts stay GitHub-readable", () => {
    const blogDir = path.join(__dirname, "..", "..", "blog");

    const posts = readdirSync(blogDir).filter((name) => name.endsWith(".md"));

    it("finds the published posts", () => {
        assert.isAtLeast(posts.length, 2, "the blog folder holds the milestone posts");
    });

    posts.forEach((name) => {
        it(name + " has no escaped apostrophes", () => {
            const text = readFileSync(path.join(blogDir, name), "utf8");
            assert.notInclude(text, "\\'", "a backslash before an apostrophe is the heredoc corruption fingerprint");
        });

        it(name + " has every code fence closed", () => {
            const text = readFileSync(path.join(blogDir, name), "utf8");
            const fenceLines = text.split("\n").filter((line) => line.startsWith("```"));
            assert.equal(fenceLines.length % 2, 0, "code fences must open and close (found " + fenceLines.length + " fence lines)");
        });
    });
});