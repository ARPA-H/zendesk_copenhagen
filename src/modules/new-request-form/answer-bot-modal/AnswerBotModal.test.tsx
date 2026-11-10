import { screen } from "@testing-library/react";
import { render } from "../../test/render";
import { AnswerBotModal } from "./AnswerBotModal";

jest.mock(
  "@zendeskgarden/svg-icons/src/16/check-circle-stroke.svg",
  () => "svg-mock"
);

const baseProps = {
  authToken: "auth-token",
  interactionAccessToken: "interaction-token",
  requestId: 42,
  hasRequestManagement: true,
  isSignedIn: true,
  helpCenterPath: "/hc/en-us",
  requestsPath: "/hc/en-us/requests",
  requestPath: "/hc/en-us/requests/42",
};

describe("AnswerBotModal", () => {
  afterEach(() => {
    delete (window as unknown as { __abPwned?: number }).__abPwned;
  });

  it("sanitizes snippets at the render sink while keeping safe markup", () => {
    render(
      <AnswerBotModal
        {...baseProps}
        articles={[
          {
            article_id: 1,
            html_url: "https://example.zendesk.com/hc/en-us/articles/1",
            title: "Suggested article",
            snippet:
              '<em>safe emphasis</em><img src="x" onerror="window.__abPwned = 1">' +
              "<script>window.__abPwned = 2</script>",
          },
        ]}
      />
    );

    // Safe markup survives sanitization (first accordion section is expanded).
    const emphasis = screen.getByText("safe emphasis");
    expect(emphasis.tagName).toBe("EM");

    // Script-bearing markup is removed, not just neutralized.
    const snippetContainer = emphasis.closest("p");
    expect(snippetContainer?.innerHTML).not.toContain("onerror");
    expect(snippetContainer?.innerHTML).not.toContain("<script");
    expect(
      (window as unknown as { __abPwned?: number }).__abPwned
    ).toBeUndefined();
  });

  it("renders plain-text snippets unchanged", () => {
    render(
      <AnswerBotModal
        {...baseProps}
        articles={[
          {
            article_id: 2,
            html_url: "https://example.zendesk.com/hc/en-us/articles/2",
            title: "Plain article",
            snippet: "Just a plain answer with no markup",
          },
        ]}
      />
    );

    expect(
      screen.getByText("Just a plain answer with no markup")
    ).toBeInTheDocument();
  });
});
