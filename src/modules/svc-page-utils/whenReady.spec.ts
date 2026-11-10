import { describe, it, expect, jest, afterEach } from "@jest/globals";
import { whenReady } from "./whenReady";

async function flushMicrotasks() {
  await Promise.resolve();
  await Promise.resolve();
}

describe("whenReady", () => {
  afterEach(() => {
    jest.useRealTimers();
    document.documentElement.className = "";
    document.body.innerHTML = "";
  });

  it("reveals (after a settle debounce) once isComplete passes", async () => {
    jest.useFakeTimers();
    document.body.innerHTML = '<div id="target"></div><div id="skel"></div>';
    const onReveal = jest.fn();

    whenReady({
      targetId: "target",
      skeletonId: "skel",
      readyClasses: ["svc-ready"],
      isComplete: (el) => el.children.length > 0,
      settleMs: 100,
      hardCapMs: 5000,
      onReveal,
    });

    document
      .getElementById("target")!
      .appendChild(document.createElement("span"));
    await flushMicrotasks();

    expect(document.documentElement.classList.contains("svc-ready")).toBe(
      false
    );

    jest.advanceTimersByTime(100);

    expect(document.documentElement.classList.contains("svc-ready")).toBe(true);
    expect(onReveal).toHaveBeenCalledTimes(1);
    expect(
      document.getElementById("skel")!.classList.contains("svc-skel-hide")
    ).toBe(true);

    jest.advanceTimersByTime(320);
    expect(document.getElementById("skel")).toBeNull();
  });

  it("reveals unconditionally once hardCapMs elapses, even if isComplete never passes", () => {
    jest.useFakeTimers();
    document.body.innerHTML = '<div id="target2"></div>';

    whenReady({
      targetId: "target2",
      readyClasses: ["svc-ready-2"],
      isComplete: () => false,
      hardCapMs: 1000,
    });

    jest.advanceTimersByTime(1000);

    expect(document.documentElement.classList.contains("svc-ready-2")).toBe(
      true
    );
  });

  it("no-ops when the target element does not exist", () => {
    expect(() =>
      whenReady({ targetId: "does-not-exist", isComplete: () => true })
    ).not.toThrow();
  });
});
