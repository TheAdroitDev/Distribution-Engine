import { describe, it, expect } from "vitest";
import {
  deriveContentMetrics,
  deriveNextAction,
  derivePlanStatus,
  type ContentSourceWithRelations,
} from "./content-state";

describe("Content State & Next Action Derivation", () => {
  const baseSource: ContentSourceWithRelations = {
    id: "source-1",
    title: "Test Article",
    type: "MARKDOWN",
    rawContent: "Content text...",
    createdAt: new Date(),
    intelligence: null,
    plans: [],
  };

  it("Rule 1: No intelligence -> 'Analyze Content'", () => {
    const source: ContentSourceWithRelations = {
      ...baseSource,
      intelligence: null,
      plans: [],
    };

    const metrics = deriveContentMetrics(source);
    expect(metrics.isAnalyzed).toBe(false);
    expect(metrics.hasPlan).toBe(false);

    const action = deriveNextAction(source);
    expect(action.type).toBe("ANALYZE");
    expect(action.label).toBe("Analyze Content");
    expect(action.href).toBe("/content/source-1");
  });

  it("Rule 2: Intelligence exists, no plan -> 'Create Distribution Plan'", () => {
    const source: ContentSourceWithRelations = {
      ...baseSource,
      intelligence: { id: "intel-1" },
      plans: [],
    };

    const metrics = deriveContentMetrics(source);
    expect(metrics.isAnalyzed).toBe(true);
    expect(metrics.hasPlan).toBe(false);

    const action = deriveNextAction(source);
    expect(action.type).toBe("CREATE_PLAN");
    expect(action.label).toBe("Create Distribution Plan");
  });

  it("Rule 3: Plan exists, no accepted strategy -> 'Review Strategies'", () => {
    const source: ContentSourceWithRelations = {
      ...baseSource,
      intelligence: { id: "intel-1" },
      plans: [
        {
          id: "plan-1",
          status: "RECOMMENDED",
          strategies: [
            { id: "strat-1", status: "RECOMMENDED", assets: [], queueItems: [] },
            { id: "strat-2", status: "RECOMMENDED", assets: [], queueItems: [] },
          ],
        },
      ],
    };

    const metrics = deriveContentMetrics(source);
    expect(metrics.hasPlan).toBe(true);
    expect(metrics.strategyCount).toBe(2);
    expect(metrics.acceptedStrategiesCount).toBe(0);

    const action = deriveNextAction(source);
    expect(action.type).toBe("REVIEW_STRATEGIES");
    expect(action.label).toBe("Review Strategies");
    expect(action.href).toBe("/content/source-1/distribution");
  });

  it("Rule 4: Accepted strategy exists without asset -> 'Create Asset'", () => {
    const source: ContentSourceWithRelations = {
      ...baseSource,
      intelligence: { id: "intel-1" },
      plans: [
        {
          id: "plan-1",
          status: "IN_PROGRESS",
          strategies: [
            { id: "strat-1", status: "ACCEPTED", assets: [], queueItems: [] },
          ],
        },
      ],
    };

    const metrics = deriveContentMetrics(source);
    expect(metrics.acceptedStrategiesCount).toBe(1);
    expect(metrics.readyAssetsCount).toBe(0);

    const action = deriveNextAction(source);
    expect(action.type).toBe("GENERATE_ASSET");
    expect(action.label).toBe("Create Asset");
    expect(action.href).toBe("/content/source-1/distribution/strat-1");
  });

  it("Rule 5: READY asset exists but is not queued -> 'Add to Queue'", () => {
    const source: ContentSourceWithRelations = {
      ...baseSource,
      intelligence: { id: "intel-1" },
      plans: [
        {
          id: "plan-1",
          status: "IN_PROGRESS",
          strategies: [
            {
              id: "strat-1",
              status: "ACCEPTED",
              assets: [{ id: "asset-1", status: "READY" }],
              queueItems: [],
            },
          ],
        },
      ],
    };

    const metrics = deriveContentMetrics(source);
    expect(metrics.acceptedStrategiesCount).toBe(1);
    expect(metrics.readyAssetsCount).toBe(1);
    expect(metrics.queuedCount).toBe(0);

    const action = deriveNextAction(source);
    expect(action.type).toBe("ADD_TO_QUEUE");
    expect(action.label).toBe("Add to Queue");
    expect(action.href).toBe("/content/source-1/distribution/strat-1");
  });

  it("Rule 6: Queued item exists -> 'View Queue'", () => {
    const source: ContentSourceWithRelations = {
      ...baseSource,
      intelligence: { id: "intel-1" },
      plans: [
        {
          id: "plan-1",
          status: "IN_PROGRESS",
          strategies: [
            {
              id: "strat-1",
              status: "ACCEPTED",
              assets: [{ id: "asset-1", status: "READY" }],
              queueItems: [{ id: "q-1", status: "PENDING" }],
            },
          ],
        },
      ],
    };

    const metrics = deriveContentMetrics(source);
    expect(metrics.queuedCount).toBe(1);
    expect(metrics.completedCount).toBe(0);

    const action = deriveNextAction(source);
    expect(action.type).toBe("VIEW_QUEUE");
    expect(action.label).toBe("View Queue");
    expect(action.href).toBe("/queue");
    expect(action.secondaryAction).toBeUndefined();
  });

  it("Rule 7: Completed execution exists -> 'View Outcome' as secondary action", () => {
    const source: ContentSourceWithRelations = {
      ...baseSource,
      intelligence: { id: "intel-1" },
      plans: [
        {
          id: "plan-1",
          status: "COMPLETED",
          strategies: [
            {
              id: "strat-1",
              status: "COMPLETED",
              assets: [{ id: "asset-1", status: "READY" }],
              queueItems: [{ id: "q-1", status: "COMPLETED" }],
            },
          ],
        },
      ],
    };

    const metrics = deriveContentMetrics(source);
    expect(metrics.completedCount).toBe(1);

    const action = deriveNextAction(source);
    expect(action.secondaryAction).toBeDefined();
    expect(action.secondaryAction?.label).toBe("View Results");
    expect(action.secondaryAction?.href).toBe("/outcomes");
  });

  describe("derivePlanStatus", () => {
    it("returns DRAFT when there are no strategies", () => {
      expect(derivePlanStatus({ strategies: [] })).toBe("DRAFT");
    });

    it("returns RECOMMENDED when strategies exist but none are accepted", () => {
      expect(
        derivePlanStatus({
          strategies: [
            { id: "s1", status: "RECOMMENDED" },
            { id: "s2", status: "RECOMMENDED" },
          ],
        })
      ).toBe("RECOMMENDED");
    });

    it("returns REJECTED when all strategies are rejected", () => {
      expect(
        derivePlanStatus({
          strategies: [
            { id: "s1", status: "REJECTED" },
            { id: "s2", status: "REJECTED" },
          ],
        })
      ).toBe("REJECTED");
    });

    it("returns IN_PROGRESS when strategies are accepted or have pending queue items", () => {
      expect(
        derivePlanStatus({
          strategies: [
            {
              id: "s1",
              status: "ACCEPTED",
              queueItems: [{ id: "q1", status: "PENDING" }],
            },
          ],
        })
      ).toBe("IN_PROGRESS");
    });

    it("returns COMPLETED when accepted strategies have completed queue executions", () => {
      expect(
        derivePlanStatus({
          strategies: [
            {
              id: "s1",
              status: "ACCEPTED",
              queueItems: [{ id: "q1", status: "COMPLETED" }],
            },
          ],
        })
      ).toBe("COMPLETED");
    });

    it("returns COMPLETED when all accepted strategies have status COMPLETED", () => {
      expect(
        derivePlanStatus({
          strategies: [
            {
              id: "s1",
              status: "COMPLETED",
              queueItems: [],
            },
          ],
        })
      ).toBe("COMPLETED");
    });
  });
});
