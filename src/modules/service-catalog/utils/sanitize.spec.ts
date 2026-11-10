import { htmlToText, sanitizeFieldDescription, sanitizeHtml } from "./sanitize";

describe("sanitize utils", () => {
  describe("htmlToText", () => {
    it("returns an empty string for empty input", () => {
      expect(htmlToText("")).toBe("");
    });

    it("decodes HTML entities to plain text", () => {
      expect(
        htmlToText("This is a keyboard &quot;from&quot; Atl Nacional")
      ).toBe('This is a keyboard "from" Atl Nacional');
    });

    it("strips HTML tags and keeps the text content", () => {
      expect(htmlToText("<strong>Order</strong> a new <em>laptop</em>")).toBe(
        "Order a new laptop"
      );
    });

    it("does not execute event-handler payloads and returns no text for them", () => {
      const onerror = jest.fn();
      (window as unknown as { __xss?: () => void }).__xss = onerror;

      const result = htmlToText(
        '<img src=x onerror="window.__xss()">safe text'
      );

      expect(onerror).not.toHaveBeenCalled();
      expect(result).toBe("safe text");

      delete (window as unknown as { __xss?: () => void }).__xss;
    });

    it("does not execute script payloads", () => {
      const spy = jest.fn();
      (window as unknown as { __xss?: () => void }).__xss = spy;

      htmlToText("<script>window.__xss()</script>");

      expect(spy).not.toHaveBeenCalled();
      delete (window as unknown as { __xss?: () => void }).__xss;
    });

    it("does not execute SVG event-handler payloads", () => {
      const onload = jest.fn();
      (window as unknown as { __xss?: () => void }).__xss = onload;

      const result = htmlToText(
        '<svg onload="window.__xss()">safe svg text</svg>'
      );

      expect(onload).not.toHaveBeenCalled();
      expect(result).toBe("safe svg text");
      delete (window as unknown as { __xss?: () => void }).__xss;
    });
  });

  describe("sanitizeHtml", () => {
    it("removes script tags", () => {
      expect(sanitizeHtml("<p>hi</p><script>alert(1)</script>")).toBe(
        "<p>hi</p>"
      );
    });

    it("removes event-handler attributes but keeps the element", () => {
      const result = sanitizeHtml('<img src="x" onerror="alert(1)">');

      expect(result).toContain("<img");
      expect(result).not.toContain("onerror");
    });

    it("removes SVG event-handler attributes", () => {
      const result = sanitizeHtml(
        '<svg onload="alert(1)"><circle cx="10" cy="10" r="5"></circle></svg>'
      );

      expect(result).toContain("<svg");
      expect(result).not.toContain("onload");
      expect(result).not.toContain("alert(1)");
    });

    it("preserves safe formatting markup", () => {
      const input =
        '<p><strong>Bold</strong> and <a href="https://example.com" target="_blank" rel="noopener noreferrer">link</a></p>';

      const result = sanitizeHtml(input);

      expect(result).toContain("<strong>Bold</strong>");
      expect(result).toContain('href="https://example.com"');
      expect(result).toContain('target="_blank"');
      expect(result).toContain('rel="noopener noreferrer"');
    });

    it.each([
      "https://www.youtube.com/embed/abc123",
      "https://www.youtube-nocookie.com/embed/abc123",
      "https://player.vimeo.com/video/123456",
    ])("preserves video iframes from every trusted host (%s)", (src) => {
      const result = sanitizeHtml(
        `<iframe src="${src}" allowfullscreen></iframe>`
      );

      expect(result).toContain("<iframe");
      expect(result).toContain(`src="${src}"`);
    });

    it("removes iframes with a whitespace-only src", () => {
      expect(sanitizeHtml('<iframe src="   "></iframe>')).not.toContain(
        "<iframe"
      );
    });

    it("removes trusted-host iframes outside the provider's embed path", () => {
      expect(
        sanitizeHtml(
          '<iframe src="https://www.youtube.com/redirect?q=https%3A%2F%2Fevil.example"></iframe>'
        )
      ).not.toContain("<iframe");
      expect(
        sanitizeHtml(
          '<iframe src="https://player.vimeo.com/anything"></iframe>'
        )
      ).not.toContain("<iframe");
    });

    it("removes trusted-host iframes on a non-default port", () => {
      expect(
        sanitizeHtml(
          '<iframe src="https://www.youtube.com:8443/embed/abc123"></iframe>'
        )
      ).not.toContain("<iframe");
    });

    it("removes iframes pointing at untrusted hosts", () => {
      const result = sanitizeHtml(
        '<p>keep me</p><iframe src="https://evil.example.com/phish"></iframe>'
      );

      expect(result).toContain("<p>keep me</p>");
      expect(result).not.toContain("<iframe");
    });

    it("removes iframes with non-https or missing src", () => {
      expect(
        sanitizeHtml('<iframe src="http://www.youtube.com/embed/x"></iframe>')
      ).not.toContain("<iframe");
      expect(sanitizeHtml("<iframe></iframe>")).not.toContain("<iframe");
    });

    it("preserves same-origin iframes", () => {
      const result = sanitizeHtml('<iframe src="/hc/embed/thing"></iframe>');

      expect(result).toContain("<iframe");
      expect(result).toContain('src="/hc/embed/thing"');
    });

    it("removes same-host iframes with a different port or scheme", () => {
      const host = window.location.hostname;

      // Different port (and scheme) on the same host.
      expect(
        sanitizeHtml(`<iframe src="https://${host}:8443/x"></iframe>`)
      ).not.toContain("<iframe");

      // Same default port, opposite scheme only (jsdom serves http://localhost,
      // so https://<host>/ differs from window.location.origin purely by
      // scheme) - catches a hostname+port-only implementation.
      expect(
        sanitizeHtml(`<iframe src="https://${host}/x"></iframe>`)
      ).not.toContain("<iframe");
    });

    it("strips srcdoc payloads while keeping a trusted iframe", () => {
      const result = sanitizeHtml(
        '<iframe src="https://www.youtube.com/embed/abc123" srcdoc="<script>alert(1)</script>"></iframe>'
      );

      expect(result).toContain("<iframe");
      expect(result).toContain('src="https://www.youtube.com/embed/abc123"');
      expect(result).not.toContain("srcdoc");
      expect(result).not.toContain("alert(1)");
    });

    it("removes javascript: urls", () => {
      const result = sanitizeHtml('<a href="javascript:alert(1)">x</a>');

      expect(result).not.toContain("javascript:");
    });
  });

  describe("sanitizeFieldDescription", () => {
    it("preserves safe links and formatting", () => {
      const result = sanitizeFieldDescription(
        '<strong>Choose carefully</strong> or visit <a href="https://example.com" target="_blank" rel="noopener noreferrer">docs</a>'
      );

      expect(result).toContain("<strong>Choose carefully</strong>");
      expect(result).toContain('href="https://example.com"');
      expect(result).toContain('target="_blank"');
      expect(result).toContain('rel="noopener noreferrer"');
    });

    it("removes executable content and iframes", () => {
      const result = sanitizeFieldDescription(
        '<img src="x" onerror="alert(1)"><script>alert(2)</script><iframe src="https://example.com"></iframe>'
      );

      expect(result).not.toContain("onerror");
      expect(result).not.toContain("<script");
      expect(result).not.toContain("<iframe");
      expect(result).not.toContain("alert");
    });
  });
});
