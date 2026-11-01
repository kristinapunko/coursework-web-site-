import { MemoryRouter, useLocation } from 'react-router-dom';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import Pagination from '../ui/Pagination';
import { useTourFilterParams } from '../../features/tours/filterParams';

const Controls = () => {
  const location = useLocation();
  const { filters, updatePage } = useTourFilterParams();

  return (
    <>
      <Pagination currentPage={filters.page} totalPages={3} onPageChange={updatePage} />
      <output data-testid="location">{location.search}</output>
    </>
  );
};

const params = () => new URLSearchParams(screen.getByTestId('location').textContent);

describe('tour catalog URL controls', () => {
  it('preserves sorting and filters when the page changes', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter initialEntries={['/alltours?country=Україна&sort=price-desc']}>
        <Controls />
      </MemoryRouter>
    );

    await user.click(screen.getByRole('button', { name: 'Сторінка 2' }));
    await waitFor(() => {
      expect(params().get('sort')).toBe('price-desc');
      expect(params().get('page')).toBe('2');
    });
  });
});
