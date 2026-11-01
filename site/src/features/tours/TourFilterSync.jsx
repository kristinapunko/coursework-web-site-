import { useEffect, useMemo } from "react";
import { useDispatch } from "react-redux";
import { useLocation } from "react-router-dom";
import { replaceFilters } from "./toursSlice";
import { setFilters as setDetailFilters } from "./tourDetailsSlice";
import { parseTourFilterParams } from "./filterParams";

const TourFilterSync = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const parsed = useMemo(() => parseTourFilterParams(location.search), [location.search]);

  useEffect(() => {
    dispatch(replaceFilters(parsed.main));
    dispatch(setDetailFilters(parsed.details));
  }, [dispatch, parsed]);

  return null;
};

export default TourFilterSync;
