import { useCallback, useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { FiArrowRight } from 'react-icons/fi';
import { useTourFilterParams } from '../../features/tours/filterParams';

const useIsMobile = (breakpoint = 1024) => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < breakpoint);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < breakpoint);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [breakpoint]);

  return isMobile;
};

const useHeaderFilters = () => {
  const { updateFilters, resetFilters } = useTourFilterParams();

  return {
    updateFilters,
    resetAllFilters: (additionalFilters = {}) => resetFilters(additionalFilters),
  };
};

const FilterList = ({
  items,
  selected,
  onChange,
  renderItem,
  containerClass = '',
  itemClass = '',
}) => (
  <div className={containerClass}>
    {items.map((item, index) => (
      <div
        key={`${item}-${index}`}
        onClick={() => onChange(item)}
        className={`${itemClass} ${selected === item ? 'text-[#543c52]' : 'hover:text-[#f55951]'} transition cursor-pointer`}
      >
        {renderItem ? renderItem(item) : item}
      </div>
    ))}
  </div>
);

export const TourFiltersMenu = () => {
  const { filters, minPrice, maxPrice } = useSelector((state) => state.tours);
  const { updateFilters } = useHeaderFilters();
  const isMobile = useIsMobile();
  const [minVal, setMinVal] = useState(filters.minPrice || minPrice);
  const [maxVal, setMaxVal] = useState(filters.maxPrice || maxPrice);
  const range = useRef(null);

  const getPercent = useCallback(
    (value) => Math.round(((value - minPrice) / (maxPrice - minPrice)) * 100),
    [minPrice, maxPrice]
  );

  useEffect(() => {
    if (!range.current) return;

    const minPercent = getPercent(minVal);
    const maxPercent = getPercent(maxVal);
    range.current.style.left = `${minPercent}%`;
    range.current.style.width = `${maxPercent - minPercent}%`;
  }, [minVal, maxVal, getPercent]);

  useEffect(() => {
    setMinVal(filters.minPrice || minPrice);
    setMaxVal(filters.maxPrice || maxPrice);
  }, [minPrice, maxPrice, filters.minPrice, filters.maxPrice]);

  const handlePriceChange = (event, isMinimum) => {
    const value = Number(event.target.value);

    if (isMinimum) {
      const nextMinimum = Math.min(value, maxVal - 1);
      setMinVal(nextMinimum);
      updateFilters({ ...filters, minPrice: nextMinimum }, { replace: true });
      return;
    }

    const nextMaximum = Math.max(value, minVal + 1);
    setMaxVal(nextMaximum);
    updateFilters({ ...filters, maxPrice: nextMaximum }, { replace: true });
  };

  const handleCheckboxChange = (type, value) => {
    const nextFilters = { ...filters };

    if (type === 'transport') {
      nextFilters.transport = filters.transport === value ? null : value;
    } else if (type === 'special') {
      const filterName = value === 'Гарячий тур' ? 'hotTours' : 'promotion';
      nextFilters[filterName] = !filters[filterName];
    } else if (type === 'food') {
      nextFilters.selectedFood = filters.selectedFood.includes(value)
        ? filters.selectedFood.filter((food) => food !== value)
        : [...filters.selectedFood, value];
    }

    updateFilters(nextFilters);
  };

  return (
    <div className={`flex flex-col gap-1 ${isMobile ? 'overflow-y-auto max-h-60' : ''}`}>
      <div className="bg-white p-2 rounded-lg shadow-md">
        <h3 className="text-md font-semibold text-[#361d32] mb-4">Діапазон цін</h3>
        <div className="flex justify-between mb-2">
          <div className="text-center">
            <p className="text-sm text-gray-500">Мінімум</p>
            <p className="text-xl font-bold text-[#543c52]">{minVal} грн</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-500">Максимум</p>
            <p className="text-xl font-bold text-[#543c52]">{maxVal} грн</p>
          </div>
        </div>
        <div className="relative w-full h-6">
          <input
            type="range"
            min={minPrice}
            max={maxPrice}
            value={minVal}
            onChange={(event) => handlePriceChange(event, true)}
            className="thumb thumb--left"
          />
          <input
            type="range"
            min={minPrice}
            max={maxPrice}
            value={maxVal}
            onChange={(event) => handlePriceChange(event, false)}
            className="thumb thumb--right"
          />
          <div className="slider">
            <div className="slider__track" />
            <div ref={range} className="slider__range" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        <div className="bg-white p-2 rounded-lg shadow-md">
          <label className="block text-sm font-medium text-[#543c52] mb-1">Тип проїзду:</label>
          <div className="flex flex-col gap-2">
            {['Літак', 'Автобус'].map((type) => (
              <label key={type} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  className="w-4 h-4 accent-[#543c52] rounded"
                  checked={filters.transport === type}
                  onChange={() => handleCheckboxChange('transport', type)}
                />
                <span className="text-sm text-[#543c52]">{type}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="bg-white p-2 rounded-lg shadow-md">
          <label className="block text-sm font-medium text-[#543c52] mb-1">Спеціальні:</label>
          <div className="flex flex-col gap-2">
            {['Акційні', 'Гарячий тур'].map((type) => (
              <label key={type} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  className="w-4 h-4 accent-[#543c52] rounded"
                  checked={type === 'Гарячий тур' ? filters.hotTours : filters.promotion}
                  onChange={() => handleCheckboxChange('special', type)}
                />
                <span className="text-sm text-[#543c52]">{type}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-md">
        <label className="block text-sm font-medium text-[#543c52] mb-2">Тип харчування:</label>
        <div className="flex flex-col gap-2">
          {['ОВ (без харчування)', 'ВВ (сніданок)', 'НВ (сніданок + вечеря)', 'FB (3-раз. харчування)', 'Al (все включено)'].map((food) => (
            <label key={food} className="flex items-center space-x-2">
              <input
                type="checkbox"
                className="w-4 h-4 accent-[#543c52] rounded"
                checked={filters.selectedFood.includes(food)}
                onChange={() => handleCheckboxChange('food', food)}
              />
              <span className="text-sm text-[#543c52]">{food}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
};

export const CountriesMenu = () => {
  const { filters, countries } = useSelector((state) => state.tours);
  const { updateFilters, resetAllFilters } = useHeaderFilters();
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timeout);
  }, [search]);

  const filteredCountries = (Array.isArray(countries) ? countries : []).filter((country) =>
    country.toLowerCase().includes(debouncedSearch.toLowerCase())
  );

  const handleCountryChange = (country) => {
    updateFilters({
      ...filters,
      countries: country !== 'Всі країни' ? country : '',
    });
  };

  return (
    <div className="p-2">
      <input
        type="text"
        placeholder="Знайти країну..."
        className="mb-2 p-2 border rounded w-full"
        value={search}
        onChange={(event) => setSearch(event.target.value)}
      />
      <FilterList
        items={filteredCountries}
        selected={filters.countries}
        onChange={handleCountryChange}
        containerClass="space-y-2 max-h-60 overflow-y-auto mb-4"
        itemClass="p-1 text-sm rounded"
      />
      <button
        onClick={() => resetAllFilters()}
        className="ml-auto mt-4 flex items-center gap-1 text-sm text-[#f55951]"
      >
        <span>Усі тури</span>
        <FiArrowRight />
      </button>
    </div>
  );
};

export const HotToursMenu = () => {
  const { filters, cities } = useSelector((state) => state.tours);
  const { updateFilters, resetAllFilters } = useHeaderFilters();
  const isMobile = useIsMobile();

  return (
    <div>
      <h3 className="mb-2 text-sm text-[#361d32] font-medium">Оберіть місто</h3>
      <FilterList
        items={cities}
        selected={filters.cities}
        onChange={(city) => updateFilters({ ...filters, cities: city, hotTours: true })}
        containerClass={`grid gap-2 ${isMobile ? 'grid-cols-1' : 'grid-cols-3'}`}
        itemClass="text-sm"
      />
      <button
        onClick={() => resetAllFilters({ hotTours: true })}
        className="ml-auto mt-4 flex items-center gap-1 text-sm text-[#f55951]"
      >
        <span>Усі гарячі тури</span>
        <FiArrowRight />
      </button>
    </div>
  );
};
