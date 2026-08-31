import { renderHook, act } from "@testing-library/react-hooks";
import {
  useParams,
  FILTERS_LOCAL_STORAGE_KEY,
  FILTERS_LOCAL_STORAGE_VERSION,
  DEFAULT_REQUEST_LIST_PARAMS,
} from "./useParams";
import localStorage from "../utils/localStorage";
import { MY_REQUESTS_TAB_NAME } from "../data-types/request-list-params";
import type { FilterValuesMap } from "../data-types/FilterValue";

function setUrl(search: string): void {
  window.history.replaceState({}, "", `/hc/requests${search}`);
}

function storeFilters(value: unknown): void {
  localStorage.setItem(
    FILTERS_LOCAL_STORAGE_KEY,
    JSON.stringify([FILTERS_LOCAL_STORAGE_VERSION, value])
  );
}

function readStoredFilters(): [string, FilterValuesMap] | null {
  const item = localStorage.getItem(FILTERS_LOCAL_STORAGE_KEY);
  return item ? JSON.parse(item) : null;
}

beforeEach(() => {
  setUrl("");
});

afterEach(() => {
  localStorage.clear();
  jest.restoreAllMocks();
});

describe("resolving params from the URL", () => {
  test("resolves params from the URL on the very first render", () => {
    setUrl("?query=hi&page=2&sort_by=created_at&sort_order=asc");

    const { result } = renderHook(() => useParams());

    expect(result.current.params).toEqual({
      ...DEFAULT_REQUEST_LIST_PARAMS,
      query: "hi",
      page: 2,
      sort: { by: "created_at", order: "asc" },
    });
  });

  test("falls back to the defaults for keys absent from the URL", () => {
    setUrl("?query=hi");

    const { result } = renderHook(() => useParams());

    expect(result.current.params).toEqual({
      ...DEFAULT_REQUEST_LIST_PARAMS,
      query: "hi",
    });
  });

  test("defaults to descending updated_at sort and the my-requests tab", () => {
    const { result } = renderHook(() => useParams());

    expect(result.current.params.sort).toEqual({
      order: "desc",
      by: "updated_at",
    });
    expect(result.current.params.selectedTab).toEqual({
      name: MY_REQUESTS_TAB_NAME,
    });
  });

  test("URL filters win over stored filters when the URL is authoritative", () => {
    setUrl(
      "?query=&page=1&selected_tab_name=my-requests&filter_status=%3Aopen"
    );
    storeFilters({ priority: [":high"] });

    const { result } = renderHook(() => useParams());

    expect(result.current.params.filters).toEqual({ status: [":open"] });
  });

  test("a state URL with zero filter_ params clears stored filters", () => {
    setUrl("?query=&page=1&selected_tab_name=my-requests");
    storeFilters({ status: [":open"] });

    const { result } = renderHook(() => useParams());

    expect(result.current.params.filters).toEqual({});
  });
});

describe("URL synchronization", () => {
  test("writes the resolved params via replaceState once on mount, with no extra pushState", () => {
    setUrl("?query=hi");
    const pushStateSpy = jest.spyOn(window.history, "pushState");
    const replaceStateSpy = jest.spyOn(window.history, "replaceState");

    renderHook(() => useParams());

    expect(replaceStateSpy).toHaveBeenCalledTimes(1);
    expect(replaceStateSpy).toHaveBeenCalledWith(
      {},
      "",
      "/hc/requests?query=hi&page=1&sort_by=updated_at&sort_order=desc&selected_tab_name=my-requests"
    );
    expect(pushStateSpy).not.toHaveBeenCalled();
  });

  test("push updates the URL via pushState and preserves pathname and hash", () => {
    setUrl("?query=hi#comments");
    const pushStateSpy = jest.spyOn(window.history, "pushState");

    const { result } = renderHook(() => useParams());

    act(() => {
      result.current.push({ page: 2 });
    });

    expect(pushStateSpy).toHaveBeenCalledWith(
      {},
      "",
      "/hc/requests?query=hi&page=2&sort_by=updated_at&sort_order=desc&selected_tab_name=my-requests#comments"
    );
    expect(result.current.params.page).toBe(2);
  });

  test("popstate re-resolves params from the URL, resetting keys absent from the URL to defaults", () => {
    const { result } = renderHook(() => useParams());

    act(() => {
      result.current.push({
        page: 2,
        sort: { by: "created_at", order: "asc" },
      });
    });

    expect(result.current.params).toEqual({
      ...DEFAULT_REQUEST_LIST_PARAMS,
      page: 2,
      sort: { by: "created_at", order: "asc" },
    });

    act(() => {
      setUrl("?query=hi&page=3");
      window.dispatchEvent(new PopStateEvent("popstate"));
    });

    expect(result.current.params).toEqual({
      ...DEFAULT_REQUEST_LIST_PARAMS,
      query: "hi",
      page: 3,
    });
  });
});

