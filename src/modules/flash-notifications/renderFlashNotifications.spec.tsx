import { cleanup, screen, act } from "@testing-library/react";
import i18next from "i18next";
import { renderFlashNotifications } from "./renderFlashNotifications";
import { emitNotify } from "../shared/notifications/notifyBus";
import { initI18next } from "../shared";
import type { Settings, ToastNotification } from "../shared";

afterEach(() => {
  cleanup();
  document.body.innerHTML = "";
});

const settings: Settings = {};
const baseLocale = "en-us";

describe("renderFlashNotifications", () => {
  it("creates a container div and mounts provider", async () => {
    await act(async () => {
      await renderFlashNotifications(settings, baseLocale);
    });

    const container: HTMLDivElement | null = document.body.querySelector("div");
    expect(container).not.toBeNull();
  });

  it("renders toast when emitNotify is called after initialization", async () => {
    await act(async () => {
      await renderFlashNotifications(settings, baseLocale);
    });

    const testId = "toast-test";
    const notification: ToastNotification = {
      type: "success",
      title: "Test",
      message: <div data-testid={testId} />,
    };

    act(() => {
      emitNotify(notification);
    });
    expect(await screen.findByTestId(testId)).toBeInTheDocument();
  });

  it("leaves the translations a page module already loaded", async () => {
    initI18next(baseLocale);
    i18next.addResourceBundle(baseLocale, "translation", { page: "kept" });

    await act(async () => {
      await renderFlashNotifications(settings, baseLocale);
    });

    expect(i18next.getResource(baseLocale, "translation", "page")).toBe("kept");
  });
});
