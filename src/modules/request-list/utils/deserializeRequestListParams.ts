import type { FilterValuesMap, FilterValue } from "../data-types/FilterValue";

import {
  ORG_REQUESTS_TAB_NAME,
  CCD_REQUESTS_TAB_NAME,
  MY_REQUESTS_TAB_NAME,
} from "../data-types/request-list-params";

import type { RequestListParams } from "../data-types/request-list-params";

const FILTER_PREFIX = "filter_";
const SERIALIZED_KEYS = {
  QUERY: "query",
  PAGE: "page",
  SORT_BY: "sort_by",
  SORT_ORDER: "sort_order",
  SELECTED_TAB_NAME: "selected_tab_name",
  ORGANIZATION_ID: "organization_id",
} as const;

const SORT_ORDER_ASC = "asc" as const;
const SORT_ORDER_DESC = "desc" as const;

export function deserializeRequestListParams(
  searchParams: URLSearchParams
): Partial<RequestListParams> {
  const res: Partial<RequestListParams> = {};

  const queryParam = searchParams.get(SERIALIZED_KEYS.QUERY);
  const pageParam = searchParams.get(SERIALIZED_KEYS.PAGE);
  const sortBy = searchParams.get(SERIALIZED_KEYS.SORT_BY);
  const sortOrder = searchParams.get(SERIALIZED_KEYS.SORT_ORDER);
  const selectedTabName = searchParams.get(SERIALIZED_KEYS.SELECTED_TAB_NAME);
  const organizationId = searchParams.get(SERIALIZED_KEYS.ORGANIZATION_ID);

  if (queryParam != null) {
    res.query = queryParam;
  }

  if (pageParam != null) {
    const page = parseInt(pageParam, 10);
    if (!Number.isNaN(page)) {
      res.page = page;
    }
  }

  if (
    sortBy != null &&
    sortOrder != null &&
    (sortOrder === SORT_ORDER_ASC || sortOrder === SORT_ORDER_DESC)
  ) {
    res.sort = { by: sortBy, order: sortOrder };
  }

  if (selectedTabName !== null) {
    if (selectedTabName === ORG_REQUESTS_TAB_NAME && organizationId != null) {
      const parsedOrganizationId = parseInt(organizationId, 10);
      if (!Number.isNaN(parsedOrganizationId)) {
        res.selectedTab = {
          name: ORG_REQUESTS_TAB_NAME,
          organizationId: parsedOrganizationId,
        };
      }
    } else if (
      selectedTabName === MY_REQUESTS_TAB_NAME ||
      selectedTabName === CCD_REQUESTS_TAB_NAME
    ) {
      res.selectedTab = { name: selectedTabName };
    }
  }

  const filters = getFiltersFromSearchParams(searchParams);
  if (Object.keys(filters).length > 0) {
    res.filters = filters;
  }

  return res;
}

// Recognizes a URL as authoritative only when it actually produced some
// deserialized state -- a bare/malformed recognized key on its own (e.g.
// `?sort_by=created_at` with no `sort_order`, or an invalid
// `selected_tab_name`) must not count, or resolveParamsFromUrl() would treat
// the URL as authoritative and clear the user's stored filters for nothing.
export function hasRequestListParams(searchParams: URLSearchParams): boolean {
  return Object.keys(deserializeRequestListParams(searchParams)).length > 0;
}

// Rejects prototype-chain property names so a crafted `filter___proto__=`
// (etc.) query param can't be used for prototype pollution below.
const UNSAFE_FIELD_NAMES = new Set(["__proto__", "constructor", "prototype"]);

function getFiltersFromSearchParams(
  searchParams: URLSearchParams
): FilterValuesMap {
  const seenFields = new Set<string>();
  const entries: Array<[string, FilterValue[]]> = [];

  for (const [key] of searchParams) {
    if (!key.startsWith(FILTER_PREFIX)) {
      continue;
    }

    const field = key.replace(FILTER_PREFIX, "");

    if (UNSAFE_FIELD_NAMES.has(field) || seenFields.has(field)) {
      continue;
    }

    seenFields.add(field);

    const values = searchParams.getAll(key).filter(isFilterValue);
    if (values.length > 0) {
      entries.push([field, values]);
    }
  }

  // Object.fromEntries defines properties directly rather than assigning
  // through bracket notation, so a tainted key (e.g. "__proto__") can never
  // reach the prototype chain here, unlike `res[field] = values`.
  return Object.fromEntries(entries);
}

function isFilterValue(value: unknown): value is FilterValue {
  return (
    typeof value === "string" &&
    (value.startsWith(":") || value.startsWith("<") || value.startsWith(">"))
  );
}
