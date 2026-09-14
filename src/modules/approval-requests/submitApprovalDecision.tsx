import { safePathSegment } from "./safePathSegment";

export type ApprovalDecision = "approved" | "rejected";

export async function submitApprovalDecision(
  approvalWorkflowInstanceId: string,
  approvalRequestId: string,
  decision: ApprovalDecision,
  decisionNote: string
) {
  try {
    const currentUserRequest = await fetch("/api/v2/users/me.json");
    if (!currentUserRequest.ok) {
      throw new Error("Error fetching current user data");
    }
    const currentUser = await currentUserRequest.json();

    // The ids originate from the page URL; safePathSegment throws on
    // anything but a plain opaque id token (see its doc for why
    // encodeURIComponent alone would not stop dot-segment smuggling).
    const response = await fetch(
      `/api/v2/approval_workflow_instances/${safePathSegment(
        approvalWorkflowInstanceId
      )}/approval_requests/${safePathSegment(approvalRequestId)}/decision`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": currentUser.user.authenticity_token,
        },
        body: JSON.stringify({
          status: decision,
          notes: decisionNote,
        }),
      }
    );
    return response;
  } catch (error) {
    console.error("Error submitting approval decision:", error);
    throw error;
  }
}
