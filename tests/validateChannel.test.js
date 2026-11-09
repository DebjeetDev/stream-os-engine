
const test = require("node:test");
const assert = require("node:assert/strict");

const { validateChannel } = require("../src/createChannelLoader.js");

test("should accept a valid channel", () => {
    const result = validateChannel({
        id: "abc.in",
        name: "ABC News",
    });

    assert.deepEqual(result, {
        status: 200,
        ok: true,
    });
});

test("should reject null", () => {
    const result = validateChannel(null);

    assert.equal(result.ok, false);
});

test("should reject undefined", () => {
    const result = validateChannel(undefined);

    assert.equal(result.ok, false);
});

test("should reject an array", () => {
    const result = validateChannel([]);

    assert.equal(result.ok, false);
});

test("should reject a string", () => {
    const result = validateChannel("ABC News");

    assert.equal(result.ok, false);
});

test("should reject a number", () => {
    const result = validateChannel(123);

    assert.equal(result.ok, false);
});

test("should reject a channel without id", () => {
    const result = validateChannel({
        name: "ABC News",
    });

    assert.equal(result.ok, false);
});

test("should reject a channel without name", () => {
    const result = validateChannel({
        id: "abc.in",
    });

    assert.equal(result.ok, false);
});

test("should reject a non-string id", () => {
    const result = validateChannel({
        id: 123,
        name: "ABC News",
    });

    assert.equal(result.ok, false);
});

test("should reject a non-string name", () => {
    const result = validateChannel({
        id: "abc.in",
        name: 123,
    });

    assert.equal(result.ok, false);
});

test("should reject an empty id", () => {
    const result = validateChannel({
        id: "",
        name: "ABC News",
    });

    assert.equal(result.ok, false);
});

test("should reject an empty name", () => {
    const result = validateChannel({
        id: "abc.in",
        name: "",
    });

    assert.equal(result.ok, false);
});

test("should reject whitespace-only id", () => {
    const result = validateChannel({
        id: "   ",
        name: "ABC News",
    });

    assert.equal(result.ok, false);
});

test("should reject whitespace-only name", () => {
    const result = validateChannel({
        id: "abc.in",
        name: "   ",
    });

    assert.equal(result.ok, false);
});
