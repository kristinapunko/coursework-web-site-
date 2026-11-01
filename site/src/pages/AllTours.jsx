import { memo, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchTours } from '../features/tours/toursSlice';
import { fetchTourDetails } from '../features/tours/tourDetailsSlice';
import {
  selectPaginatedTours,
  selectTourPagination,
} from '../features/tours/tourSelectors';
import { useTourFilterParams } from '../features/tours/filterParams';
import Filters from '../components/Filters';
import TourList from '../components/TourList';
import Loading from '../components/ui/Loading';
import Error from '../components/Error';
import Pagination from '../components/ui/Pagination';

const AllTours = () => {
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.tours);
  const { loading: detailsLoading, error: detailsError } = useSelector((state) => state.tourDetails);
  const requestedPage = useSelector((state) => state.tours.filters.page);
  const thematicFilter = useSelector((state) => state.tourDetails.filters.thematicFilter);
  const tours = useSelector(selectPaginatedTours);
  const pagination = useSelector(selectTourPagination);
  const { updatePage } = useTourFilterParams();

  useEffect(() => {
    dispatch(fetchTours());
    dispatch(fetchTourDetails());
  }, [dispatch]);

  useEffect(() => {
    if (!loading && requestedPage !== pagination.currentPage) {
      updatePage(pagination.currentPage, { replace: true });
    }
  }, [loading, pagination.currentPage, requestedPage, updatePage]);

  if (loading || (thematicFilter && detailsLoading)) return <Loading />;
  if (error || (thematicFilter && detailsError)) return <Error />;

  return (
    <>
      <Filters />
      <p className="w-[90vw] xl:w-[80vw] mx-auto mt-5 text-[#543c52]" aria-live="polite">
        Знайдено турів: <strong>{pagination.totalItems}</strong>
      </p>
      <TourList tours={tours} />
      <Pagination
        currentPage={pagination.currentPage}
        totalPages={pagination.totalPages}
        onPageChange={(page) => updatePage(page)}
      />
    </>
  );
};

export default memo(AllTours);
