import { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { FaGlobe, FaPlaneDeparture, FaCalendarAlt, FaUser, FaUndo, FaSortAmountDown } from "react-icons/fa";
import arrowIcon from "../assets/2.webp";
import { registerLocale } from "react-datepicker";
import uk from "date-fns/locale/uk";
import "../App.css";
import { fetchTours } from "../features/tours/toursSlice";
import { useTourFilterParams } from "../features/tours/filterParams";

registerLocale("uk", uk);

const SORT_OPTIONS = {
  "Дата: найближчі": "date-asc",
  "Дата: пізніші": "date-desc",
  "Ціна: від нижчої": "price-asc",
  "Ціна: від вищої": "price-desc",
  "Тривалість: коротші": "duration-asc",
  "Тривалість: довші": "duration-desc",
};

const Filters = () => {
  const [openDropdown, setOpenDropdown] = useState(null);
  const [calendarOpen, setCalendarOpen] = useState(false);

  const dispatch = useDispatch();
  const { updateFilters, updateSort, resetFilters } = useTourFilterParams();
  const { filters, tours, countries, cities } = useSelector((state) => state.tours);

  const startDate = filters.startDate ? new Date(filters.startDate) : null;
  const endDate = filters.endDate ? new Date(filters.endDate) : null;
  const adultCount = filters.adults ?? 1;
  const childCount = filters.children ?? 0;
  const [searchInput, setSearchInput] = useState(filters.searchQuery || "");
  const debounceTimeout = useRef(null);

  useEffect(() => {
    setSearchInput(filters.searchQuery || "");
  }, [filters.searchQuery]);

  useEffect(() => () => clearTimeout(debounceTimeout.current), []);

  useEffect(() => {
    if (tours.length === 0) {
      dispatch(fetchTours());
    }
  }, [dispatch, tours.length]);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchInput(value);
  
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }
  
    debounceTimeout.current = setTimeout(() => {
      updateFilters({ searchQuery: value }, { replace: true });
    }, 700); 
  };
  

  const handleDropdownChange = (key, value) => {
    const normalizedValue = value === `Всі ${key === "countries" ? "країни" : "міста"}` ? "" : value;
    updateFilters({ [key]: normalizedValue });
  };

  const handleDateChange = (dates) => {
    const [start, end] = dates;
    const toDateParam = (date) => {
      if (!date) return null;
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    };
    updateFilters({
      startDate: toDateParam(start),
      endDate: toDateParam(end),
    });
  };

  const handlePeopleChange = (type, delta) => {
    const key = type === "adults" ? "adults" : "children";
    const currentCount = filters[key] ?? (type === "adults" ? 1 : 0);
    const newCount = Math.max(type === "adults" ? 1 : 0, currentCount + delta);
    updateFilters({ [key]: newCount });
  };

  const handleSearch = () => {
    clearTimeout(debounceTimeout.current);
    updateFilters({ searchQuery: searchInput });
  };

  const handleResetAllFilters = () => {
    resetFilters();
    setSearchInput("");
    setOpenDropdown(null);
    setCalendarOpen(false);
  };

  const toggleDropdown = (dropdown) => {
    setOpenDropdown(openDropdown === dropdown ? null : dropdown);
  };

  const formattedDate = startDate
    ? startDate.toLocaleDateString("uk-UA", { year: "2-digit", month: "short", day: "numeric" }) +
      (endDate
        ? " - " + endDate.toLocaleDateString("uk-UA", { year: "2-digit", month: "short", day: "numeric" })
        : "")
    : "Оберіть дату";

  const Dropdown = ({ id, icon, label, value, options, onChange, containerClass = "w-full" }) => (
    <div className={`relative ${containerClass}`}>
      <div
        className="flex items-center gap-3 p-2 lg:p-4 bg-white shadow-md rounded-lg cursor-pointer"
        onClick={() => toggleDropdown(id)}
      >
        <span className="text-[#361d32] text-2xl">{icon}</span>
        <div>
          <p className="text-[#f55951] text-md">{label}</p>
          <p className="text-[#543c52] font-bold">{value || options[0]}</p>
        </div>
      </div>
      {openDropdown === id && (
        <div className="absolute left-0 mt-2 w-full bg-white shadow-lg rounded-lg z-10 max-h-60 overflow-y-auto">
          {options.map((option) => (
            <p
              key={option}
              className="px-4 py-2 hover:bg-[#f55951] hover:text-white cursor-pointer"
              onClick={() => onChange(option)}
            >
              {option}
            </p>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="w-[90vw] xl:w-[80vw] mx-auto mt-6 bg-[#361d32]/25 p-4 lg:p-6 rounded-xl shadow-lg">
      <div className="w-full xl:w-[75vw] mx-auto relative lg:flex items-center mb-3 lg:mb-6 gap-4">
        <div className="w-full lg:flex-1 relative flex items-center">
          <input
            type="text"
            name="searchQuery"
            placeholder="Пошук..."
            value={searchInput}
            onChange={handleSearchChange}
            className="w-full text-[#543c52] px-2 py-1 lg:px-4 lg:py-2 rounded-full ring-2 ring-white focus:outline-none focus:ring-2 focus:ring-[#543c52]"
          />
          <button
            onClick={handleSearch}
            className="absolute right-1 top-1/2 transform -translate-y-1/2 bg-[#361d32] text-white p-1 lg:p-2 rounded-full hover:bg-[#543c52] transition"
          >
            <img src={arrowIcon} alt="Search" className="w-6 h-4" />
          </button>
        </div>
        <button
          onClick={handleResetAllFilters}
          className="w-full lg:w-auto my-4 lg:my-0 whitespace-nowrap bg-[#f55951] text-white px-4 py-2 rounded-full hover:bg-[#d3453d] transition flex items-center justify-center gap-2"
        >
          <FaUndo /> Скинути фільтри
        </button>
        <Dropdown
          id="sort"
          icon={<FaSortAmountDown />}
          label="Сортування"
          value={Object.keys(SORT_OPTIONS).find((label) => SORT_OPTIONS[label] === filters.sort)}
          options={Object.keys(SORT_OPTIONS)}
          onChange={(label) => updateSort(SORT_OPTIONS[label])}
          containerClass="w-full lg:w-64"
        />
      </div>

      <div className="flex flex-col lg:flex-row items-center gap-1 lg:gap-4">
        <Dropdown
          id="country"
          icon={<FaGlobe />}
          label="Країна, курорт"
          value={filters.countries}
          options={["Всі країни", ...countries]}
          onChange={(value) => handleDropdownChange("countries", value)}
        />
        <Dropdown
          id="city"
          icon={<FaPlaneDeparture />}
          label="Виїзд з міста"
          value={filters.cities}
          options={["Всі міста", ...cities]}
          onChange={(value) => handleDropdownChange("cities", value)}
        />

        <div className="relative w-full z-20">
          <div
            className="flex items-center gap-3 p-2 lg:p-4 bg-white shadow-md rounded-lg cursor-pointer"
            onClick={() => setCalendarOpen(!calendarOpen)}
          >
            <span className="text-[#361d32] text-2xl"><FaCalendarAlt /></span>
            <div className="relative w-auto">
              <p className="text-[#f55951] text-md">Дата, тривалість</p>
              <DatePicker
                selected={startDate}
                onChange={handleDateChange}
                startDate={startDate}
                endDate={endDate}
                selectsRange
                monthsShown={2}
                locale="uk"
                placeholderText="Оберіть дату"
                value={formattedDate}
                className="bg-white text-[#543c52] w-full cursor-pointer"
                calendarClassName="custom-datepicker"
              />
            </div>
          </div>
        </div>

        <div className="relative w-full">
          <div
            className="flex items-center gap-3 p-2 lg:p-4 bg-white shadow-md rounded-lg cursor-pointer"
            onClick={() => toggleDropdown("adults")}
          >
            <span className="text-[#361d32] text-2xl"><FaUser /></span>
            <div>
              <p className="text-[#f55951] text-md">Хто їде</p>
              <p className="text-[#543c52] font-bold">Дорослих: {adultCount} Дітей: {childCount}</p>
            </div>
          </div>
          {openDropdown === "adults" && (
            <div className="absolute left-0 mt-2 w-full bg-white shadow-lg rounded-lg z-10">
              <div className="mt-4 flex items-center justify-between">
                <span className="mx-4">Дорослі:</span>
                <div className="mx-4">
                  <button
                    onClick={() => handlePeopleChange("adults", -1)}
                    className="text-2xl px-2 disabled:text-gray-200"
                    disabled={adultCount <= 1}
                  >
                    -
                  </button>
                  <span className="mx-2">{adultCount}</span>
                  <button onClick={() => handlePeopleChange("adults", 1)} className="text-2xl px-2">
                    +
                  </button>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between">
                <span className="mx-4">Діти:</span>
                <div className="mx-4">
                  <button
                    onClick={() => handlePeopleChange("children", -1)}
                    className="text-2xl px-2 disabled:text-gray-200"
                    disabled={childCount <= 0}
                  >
                    -
                  </button>
                  <span className="mx-2">{childCount}</span>
                  <button onClick={() => handlePeopleChange("children", 1)} className="text-2xl px-2">
                    +
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Filters;
