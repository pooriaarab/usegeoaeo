/**
 * Onboarding domain types and helpers.
 *
 * Onboarding is gated on `workspace.onboardingCompleteAt`. When that field is
 * null, an authed user is redirected to `/onboarding`.
 *
 * The onboarding checklist combines two completion sources:
 *   1. **Manual flags** — recorded as a map on the workspace doc
 *      (`workspace.onboardingSteps`). Used for steps whose completion is not
 *      otherwise derivable from server state (welcome, workspace details).
 *   2. **Derived state** — computed from existing collections (an integration
 *      with `status: "connected"`, a non-default agent, a thread with a user
 *      message). These are robust against missed flag flips.
 *
 * The set of steps and their completion criteria are defined here so the
 * domain is the single source of truth for both API and UI.
 */

import { z } from "zod";

/* -------------------------------------------------------------------------- */
/* Step IDs                                                                    */
/* -------------------------------------------------------------------------- */

export const ONBOARDING_STEP_IDS = [
  "welcome",
  "workspace_details",
  "connect_integration",
  "create_agent",
  "send_first_thread",
] as const;

export type OnboardingStepId = (typeof ONBOARDING_STEP_IDS)[number];

export const OnboardingStepIdSchema = z.enum(ONBOARDING_STEP_IDS);

/* -------------------------------------------------------------------------- */
/* Step metadata                                                               */
/* -------------------------------------------------------------------------- */

export type OnboardingStepCompletion = "manual" | "derived";

export interface OnboardingStepMeta {
  id: OnboardingStepId;
  label: string;
  description: string;
  /**
   * "manual": completion is recorded by an explicit flag flip on the
   *   workspace doc. The UI marks the step done when the user finishes the
   *   step's content.
   * "derived": completion is computed from server state (agent_integrations,
   *   agents, threads). The UI auto-completes when the underlying signal
   *   appears.
   */
  completion: OnboardingStepCompletion;
}

export const ONBOARDING_STEPS: readonly OnboardingStepMeta[] = [
  {
    id: "welcome",
    label: "Welcome",
    description: "A quick intro to the platform.",
    completion: "manual",
  },
  {
    id: "workspace_details",
    label: "Set up your workspace",
    description: "Give your workspace a name.",
    completion: "manual",
  },
  {
    id: "connect_integration",
    label: "Connect an integration",
    description: "Link your first integration so agents can take action.",
    completion: "derived",
  },
  {
    id: "create_agent",
    label: "Create your first agent",
    description: "Define an agent for a specific job.",
    completion: "derived",
  },
  {
    id: "send_first_thread",
    label: "Start your first thread",
    description: "Chat with an agent to see it in action.",
    completion: "derived",
  },
] as const;

/* -------------------------------------------------------------------------- */
/* Navigation                                                                  */
/* -------------------------------------------------------------------------- */

export function getNextOnboardingStep(
  current: OnboardingStepId,
): OnboardingStepId | null {
  const idx = ONBOARDING_STEP_IDS.indexOf(current);
  if (idx < 0 || idx >= ONBOARDING_STEP_IDS.length - 1) return null;
  return ONBOARDING_STEP_IDS[idx + 1];
}

export function getPreviousOnboardingStep(
  current: OnboardingStepId,
): OnboardingStepId | null {
  const idx = ONBOARDING_STEP_IDS.indexOf(current);
  if (idx <= 0) return null;
  return ONBOARDING_STEP_IDS[idx - 1];
}

/* -------------------------------------------------------------------------- */
/* Completion criteria                                                         */
/* -------------------------------------------------------------------------- */

/** Server-state signals required to compute derived step completion. */
export interface OnboardingSignals {
  hasConnectedIntegration: boolean;
  hasNonDefaultAgent: boolean;
  hasUserMessageInAnyThread: boolean;
}

/** Manual-completion flags persisted on the workspace doc. */
export type OnboardingStepFlags = Partial<Record<OnboardingStepId, boolean>>;

/**
 * Compute the completion state of every step from manual flags + derived
 * signals. Returns a map keyed by step id.
 */
export function computeOnboardingCompletion(args: {
  flags: OnboardingStepFlags;
  signals: OnboardingSignals;
}): Record<OnboardingStepId, boolean> {
  const { flags, signals } = args;
  return {
    welcome: flags.welcome === true,
    workspace_details: flags.workspace_details === true,
    connect_integration: signals.hasConnectedIntegration,
    create_agent: signals.hasNonDefaultAgent,
    send_first_thread: signals.hasUserMessageInAnyThread,
  };
}

/** Convenience: true when every step is complete. */
export function isOnboardingComplete(
  completion: Record<OnboardingStepId, boolean>,
): boolean {
  return ONBOARDING_STEP_IDS.every((id) => completion[id]);
}
