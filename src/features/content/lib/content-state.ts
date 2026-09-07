export type StrategySummary = {
  id: string;
  status: string; // 'RECOMMENDED' | 'ACCEPTED' | 'REJECTED' | 'COMPLETED'
  assets?: Array<{ id: string; status: string }>;
  queueItems?: Array<{ id: string; status: string }>;
};

export type PlanSummary = {
  id: string;
  status: string;
  strategies?: StrategySummary[];
};

export type ContentSourceWithRelations = {
  id: string;
  title: string;
  type: string;
  rawContent?: string;
  createdAt: Date | string;
  intelligence?: { id: string } | null;
  plans?: PlanSummary[];
};

export type ContentMetrics = {
  isAnalyzed: boolean;
  hasPlan: boolean;
  planStatus: string | null;
  strategyCount: number;
  acceptedStrategiesCount: number;
  readyAssetsCount: number;
  queuedCount: number;
  completedCount: number;
};

export type NextActionType =
  | 'ANALYZE'
  | 'CREATE_PLAN'
  | 'REVIEW_STRATEGIES'
  | 'GENERATE_ASSET'
  | 'ADD_TO_QUEUE'
  | 'VIEW_QUEUE'
  | 'VIEW_PLAN';

export type NextAction = {
  type: NextActionType;
  label: string;
  description: string;
  href?: string;
  strategyId?: string;
  secondaryAction?: {
    label: string;
    href: string;
  };
};

export type PlanStatus =
  | 'DRAFT'
  | 'RECOMMENDED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'REJECTED';

export function derivePlanStatus(plan: {
  status?: string | null;
  strategies?: StrategySummary[];
}): PlanStatus {
  const strategies = plan.strategies ?? [];
  if (strategies.length === 0) {
    return 'DRAFT';
  }

  const allRejected = strategies.length > 0 && strategies.every((s) => s.status === 'REJECTED');
  if (allRejected) {
    return 'REJECTED';
  }

  const accepted = strategies.filter(
    (s) => s.status === 'ACCEPTED' || s.status === 'COMPLETED'
  );

  if (accepted.length === 0) {
    return 'RECOMMENDED';
  }

  const allQueueItems = strategies.flatMap((s) => s.queueItems ?? []);
  const pendingQueueItems = allQueueItems.filter(
    (q) => q.status === 'PENDING' || q.status === 'IN_PROGRESS'
  );

  const allAcceptedCompleted =
    accepted.length > 0 &&
    accepted.every((s) => {
      const q = s.queueItems ?? [];
      return (
        s.status === 'COMPLETED' ||
        (q.length > 0 && q.every((item) => item.status === 'COMPLETED'))
      );
    });

  if (
    allAcceptedCompleted &&
    pendingQueueItems.length === 0 &&
    (allQueueItems.some((q) => q.status === 'COMPLETED') || accepted.every((s) => s.status === 'COMPLETED'))
  ) {
    return 'COMPLETED';
  }

  return 'IN_PROGRESS';
}

export function deriveContentMetrics(source: ContentSourceWithRelations): ContentMetrics {
  const isAnalyzed = Boolean(source.intelligence);
  const plan = source.plans?.[0];
  const hasPlan = Boolean(plan && (plan.strategies?.length ?? 0) >= 0);
  const planStatus = plan ? derivePlanStatus(plan) : null;

  const strategies = plan?.strategies ?? [];
  const strategyCount = strategies.length;

  const acceptedStrategies = strategies.filter((s) => s.status === 'ACCEPTED' || s.status === 'COMPLETED');
  const acceptedStrategiesCount = acceptedStrategies.length;

  let readyAssetsCount = 0;
  let queuedCount = 0;
  let completedCount = 0;

  for (const strategy of strategies) {
    const assets = strategy.assets ?? [];
    for (const asset of assets) {
      if (asset.status === 'READY') {
        readyAssetsCount++;
      }
    }

    const queueItems = strategy.queueItems ?? [];
    for (const item of queueItems) {
      queuedCount++;
      if (item.status === 'COMPLETED') {
        completedCount++;
      }
    }
  }

  return {
    isAnalyzed,
    hasPlan,
    planStatus,
    strategyCount,
    acceptedStrategiesCount,
    readyAssetsCount,
    queuedCount,
    completedCount,
  };
}

