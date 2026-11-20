import { describe, expect, it } from "vitest";
import {
  areasUsed,
  endToEndProjects,
  isRelevant,
  orderByBreadth,
  parseSelection,
  projectsInArea,
} from "@/explorer/model";
import type { AreaId } from "@/explorer/types";

const project = (id: string, areas: AreaId[]) => ({ id, areas });

const narrow = project("narrow", ["data"]);
const wideFirst = project("wide-first", ["mobile", "full-stack", "databases"]);
const middle = project("middle", ["data", "databases"]);
const wideSecond = project("wide-second", ["agentic-ai", "data", "full-stack"]);
const projects = [narrow, wideFirst, middle, wideSecond];

const LAYER_ORDER: AreaId[] = ["mobile", "full-stack", "agentic-ai", "data", "databases"];

describe("orderByBreadth", () => {
  it("puts projects that used more areas first and keeps listed order on ties", () => {
    expect(orderByBreadth(projects).map((p) => p.id)).toEqual(["wide-first", "wide-second", "middle", "narrow"]);
  });

  it("does not mutate the input", () => {
    const input = [...projects];
    orderByBreadth(input);
    expect(input).toEqual(projects);
  });
});

describe("projectsInArea", () => {
  it("returns only projects that used the area", () => {
    expect(projectsInArea(projects, "databases").map((p) => p.id)).toEqual(["wide-first", "middle"]);
  });

  it("returns nothing for an area no project used", () => {
    expect(projectsInArea([narrow], "mobile")).toEqual([]);
  });
});

describe("endToEndProjects", () => {
  it("keeps projects that used three or more areas", () => {
    expect(endToEndProjects(projects).map((p) => p.id)).toEqual(["wide-first", "wide-second"]);
  });
});

describe("isRelevant", () => {
  it("is true when the project used the selected area", () => {
    expect(isRelevant(middle, "data")).toBe(true);
  });

  it("is false when the project did not use the selected area", () => {
    expect(isRelevant(middle, "mobile")).toBe(false);
  });

  it("lights up every project when all areas are selected, however many it used", () => {
    expect(isRelevant(wideFirst, "all")).toBe(true);
    expect(isRelevant(middle, "all")).toBe(true);
  });
});

describe("parseSelection", () => {
  it("reads an area id from a URL hash", () => {
    expect(parseSelection("#agentic-ai", LAYER_ORDER)).toBe("agentic-ai");
  });

  it("accepts the hash without the leading #", () => {
    expect(parseSelection("data", LAYER_ORDER)).toBe("data");
  });

  it("reads the all-areas selection", () => {
    expect(parseSelection("#all", LAYER_ORDER)).toBe("all");
  });

  it("returns null for anything else", () => {
    expect(parseSelection("#contact", LAYER_ORDER)).toBeNull();
    expect(parseSelection("", LAYER_ORDER)).toBeNull();
  });
});

describe("areasUsed", () => {
  it("lists a project's areas in layer order, not in the order they were written", () => {
    expect(areasUsed(wideSecond, LAYER_ORDER)).toEqual(["full-stack", "agentic-ai", "data"]);
  });
});
