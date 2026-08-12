import { z } from "zod";
import { ONBOARDING_STEP_IDS } from "../domain/onboarding";

/**
 * Per-step manual-completion flags. Derived steps (e.g. connect_integration)
 * are computed from collection state, not stored here. See
 * `domain/onboarding.ts` for the catalog and completion logic.
 *
 * Modeled as an object with optional booleans (rather than a record) so all
 * keys are tracked and the default `{}` typechecks under Zod v4.
 */
export const OnboardingStepsRecordSchema = z.object(
  Object.fromEntries(
    ONBOARDING_STEP_IDS.map((id) => [id, z.boolean().optional()]),
  ) as Record<(typeof ONBOARDING_STEP_IDS)[number], z.ZodOptional<z.ZodBoolean>>,
);

export const WorkspaceSchema = z.object({
  id: z.string(),
  ownerId: z.string(),
  name: z.string().min(1).max(120),
  createdAt: z.date(),
  onboardingCompleteAt: z.date().nullable(),
  onboardingSteps: OnboardingStepsRecordSchema.default({}),
});

export type Workspace = z.infer<typeof WorkspaceSchema>;
