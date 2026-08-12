import { describe, it, expect } from "vitest";
import {
  ONBOARDING_STEP_IDS,
  ONBOARDING_STEPS,
  computeOnboardingCompletion,
  getNextOnboardingStep,
  getPreviousOnboardingStep,
  isOnboardingComplete,
  type OnboardingSignals,
} from "../../domain/onboarding";

describe("onboarding domain", () => {
  it("ONBOARDING_STEPS matches ONBOARDING_STEP_IDS in order", () => {
    expect(ONBOARDING_STEPS.map((s) => s.id)).toEqual([...ONBOARDING_STEP_IDS]);
  });

  it("getNextOnboardingStep walks forward and stops at the end", () => {
    expect(getNextOnboardingStep("welcome")).toBe("workspace_details");
    expect(getNextOnboardingStep(ONBOARDING_STEP_IDS[ONBOARDING_STEP_IDS.length - 1])).toBeNull();
  });

  it("getPreviousOnboardingStep walks back and stops at the beginning", () => {
    expect(getPreviousOnboardingStep("workspace_details")).toBe("welcome");
    expect(getPreviousOnboardingStep("welcome")).toBeNull();
  });

  it("computes completion from manual flags", () => {
    const signals: OnboardingSignals = {
      hasConnectedIntegration: false,
      hasNonDefaultAgent: false,
      hasUserMessageInAnyThread: false,
    };
    const completion = computeOnboardingCompletion({
      flags: { welcome: true, workspace_details: false },
      signals,
    });
    expect(completion.welcome).toBe(true);
    expect(completion.workspace_details).toBe(false);
    expect(completion.connect_integration).toBe(false);
  });

  it("computes completion from derived signals", () => {
    const completion = computeOnboardingCompletion({
      flags: {},
      signals: {
        hasConnectedIntegration: true,
        hasNonDefaultAgent: true,
        hasUserMessageInAnyThread: false,
      },
    });
    expect(completion.connect_integration).toBe(true);
    expect(completion.create_agent).toBe(true);
    expect(completion.send_first_thread).toBe(false);
  });

  it("isOnboardingComplete only when every step is done", () => {
    const allDone = computeOnboardingCompletion({
      flags: { welcome: true, workspace_details: true },
      signals: {
        hasConnectedIntegration: true,
        hasNonDefaultAgent: true,
        hasUserMessageInAnyThread: true,
      },
    });
    expect(isOnboardingComplete(allDone)).toBe(true);

    const missingOne = { ...allDone, welcome: false };
    expect(isOnboardingComplete(missingOne)).toBe(false);
  });
});
