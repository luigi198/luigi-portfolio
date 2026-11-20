import { describe, expect, it } from "vitest";
import { areaColor, fillArea } from "@/components/explorer/format";
import { layerRows } from "@/explorer/model";
import type { AreaId } from "@/explorer/types";

const LAYERS: AreaId[] = ["mobile", "full-stack", "agentic-ai", "data", "databases"];

describe("fillArea", () => {
  it("puts the area into the template", () => {
    expect(fillArea("Back to {area}", "data engineering")).toBe("Back to data engineering");
  });

  it("inserts dollar signs literally", () => {
    expect(fillArea("About {area}", "pricing in $& and $'")).toBe("About pricing in $& and $'");
  });
});

describe("areaColor", () => {
  it("points at the area's CSS token", () => {
    expect(areaColor("agentic-ai")).toBe("var(--area-agentic-ai)");
  });
});

describe("layerRows", () => {
  it("gives the layer index of every area a project used", () => {
    expect(layerRows({ id: "p", areas: ["databases", "mobile"] }, LAYERS)).toEqual([4, 0]);
  });

  it("refuses a project with no areas", () => {
    expect(() => layerRows({ id: "empty", areas: [] }, LAYERS)).toThrow(/empty/);
  });

  it("refuses an area that is not a layer", () => {
    expect(() => layerRows({ id: "odd", areas: ["data"] }, ["mobile"])).toThrow(/odd.*data/);
  });
});