describe("localStorage persistence", () => {
  test("falls back to stored filters when the URL has no recognized params", () => {
    storeFilters({ status: [":open"] });

    const { result } = renderHook(() => useParams());

    expect(result.current.params.filters).toEqual({ status: [":open"] });
  });

  test("hydration writes storage-derived filters back into the URL via replaceState", () => {
    storeFilters({ status: [":open"] });

    renderHook(() => useParams());

    expect(window.location.search).toContain(
      `filter_status=${encodeURIComponent(":open")}`
    );
  });

  test("hydration mirrors URL-derived filters into storage", () => {
    setUrl(
      "?query=&page=1&selected_tab_name=my-requests&filter_status=%3Aopen"
    );
    storeFilters({ priority: [":high"] });

    renderHook(() => useParams());

    expect(readStoredFilters()).toEqual([
      FILTERS_LOCAL_STORAGE_VERSION,
      { status: [":open"] },
    ]);
  });

  test("push persists the merged filters on every push", () => {
    const { result } = renderHook(() => useParams());

    act(() => {
      result.current.push({ page: 1, filters: { status: [":open"] } });
    });

    expect(result.current.params.filters).toEqual({ status: [":open"] });
    expect(readStoredFilters()).toEqual([
      FILTERS_LOCAL_STORAGE_VERSION,
      { status: [":open"] },
    ]);
  });

  test("push without filters still persists the current filters", () => {
    storeFilters({ status: [":open"] });

    const { result } = renderHook(() => useParams());

    act(() => {
      result.current.push({ page: 2 });
    });

    expect(readStoredFilters()).toEqual([
      FILTERS_LOCAL_STORAGE_VERSION,
      { status: [":open"] },
    ]);
  });

  describe("stored value validation", () => {
    test.each([
      ["not JSON", "not json"],
      ["a version mismatch", JSON.stringify(["v0", { status: [":open"] }])],
      [
        "a non-object value",
        JSON.stringify([FILTERS_LOCAL_STORAGE_VERSION, 42]),
      ],
      [
        "an array value",
        JSON.stringify([FILTERS_LOCAL_STORAGE_VERSION, [":open"]]),
      ],
      [
        "a field that is not an array",
        JSON.stringify([FILTERS_LOCAL_STORAGE_VERSION, { status: ":open" }]),
      ],
      [
        "non-string filter values",
        JSON.stringify([FILTERS_LOCAL_STORAGE_VERSION, { status: [123] }]),
      ],
      [
        "object filter values",
        JSON.stringify([
          FILTERS_LOCAL_STORAGE_VERSION,
          { status: [{ value: ":open" }] },
        ]),
      ],
      [
        "filter values missing an operator prefix",
        JSON.stringify([FILTERS_LOCAL_STORAGE_VERSION, { status: ["open"] }]),
      ],
    ])("ignores a stored value that is %s", (_case, storedValue) => {
      localStorage.setItem(FILTERS_LOCAL_STORAGE_KEY, storedValue);

      let result;
      expect(() => {
        result = renderHook(() => useParams()).result;
      }).not.toThrow();

      expect(result!.current.params.filters).toEqual({});
    });
  });
});
