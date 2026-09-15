import { submitApprovalDecision } from "./submitApprovalDecision";

global.fetch = jest.fn();

describe("submitApprovalDecision", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("PATCHes the decision with the CSRF token for valid ids", async () => {
    (fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ user: { authenticity_token: "csrf-token" } }),
      })
      .mockResolvedValueOnce({ ok: true });

    await submitApprovalDecision("workflow123", "1234", "approved", "note");

    expect(fetch).toHaveBeenCalledTimes(2);
    expect(fetch).toHaveBeenNthCalledWith(1, "/api/v2/users/me.json");
    expect(fetch).toHaveBeenNthCalledWith(
      2,
      "/api/v2/approval_workflow_instances/workflow123/approval_requests/1234/decision",
      expect.objectContaining({
        method: "PATCH",
        headers: expect.objectContaining({ "X-CSRF-Token": "csrf-token" }),
      })
    );
  });

  it.each([
    ["dot segment", "..", "1234"],
    ["path separator", "workflow123", "1234/decision"],
    ["percent encoding", "workflow%2F123", "1234"],
    ["missing value", "", "1234"],
  ])(
    "rejects and issues no request for an id with a %s",
    async (_label, workflowId, requestId) => {
      await expect(
        submitApprovalDecision(workflowId, requestId, "approved", "note")
      ).rejects.toThrow();

      expect(fetch).not.toHaveBeenCalled();
    }
  );
});
