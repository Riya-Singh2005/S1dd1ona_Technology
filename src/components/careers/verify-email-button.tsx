"use client";

import { useFormStatus } from "react-dom";
import { SubmitButton } from "./form-fields";

/**
 * The submit control on `/careers/verify`.
 *
 * The page itself stays a Server Component and its form works without
 * JavaScript. This leaf exists only to read the pending state, so the
 * button cannot be pressed twice while the token is being verified.
 */
export function VerifyEmailButton({
  label,
  pendingLabel,
}: {
  label: string;
  pendingLabel: string;
}) {
  const { pending } = useFormStatus();

  return (
    <SubmitButton pending={pending} pendingLabel={pendingLabel}>
      {label}
    </SubmitButton>
  );
}

export default VerifyEmailButton;