export function deriveNextAction(source: ContentSourceWithRelations): NextAction {
  const metrics = deriveContentMetrics(source);
  const plan = source.plans?.[0];
  const strategies = plan?.strategies ?? [];

  // 1. No intelligence -> Analyze Content
  if (!metrics.isAnalyzed) {
    return {
      type: 'ANALYZE',
      label: 'Analyze Content',
      description: 'Extract thesis, topics, and content ideas from this source.',
      href: `/content/${source.id}`,
    };
  }

  // 2. Intelligence exists, no plan (or plan with no strategies) -> Create Distribution Plan
  if (!metrics.hasPlan || metrics.strategyCount === 0) {
    return {
      type: 'CREATE_PLAN',
      label: 'Create Distribution Plan',
      description: 'Generate targeted distribution strategies from extracted ideas.',
      href: `/content/${source.id}`,
    };
  }

  // Check if any completed execution exists for secondary action
  const secondaryAction =
    metrics.completedCount > 0
      ? {
          label: 'View Results',
          href: '/outcomes',
        }
      : undefined;

  // 3. Plan exists, no accepted strategy -> Review Strategies
  const acceptedStrategies = strategies.filter(
    (s) => s.status === 'ACCEPTED' || s.status === 'COMPLETED'
  );

  if (acceptedStrategies.length === 0) {
    return {
      type: 'REVIEW_STRATEGIES',
      label: 'Review Strategies',
      description: 'Review and accept recommended distribution strategies.',
      href: `/content/${source.id}/distribution`,
      secondaryAction,
    };
  }

  // 4. Accepted strategy exists without asset -> Create Asset
  const strategyWithoutAsset = acceptedStrategies.find((s) => {
    const assets = s.assets ?? [];
    return !assets.some((a) => a.status === 'READY' || a.status === 'DRAFT');
  });

  if (strategyWithoutAsset) {
    return {
      type: 'GENERATE_ASSET',
      label: 'Create Asset',
      description: 'Create platform-native asset for approved strategy.',
      href: `/content/${source.id}/distribution/${strategyWithoutAsset.id}`,
      strategyId: strategyWithoutAsset.id,
      secondaryAction,
    };
  }

  // 5. READY asset exists but is not queued -> Add to Queue
  const strategyWithUnqueuedReadyAsset = acceptedStrategies.find((s) => {
    const hasReadyAsset = (s.assets ?? []).some((a) => a.status === 'READY');
    const isQueued = (s.queueItems ?? []).length > 0;
    return hasReadyAsset && !isQueued;
  });

  if (strategyWithUnqueuedReadyAsset) {
    return {
      type: 'ADD_TO_QUEUE',
      label: 'Add to Queue',
      description: 'Schedule your ready asset into the distribution queue.',
      href: `/content/${source.id}/distribution/${strategyWithUnqueuedReadyAsset.id}`,
      strategyId: strategyWithUnqueuedReadyAsset.id,
      secondaryAction,
    };
  }

  // 6. Queued item exists -> View Queue
  if (metrics.queuedCount > 0) {
    return {
      type: 'VIEW_QUEUE',
      label: 'View Queue',
      description: 'Manage scheduled deliveries in your distribution queue.',
      href: '/queue',
      secondaryAction,
    };
  }

  // Default fallback if plan is active
  return {
    type: 'VIEW_PLAN',
    label: 'View Plan',
    description: 'View distribution plan and execution roadmap.',
    href: `/content/${source.id}/distribution`,
    secondaryAction,
  };
}
