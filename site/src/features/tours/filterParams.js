import { useCallback, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export const DEFAULT_TOUR_FILTERS = Object.freeze({
  searchQuery: "",
  countries: "",
  startDate: null,
  endDate: null,
  adults: null,
  children: null,
  hasChildren: false,
  hotTours: false,
  promotion: false,
  cities: "",
  minPrice: 0,
  maxPrice: null,
  transport: null,
  selectedFood: [],
  premiumTours: false,
  tourIds: [],
  sort: "date-asc",
  page: 1,
});

export const TOUR_SORT_VALUES = Object.freeze([
  "date-asc",
  "date-desc",
  "price-asc",
  "price-desc",
  "duration-asc",
  "duration-desc",
]);

export const DEFAULT_DETAIL_FILTERS = Object.freeze({
  thematicFilter: "",
  beach_tour: false,
  festivals: false,
  winter_tour: false,
  extreme_tour: false,
  natural_tour: false,
  gastronomic_tour: false,
});

const THEMES = new Set([
  "beach_tour",
  "festivals",
  "winter_tour",
  "extreme_tour",
  "natural_tour",
  "gastronomic_tour",
]);

const PARAMS = {
  searchQuery: "q",
  countries: "country",
  cities: "city",
  startDate: "start",
  endDate: "end",
  adults: "adults",
  children: "children",
  hasChildren: "withChildren",
  hotTours: "hot",
  promotion: "promotion",
  minPrice: "minPrice",
  maxPrice: "maxPrice",
  transport: "transport",
  selectedFood: "food",
  premiumTours: "premium",
  tourIds: "tour",
  thematicFilter: "theme",
  sort: "sort",
  page: "page",
};

const SORT_VALUES = new Set(TOUR_SORT_VALUES);

const unique = (values) => [...new Set(values)];

const readNumber = (params, key, { min = 0, integer = false } = {}) => {
  const raw = params.get(key);
  if (raw === null || raw.trim() === "") return null;
  const value = Number(raw);
  if (!Number.isFinite(value) || value < min || (integer && !Number.isInteger(value))) {
    return null;
  }
  return value;
};

const readDate = (params, key) => {
  const value = params.get(key);
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  const isExactDate =
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day;
  return isExactDate ? value : null;
};

const readBoolean = (params, key) => params.get(key) === "1";

const asSearchParams = (value) => {
  if (value instanceof URLSearchParams) return value;
  return new URLSearchParams(typeof value === "string" ? value : "");
};

export const parseTourFilterParams = (search) => {
  const params = asSearchParams(search);
  const theme = params.get(PARAMS.thematicFilter) || "";
  const thematicFilter = THEMES.has(theme) ? theme : "";
  const requestedSort = params.get(PARAMS.sort);

  const main = {
    ...DEFAULT_TOUR_FILTERS,
    searchQuery: params.get(PARAMS.searchQuery)?.trim() || "",
    countries: params.get(PARAMS.countries) || "",
    cities: params.get(PARAMS.cities) || "",
    startDate: readDate(params, PARAMS.startDate),
    endDate: readDate(params, PARAMS.endDate),
    adults: readNumber(params, PARAMS.adults, { min: 1, integer: true }),
    children: readNumber(params, PARAMS.children, { min: 0, integer: true }),
    hasChildren: readBoolean(params, PARAMS.hasChildren),
    hotTours: readBoolean(params, PARAMS.hotTours),
    promotion: readBoolean(params, PARAMS.promotion),
    minPrice: readNumber(params, PARAMS.minPrice, { min: 0 }) ?? 0,
    maxPrice: readNumber(params, PARAMS.maxPrice, { min: 0 }),
    transport: params.get(PARAMS.transport) || null,
    selectedFood: unique(params.getAll(PARAMS.selectedFood).filter(Boolean)),
    premiumTours: readBoolean(params, PARAMS.premiumTours),
    tourIds: unique(
      params
        .getAll(PARAMS.tourIds)
        .map(Number)
        .filter((id) => Number.isInteger(id) && id > 0)
    ),
    sort: SORT_VALUES.has(requestedSort) ? requestedSort : DEFAULT_TOUR_FILTERS.sort,
    page: readNumber(params, PARAMS.page, { min: 1, integer: true }) ?? 1,
  };

  const details = {
    ...DEFAULT_DETAIL_FILTERS,
    thematicFilter,
    ...(thematicFilter ? { [thematicFilter]: true } : {}),
  };

  return { main, details };
};

const setValue = (params, key, value) => {
  if (value !== null && value !== undefined && value !== "") {
    params.set(key, String(value));
  }
};

export const serializeTourFilterParams = ({ main, details }) => {
  const filters = { ...DEFAULT_TOUR_FILTERS, ...main };
  const detailFilters = { ...DEFAULT_DETAIL_FILTERS, ...details };
  const params = new URLSearchParams();

  setValue(params, PARAMS.searchQuery, filters.searchQuery?.trim());
  setValue(params, PARAMS.countries, filters.countries);
  setValue(params, PARAMS.cities, filters.cities);
  setValue(params, PARAMS.startDate, filters.startDate);
  setValue(params, PARAMS.endDate, filters.endDate);
  setValue(params, PARAMS.adults, filters.adults);
  setValue(params, PARAMS.children, filters.children);
  if (filters.hasChildren) params.set(PARAMS.hasChildren, "1");
  if (filters.hotTours) params.set(PARAMS.hotTours, "1");
  if (filters.promotion) params.set(PARAMS.promotion, "1");
  if (Number(filters.minPrice) > 0) setValue(params, PARAMS.minPrice, filters.minPrice);
  setValue(params, PARAMS.maxPrice, filters.maxPrice);
  setValue(params, PARAMS.transport, filters.transport);
  unique(filters.selectedFood || []).forEach((food) => params.append(PARAMS.selectedFood, food));
  if (filters.premiumTours) params.set(PARAMS.premiumTours, "1");
  unique(filters.tourIds || []).forEach((id) => {
    if (Number.isInteger(Number(id)) && Number(id) > 0) {
      params.append(PARAMS.tourIds, String(id));
    }
  });
  if (THEMES.has(detailFilters.thematicFilter)) {
    params.set(PARAMS.thematicFilter, detailFilters.thematicFilter);
  }
  if (SORT_VALUES.has(filters.sort) && filters.sort !== DEFAULT_TOUR_FILTERS.sort) {
    params.set(PARAMS.sort, filters.sort);
  }
  if (Number.isInteger(Number(filters.page)) && Number(filters.page) > 1) {
    params.set(PARAMS.page, String(filters.page));
  }

  return params;
};

export const buildTourFilterUrl = ({ main = {}, details = {} } = {}) => {
  const params = serializeTourFilterParams({
    main: { ...DEFAULT_TOUR_FILTERS, ...main },
    details: { ...DEFAULT_DETAIL_FILTERS, ...details },
  });
  const query = params.toString();
  return query ? `/alltours?${query}` : "/alltours";
};

export const useTourFilterParams = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const parsed = useMemo(() => parseTourFilterParams(location.search), [location.search]);

  const navigateWithFilters = useCallback(
    ({ main, details }, { replace = false } = {}) => {
      const params = serializeTourFilterParams({ main, details });
      const query = params.toString();
      navigate({ pathname: "/alltours", search: query ? `?${query}` : "" }, { replace });
    },
    [navigate]
  );

  const updateFilters = useCallback(
    (updates, options = {}) => {
      const { preservePage = false, ...navigationOptions } = options;
      navigateWithFilters(
        {
          main: {
            ...parsed.main,
            ...updates,
            page: preservePage ? (updates.page ?? parsed.main.page) : 1,
          },
          details: parsed.details,
        },
        navigationOptions
      );
    },
    [navigateWithFilters, parsed]
  );

  const updatePage = useCallback(
    (page, options) => updateFilters({ page }, { ...options, preservePage: true }),
    [updateFilters]
  );

  const updateSort = useCallback(
    (sort, options) => updateFilters({ sort, page: 1 }, options),
    [updateFilters]
  );

  const resetFilters = useCallback(
    (main = {}, details = {}, options) => {
      navigateWithFilters(
        {
          main: { ...DEFAULT_TOUR_FILTERS, ...main },
          details: { ...DEFAULT_DETAIL_FILTERS, ...details },
        },
        options
      );
    },
    [navigateWithFilters]
  );

  return {
    filters: parsed.main,
    detailFilters: parsed.details,
    updateFilters,
    updatePage,
    updateSort,
    resetFilters,
  };
};
