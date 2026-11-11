import { renderHook } from "@testing-library/react";
import { useStaleRequestGuard } from "./useStaleRequestGuard";

describe("useStaleRequestGuard", () => {
  it("keeps a request stale after the requester switches away and back", () => {
    const { result, rerender } = renderHook(
      ({ userId }: { userId: number | null }) => useStaleRequestGuard(userId),
      { initialProps: { userId: 1 as number | null } }
    );

    const { isRequesterStale, isStale } = result.current();
    expect(isRequesterStale()).toBe(false);

    rerender({ userId: 2 });
    rerender({ userId: 1 });

    expect(isRequesterStale()).toBe(true);
    expect(isStale()).toBe(true);
  });

  it("does not mark a request stale while the requester is unchanged", () => {
    const { result, rerender } = renderHook(
      ({ userId }: { userId: number | null }) => useStaleRequestGuard(userId),
      { initialProps: { userId: 1 as number | null } }
    );

    const { isRequesterStale, isStale } = result.current();
    rerender({ userId: 1 });

    expect(isRequesterStale()).toBe(false);
    expect(isStale()).toBe(false);
  });

  it("marks an earlier request stale once a newer one starts", () => {
    const { result } = renderHook(() => useStaleRequestGuard(1));

    const first = result.current();
    const second = result.current();

    expect(first.isCurrent()).toBe(false);
    expect(first.isStale()).toBe(true);
    expect(first.isRequesterStale()).toBe(false);
    expect(second.isCurrent()).toBe(true);
  });
});
