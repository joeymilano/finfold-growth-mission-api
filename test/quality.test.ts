import { describe, expect, it } from "vitest";
import { validateGeneratedMission } from "../src/quality";
import { generatedMissionSchema, type SemanticSection } from "../src/schemas";
import { GENERATED } from "./fixtures";

const sections: SemanticSection[] = [
  {
    id: "s4",
    kind: "paragraph",
    text: "Plan work, review customer evidence, and coordinate launches in one calm workspace.",
  },
];

describe("claim-to-evidence and content quality", () => {
  it("accepts exact evidence and a single tracking CTA", () => {
    const generated = generatedMissionSchema.parse(GENERATED);
    expect(validateGeneratedMission(generated, sections, "leads", "linkedin")).toMatchObject({
      passed: true,
      evidenceExactMatch: true,
    });
  });

  it("rejects a quote that is not an exact source substring", () => {
    const generated = generatedMissionSchema.parse({
      ...GENERATED,
      evidence: [{ ...GENERATED.evidence[0], quote: "Coordinate every launch in one workspace." }],
    });
    expect(() => validateGeneratedMission(generated, sections, "leads", "linkedin")).toThrow(/exact substring/);
  });

  it("rejects unsupported numeric claims", () => {
    const generated = generatedMissionSchema.parse({
      ...GENERATED,
      asset: { ...GENERATED.asset, body: `${GENERATED.asset.body} Improve conversion by 30%.` },
    });
    expect(() => validateGeneratedMission(generated, sections, "leads", "linkedin")).toThrow(/numbers not present/);
  });

  it("rejects absolute outcome guarantees", () => {
    const generated = generatedMissionSchema.parse({
      ...GENERATED,
      asset: { ...GENERATED.asset, body: `${GENERATED.asset.body} Guaranteed growth.` },
    });
    expect(() => validateGeneratedMission(generated, sections, "leads", "linkedin")).toThrow(/guaranteed outcome/);
  });

  it("rejects platform substitution", () => {
    const generated = generatedMissionSchema.parse(GENERATED);
    expect(() => validateGeneratedMission(generated, sections, "leads", "x")).toThrow(/requested platform/);
  });
});
