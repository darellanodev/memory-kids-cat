import { describe, expect, it } from "vitest";
import { shuffle } from "../src/random.js";
import { seeded } from "./helpers.js";

describe("shuffle()", () => {
  const list = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  it("has the same items", () => {
    expect([...shuffle(list, seeded(3))].sort((a, b) => a - b)).toEqual(list);
  });

  it("does not change the original list", () => {
    const copy = [...list];
    shuffle(list, seeded(3));
    expect(list).toEqual(copy);
  });

  it("gives the same order for the same random numbers", () => {
    expect(shuffle(list, seeded(9))).toEqual(shuffle(list, seeded(9)));
  });

  it("can change the order", () => {
    expect(shuffle(list, seeded(9))).not.toEqual(list);
  });

  it("works with an empty list and with one item", () => {
    expect(shuffle([])).toEqual([]);
    expect(shuffle(["a"])).toEqual(["a"]);
  });
});
