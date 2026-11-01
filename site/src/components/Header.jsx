import React, { useEffect, useState, useRef, useCallback } from 'react'
import '../App.css'
import {FiArrowRight, FiChevronDown} from "react-icons/fi";
import { AnimatePresence, motion } from "framer-motion";
import logo from '../assets/Logo .webp'
import {Link, NavLink, useNavigate} from "react-router-dom";
import { useDispatch, useSelector } from 'react-redux';
import { logoutUser } from '../features/authentication/authSlice';
import { setFilters } from '../features/tours/toursSlice'
import { IoMdMenu } from "react-icons/io";
import { resetFilters as resetMainFilters } from '../features/tours/toursSlice';
import { resetFilters as resetDetailsFilters } from '../features/tours/tourDetailsSlice';

function Header() {
    const [isOpen, setIsOpen] = useState(false);

    const dispatch = useDispatch();
    const { user, isLoggedIn } = useSelector((state) => state.auth);

    const handleLogout = () => {
        dispatch(logoutUser());
    };

    return (
      <>
  <header className="sticky top-0 left-0 w-full bg-white shadow-md z-50">
    <nav className="flex justify-between items-center w-[92%] mx-auto">
      <div>
        <a href="#" className=""><img className="w-[140px] md:w-[160px]" src={logo} alt="" /></a>
      </div>

      <div 
        className={`nav-links absolute bg-white w-full left-0 transition-all duration-300 ease-in-out ${
          isOpen ? "top-[100%] opacity-100" : "top-[-1000%] opacity-0"
        } lg:static lg:w-auto lg:flex lg:items-center lg:opacity-100 lg:top-0 lg:min-h-fit px-5`}
      >
        <ul className="flex lg:flex-row flex-col lg:items-center lg:gap-[4vw] gap-5 lg:gap-8">
          <li>
            <NavLink to="/" className=" text-md xl:text-base relative inline-block text-[#543c52] after:content-[''] after:absolute after:left-0 after:bottom-0 after:w-0 after:h-[2px] after:bg-[#543c52] after:transition-all after:duration-300 hover:after:w-full">
              Головна
            </NavLink>
          </li>
          <li>
            <NavLink to='/alltours' className=" text-md xl:text-base relative inline-block text-[#543c52] after:content-[''] after:absolute after:left-0 after:bottom-0 after:w-0 after:h-[2px] after:bg-[#543c52] after:transition-all after:duration-300 hover:after:w-full">
              Пошук
            </NavLink>
          </li>
          {isLoggedIn &&
          <li>
            <NavLink to='/cabinet' className=" text-md xl:text-base relative inline-block text-[#543c52] after:content-[''] after:absolute after:left-0 after:bottom-0 after:w-0 after:h-[2px] after:bg-[#543c52] after:transition-all after:duration-300 hover:after:w-full">
              Кабінет
            </NavLink>
          </li>}
          <li>
            <Tabs isOpen={isOpen} className="relative text-sm xl:text-base inline-block text-[#543c52]" />
          </li>
        </ul>
         <div className="flex items-center gap-6 lg:hidden block mb-8">
                        {!isLoggedIn ? (
                            <>
                                <NavLink className="bg-[#f1e8e6] text-sm text-[#543c52] px-4 py-2 rounded-full hover:bg-[#edd2cb]" to="/login">
                                    Log in
                                </NavLink>
                                <NavLink className="bg-[#543c52] text-sm text-[#f1e8e6] px-4 py-2 rounded-full hover:bg-[#361d32]" to="/register">
                                    Sign up
                                </NavLink>
                            </>
                        ) : (
                          <button 
                          onClick={handleLogout}
                          className="bg-[#543c52] text-sm text-[#f1e8e6] px-4 py-2 rounded-full hover:bg-[#361d32]"
                      >
                          Logout
                      </button>
                        )}
                    </div>
                    
      </div>
  
      <div className="flex items-center gap-6">
      {isLoggedIn ? (
                        <div className="flex items-center gap-4">
                            <span className="text-[#543c52]">{user.username}</span>
                            <button 
                                onClick={handleLogout}
                                className="bg-[#543c52] text-sm text-[#f1e8e6] px-4 py-2 rounded-full hover:bg-[#361d32] lg:block hidden"
                            >
                                Logout
                            </button>
                        </div>
                    ) : (<>
        <Link className="bg-[#f1e8e6] text-sm text-[#543c52] px-4 py-2 rounded-full hover:bg-[#edd2cb] lg:block hidden" to="/login">
          Log in
        </Link>
        <Link className="bg-[#543c52] text-sm text-[#f1e8e6] px-4 py-2 rounded-full hover:bg-[#361d32] lg:block hidden" to="/register">
          Sign up
        </Link></>)}
        <button 
          onClick={() => setIsOpen(!isOpen)} 
          className="lg:hidden  cursor-pointer right-20px" 
        >
          <IoMdMenu size={24} color="#543c52" />
        </button>
      </div>
    </nav>
  </header>
</>

    )
}


const Tabs = ({ isOpen }) => {
    const [selected, setSelected] = useState(null);
    const [dir, setDir] = useState(null);

    const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

    const handleSetSelected = (val) => {
      if (typeof selected === "number" && typeof val === "number") {
        setDir(selected > val ? "r" : "l");
      } else if (val === null) {
        setDir(null);
      }
      setSelected(val);
    };

    const toggleTab = (id) => {
      setSelected((prev) => (prev === id ? null : id));
    };

    return (
      <div
        onMouseLeave={() => handleSetSelected(null)}
        className={isOpen ? "block" : "relative flex h-fit gap-8 text-sm xl:text-base"}
      >
        {TABS.map((t) => {
          return (
            <div key={t.id} className="relative">
              {(isOpen && isMobile) ? (
                <div className="pb-6">
                  <button
                    onClick={() => toggleTab(t.id)}
                    className="relative inline-block text-[#543c52] 
                              after:content-[''] after:absolute after:left-0 after:bottom-0 
                              after:w-0 after:h-[2px] after:bg-[#543c52] 
                              after:transition-all after:duration-300 hover:after:w-full"
                  >
                    {t.title}
                  </button>
                  <AnimatePresence>
                    {selected === t.id && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="mt-2  pt-2 bg-white s p-2"
                      >
                        <t.Component />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <Tab
                  selected={selected}
                  handleSetSelected={handleSetSelected}
                  tab={t.id}
                >
                  {t.title}
                </Tab>
              )}
            </div>
          );
        })}

        {!isOpen && (
          <AnimatePresence>{selected && <Content dir={dir} selected={selected} />}</AnimatePresence>
        )}
      </div>
    );
  };

  
  const Tab = ({ children, tab, handleSetSelected, selected }) => {
    return (
      <button
        id={`shift-tab-${tab}`}
        onMouseEnter={() => handleSetSelected(tab)}
        onClick={() => handleSetSelected(tab)}
        className={`flex items-center gap-1 rounded-full  text-md  ${
          selected === tab
            ? "relative inline-block text-[#543c52] after:content-[''] after:absolute after:left-0 after:bottom-0 after:w-0 after:h-[2px] after:bg-[#543c52] after:transition-all after:duration-300 hover:after:w-full"
            : "text-[#543c52]"
        }`}
      >
        <span>{children}</span>
        <FiChevronDown
          className={`transition-transform ${
            selected === tab ? "rotate-180" : ""
          }`}
        />
      </button>
    );
  };
  
  const Content = ({ selected, dir }) => {
    return (
      <motion.div
        id="overlay-content"
        initial={{
          opacity: 0,
          y: 8,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        exit={{
          opacity: 0,
          y: 8,
        }}
        className="absolute left-0 tabs-container z-20 top-[calc(100%_+_24px)] w-96 rounded-lg border bg-white border-[#361d32] p-4"
      >
        <Bridge />
        <Nub selected={selected} />
  
        {TABS.map((t) => {
          return (
            <div className="overflow-hidden " key={t.id}>
              {selected === t.id && (
                <motion.div
                  initial={{
                    opacity: 0,
                    x: dir === "l" ? 100 : dir === "r" ? -100 : 0,
                  }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.25, ease: "easeInOut" }}
                >
                  <t.Component />
                </motion.div>
              )}
            </div>
          );
        })}
      </motion.div>
    );
  };
  
  const Bridge = () => (
    <div className="absolute -top-[24px] left-0 right-0 h-[24px]" />
  );
  
  const Nub = ({ selected }) => {
    const [left, setLeft] = useState(0);

    const moveNub = useCallback(() => {
      if (selected) {
        const hoveredTab = document.getElementById(`shift-tab-${selected}`);
        const overlayContent = document.getElementById("overlay-content");
  
        if (!hoveredTab || !overlayContent) return;
  
        const tabRect = hoveredTab.getBoundingClientRect();
        const { left: contentLeft } = overlayContent.getBoundingClientRect();
  
        const tabCenter = tabRect.left + tabRect.width / 2 - contentLeft;
  
        setLeft(tabCenter);
      }
    }, [selected]);

    useEffect(() => {
      moveNub();
      window.addEventListener("resize", moveNub);
      return () => window.removeEventListener("resize", moveNub);
    }, [moveNub]);
  
    return (
      <motion.span
        style={{
          clipPath: "polygon(0 0, 100% 0, 50% 50%, 0% 100%)",
        }}
        animate={{ left }}
        transition={{ duration: 0.25, ease: "easeInOut" }}
        className="absolute z-40 left-1/2 top-0 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rotate-45 rounded-tl border border-[#361d32] bg-[#543c52]"
      />
    );
  };





const useIsMobile = (breakpoint = 1024) => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < breakpoint);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < breakpoint);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [breakpoint]);

  return isMobile;
};

// Хук для роботи з фільтрами
const useFilters = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const updateFilters = (newFilters) => {
    dispatch(setFilters(newFilters));
    navigate("/alltours");
  };

  const resetAllFilters = (additionalFilters = {}) => {
    dispatch(resetMainFilters());
    dispatch(resetDetailsFilters());
    dispatch(setFilters(additionalFilters));
    navigate("/alltours");
  };

  return { updateFilters, resetAllFilters };
};

// Універсальний компонент для списків
const FilterList = ({ items, selected, onChange, renderItem, containerClass = "", itemClass = "" }) => (
  <div className={containerClass}>
    {items.map((item, index) => (
      <div
        key={`${item}-${index}`}
        onClick={() => onChange(item)}
        className={`${itemClass} ${selected === item ? "text-[#543c52]" : "hover:text-[#f55951]"} transition cursor-pointer`}
      >
        {renderItem ? renderItem(item) : item}
      </div>
    ))}
  </div>
);

// Компонент Filters
const Filters = () => {
  const { filters, minPrice, maxPrice } = useSelector((state) => state.tours);
  const { updateFilters } = useFilters();
  const isMobile = useIsMobile();
  const min = minPrice;
  const max = maxPrice;
  const currencyText = "грн";

  const [minVal, setMinVal] = useState(filters.minPrice || min);
  const [maxVal, setMaxVal] = useState(filters.maxPrice || max);
  const range = useRef(null);

  const getPercent = useCallback(
    (value) => Math.round(((value - min) / (max - min)) * 100),
    [min, max]
  );

  useEffect(() => {
    if (range.current) {
      const minPercent = getPercent(minVal);
      const maxPercent = getPercent(maxVal);
      range.current.style.left = `${minPercent}%`;
      range.current.style.width = `${maxPercent - minPercent}%`;
    }
  }, [minVal, maxVal, getPercent]);

  useEffect(() => {
    setMinVal(filters.minPrice || min);
    setMaxVal(filters.maxPrice || max);
  }, [min, max, filters.minPrice, filters.maxPrice]);

  const handlePriceChange = (e, isMin) => {
    const value = Number(e.target.value);
    if (isMin) {
      const newMin = Math.min(value, maxVal - 1);
      setMinVal(newMin);
      updateFilters({ ...filters, minPrice: newMin });
    } else {
      const newMax = Math.max(value, minVal + 1);
      setMaxVal(newMax);
      updateFilters({ ...filters, maxPrice: newMax });
    }
  };

  const handleCheckboxChange = (type, value) => {
    let newFilters = { ...filters };

    if (type === "transport") {
      newFilters.transport = filters.transport === value ? null : value;
    } else if (type === "special") {
      newFilters[value === "Гарячий тур" ? "hotTours" : "promotion"] = !filters[value === "Гарячий тур" ? "hotTours" : "promotion"];
    } else if (type === "food") {
      newFilters.selectedFood = filters.selectedFood.includes(value)
        ? filters.selectedFood.filter((f) => f !== value)
        : [...filters.selectedFood, value];
    }

    updateFilters(newFilters);
  };

  return (
    <div className={`flex flex-col gap-1 ${isMobile ? "overflow-y-auto max-h-60" : ""}`}>
      <div className="bg-white p-2 rounded-lg shadow-md">
        <h3 className="text-md font-semibold text-[#361d32] mb-4">Діапазон цін</h3>
        <div className="flex justify-between mb-2">
          <div className="text-center">
            <p className="text-sm text-gray-500">Мінімум</p>
            <p className="text-xl font-bold text-[#543c52]">{minVal} {currencyText}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-500">Максимум</p>
            <p className="text-xl font-bold text-[#543c52]">{maxVal} {currencyText}</p>
          </div>
        </div>
        <div className="relative w-full h-6">
          <input
            type="range"
            min={min}
            max={max}
            value={minVal}
            onChange={(e) => handlePriceChange(e, true)}
            className="thumb thumb--left"
          />
          <input
            type="range"
            min={min}
            max={max}
            value={maxVal}
            onChange={(e) => handlePriceChange(e, false)}
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
            {["Літак", "Автобус"].map((type) => (
              <label key={type} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  className="w-4 h-4 accent-[#543c52] rounded"
                  checked={filters.transport === type}
                  onChange={() => handleCheckboxChange("transport", type)}
                />
                <span className="text-sm text-[#543c52]">{type}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="bg-white p-2 rounded-lg shadow-md">
          <label className="block text-sm font-medium text-[#543c52] mb-1">Спеціальні:</label>
          <div className="flex flex-col gap-2">
            {["Акційні", "Гарячий тур"].map((type) => (
              <label key={type} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  className="w-4 h-4 accent-[#543c52] rounded"
                  checked={type === "Гарячий тур" ? filters.hotTours : filters.promotion}
                  onChange={() => handleCheckboxChange("special", type)}
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
          {["ОВ (без харчування)", "ВВ (сніданок)", "НВ (сніданок + вечеря)", "FB (3-раз. харчування)", "Al (все включено)"].map((food) => (
            <label key={food} className="flex items-center space-x-2">
              <input
                type="checkbox"
                className="w-4 h-4 accent-[#543c52] rounded"
                checked={filters.selectedFood.includes(food)}
                onChange={() => handleCheckboxChange("food", food)}
              />
              <span className="text-sm text-[#543c52]">{food}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
};

// Компонент Countries
const Countries = () => {
  const { filters, countries } = useSelector((state) => state.tours);
  const { updateFilters, resetAllFilters } = useFilters();
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300); 

    return () => {
      clearTimeout(handler); 
    };
  }, [search]);

  const handleCountryChange = (country) => {
    updateFilters({
      ...filters,
      countries: country !== "Всі країни" ? country : "",
    });
  };

  const allCountries = Array.isArray(countries) ? [...countries] : [];
  const filteredCountries = allCountries.filter((country) =>
    country.toLowerCase().includes(debouncedSearch.toLowerCase())
  );

  return (
    <div className="p-2">
      <input
        type="text"
        placeholder="Знайти країну..."
        className="mb-2 p-2 border rounded w-full"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
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

// Компонент Products
const Products = () => {
  const { filters, cities } = useSelector((state) => state.tours);
  const { updateFilters, resetAllFilters } = useFilters();
  const isMobile = useIsMobile();

  const handleCityClick = (city) => {
    updateFilters({ ...filters, cities: city, hotTours: true });
  };

  return (
    <div>
      <h3 className="mb-2 text-sm text-[#361d32] font-medium">Оберіть місто</h3>
      <FilterList
        items={cities}
        selected={filters.cities}
        onChange={handleCityClick}
        containerClass={`grid gap-2 ${isMobile ? "grid-cols-1" : "grid-cols-3"}`}
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







// const Products = () => {
//   const dispatch = useDispatch();
//   const { cities } = useSelector((state) => state.tours);
//   const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
//   const navigate = useNavigate();

//   const handleCityClick = (city) => {
//     dispatch(setFilters({ selectedCity: city, hotTours: true })); 
//     navigate('/alltours');
//   };

//   useEffect(() => {
//     const handleResize = () => setIsMobile(window.innerWidth < 1024);
//     window.addEventListener("resize", handleResize);
//     return () => window.removeEventListener("resize", handleResize);
//   }, []);

//   return (
//     <div>
//       <h3 className="mb-2 text-sm text-[#361d32] font-medium">Оберіть місто</h3>
//       <div className={`grid gap-2 ${isMobile ? "grid-cols-1" : "grid-cols-3"}`}>
//         {cities.map((city, index) => (
//           <button
//             key={`${city}-${index}`}
//             onClick={() => handleCityClick(city)}
//             className="text-sm text-[#543c52] hover:text-[#f55951] transition"
//           >
//             {city}
//           </button>
//         ))}
//       </div>

//       <button
//         onClick={() => {
//           dispatch(resetMainFilters());
//           dispatch(resetDetailsFilters());
//           dispatch(setFilters({ hotTours: true })); 
//           navigate('/alltours');
//         }}
//         className="ml-auto mt-4 flex items-center gap-1 text-sm text-[#f55951]"
//       >
//         <span>Усі гарячі тури</span>
//         <FiArrowRight />
//       </button>
//     </div>
//   );
// };

// const Filters = () => {
//   const navigate = useNavigate();
//   const { filters, filteredTours, tours, minPrice, maxPrice,  } = useSelector((state) => state.tours);
//   const dispatch = useDispatch();
//   const min = minPrice;
//   const max = maxPrice;
//   const currencyText = "грн";

//   const [minVal, setMinVal] = useState(filters.minPrice || min);
//   const [maxVal, setMaxVal] = useState(filters.maxPrice || max);
//   const range = useRef(null);

//   const handleTransportChange = (type) => {
//     dispatch(setFilters({ transport: filters.transport === type ? null : type }));
//   };

//   const handleSpecialOffersChange = (type, checked) => {
//     const newFilters = { ...filters };
    
//     if (type === 'Гарячий тур') {
//       newFilters.hotTours = checked;
//     } else if (type === 'Акційні') {
//       newFilters.promotion = checked;
//     }
    
//     dispatch(setFilters(newFilters));
//     navigate('/alltours');
//   };

//   const handleFoodTypeChange = (food) => {
//     const newSelectedFood = filters.selectedFood.includes(food)
//       ? filters.selectedFood.filter((f) => f !== food)
//       : [...filters.selectedFood, food];

//     dispatch(setFilters({ selectedFood: newSelectedFood }));
//     navigate('/alltours');
//   };

//   useEffect(() => {
//     dispatch(setFilters({ minPrice: minVal, maxPrice: maxVal }));
//     navigate('/alltours');

//   }, [minVal, maxVal, dispatch, navigate]);

//   const getPercent = useCallback(
//     (value) => Math.round(((value - min) / (max - min)) * 100),
//     [min, max]
//   );

//   useEffect(() => {
//     if (range.current) {
//       const minPercent = getPercent(minVal);
//       const maxPercent = getPercent(maxVal);
//       range.current.style.left = `${minPercent}%`;
//       range.current.style.width = `${maxPercent - minPercent}%`;
      
//     }
//   }, [minVal, maxVal, getPercent]);

//   useEffect(() => {
//     setMinVal(filters.minPrice || min);
//     setMaxVal(filters.maxPrice || max);
    
//   }, [min, max, filters.minPrice, filters.maxPrice]);

//   const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

//   useEffect(() => {
//     const handleResize = () => setIsMobile(window.innerWidth < 1024);
//     window.addEventListener("resize", handleResize);
//     return () => window.removeEventListener("resize", handleResize);
//   }, []);

//   return (
//     <div className={`flex flex-col gap-1 ${isMobile ? "overflow-y-auto max-h-60" : ""}`}>

//       <div className="bg-white p-2 rounded-lg shadow-md">
//         <h3 className="text-md font-semibold text-[#361d32] mb-4">Діапазон цін</h3>
        
//         <div className="flex justify-between mb-2">
//           <div className="text-center">
//             <p className="text-sm text-gray-500">Мінімум</p>
//             <p className="text-xl font-bold text-[#543c52]">{minVal} {currencyText}</p>
//           </div>
//           <div className="text-center">
//             <p className="text-sm text-gray-500">Максимум</p>
//             <p className="text-xl font-bold text-[#543c52]">{maxVal} {currencyText}</p>
//           </div>
//         </div>

//         <div className="relative w-full h-6">
//           <input
//             type="range"
//             min={min}
//             max={max}
//             value={minVal}
//             onChange={(e) => setMinVal(Math.min(Number(e.target.value), maxVal - 1))}
//             className="thumb thumb--left"
//           />
//           <input
//             type="range"
//             min={min}
//             max={max}
//             value={maxVal}
//             onChange={(e) => setMaxVal(Math.max(Number(e.target.value), minVal + 1))}
//             className="thumb thumb--right"
//           />
//           <div className="slider">
//             <div className="slider__track" />
//             <div ref={range} className="slider__range" />
// const Filters = () => {
//   const navigate = useNavigate();
//   const { filters, minPrice, maxPrice } = useSelector((state) => state.tours);
//   const dispatch = useDispatch();
//   const min = minPrice;
//   const max = maxPrice;
//   const currencyText = "грн";

//   const [minVal, setMinVal] = useState(filters.minPrice || min);
//   const [maxVal, setMaxVal] = useState(filters.maxPrice || max);
//   const [priceChanged, setPriceChanged] = useState(false); // Новий стан для відстеження змін ціни
//   const range = useRef(null);

//   const handleTransportChange = (type) => {
//     dispatch(setFilters({ transport: filters.transport === type ? null : type }));
//     navigate('/alltours');
//   };

//   const handleSpecialOffersChange = (type, checked) => {
//     const newFilters = { ...filters };
    
//     if (type === 'Гарячий тур') {
//       newFilters.hotTours = checked;
//     } else if (type === 'Акційні') {
//       newFilters.promotion = checked;
//     }
    
//     dispatch(setFilters(newFilters));
//     navigate('/alltours');
//   };

//   const handleFoodTypeChange = (food) => {
//     const newSelectedFood = filters.selectedFood.includes(food)
//       ? filters.selectedFood.filter((f) => f !== food)
//       : [...filters.selectedFood, food];

//     dispatch(setFilters({ selectedFood: newSelectedFood }));
//     navigate('/alltours');
//   };

//   useEffect(() => {
//     if (priceChanged) {
//       dispatch(setFilters({ minPrice: minVal, maxPrice: maxVal }));
//       navigate('/alltours');
//       setPriceChanged(false); // Скидаємо прапорець після перенаправлення
//     }
//   }, [minVal, maxVal, dispatch, navigate, priceChanged]);

//   const handlePriceChange = (e, isMin) => {
//     const value = Number(e.target.value);
//     if (isMin) {
//       setMinVal(Math.min(value, maxVal - 1));
//     } else {
//       setMaxVal(Math.max(value, minVal + 1));
//     }
//     setPriceChanged(true); // Встановлюємо прапорець при зміні ціни
//   };

//   const getPercent = useCallback(
//     (value) => Math.round(((value - min) / (max - min)) * 100),
//     [min, max]
//   );

//   useEffect(() => {
//     if (range.current) {
//       const minPercent = getPercent(minVal);
//       const maxPercent = getPercent(maxVal);
//       range.current.style.left = `${minPercent}%`;
//       range.current.style.width = `${maxPercent - minPercent}%`;
//     }
//   }, [minVal, maxVal, getPercent]);

//   useEffect(() => {
//     setMinVal(filters.minPrice || min);
//     setMaxVal(filters.maxPrice || max);
//   }, [min, max, filters.minPrice, filters.maxPrice]);

//   const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

//   useEffect(() => {
//     const handleResize = () => setIsMobile(window.innerWidth < 1024);
//     window.addEventListener("resize", handleResize);
//     return () => window.removeEventListener("resize", handleResize);
//   }, []);

//   return (
//     <div className={`flex flex-col gap-1 ${isMobile ? "overflow-y-auto max-h-60" : ""}`}>
//       <div className="bg-white p-2 rounded-lg shadow-md">
//         <h3 className="text-md font-semibold text-[#361d32] mb-4">Діапазон цін</h3>
        
//         <div className="flex justify-between mb-2">
//           <div className="text-center">
//             <p className="text-sm text-gray-500">Мінімум</p>
//             <p className="text-xl font-bold text-[#543c52]">{minVal} {currencyText}</p>
//           </div>
//           <div className="text-center">
//             <p className="text-sm text-gray-500">Максимум</p>
//             <p className="text-xl font-bold text-[#543c52]">{maxVal} {currencyText}</p>
//           </div>
//         </div>

//         <div className="relative w-full h-6">
//           <input
//             type="range"
//             min={min}
//             max={max}
//             value={minVal}
//             onChange={(e) => handlePriceChange(e, true)}
//             className="thumb thumb--left"
//           />
//           <input
//             type="range"
//             min={min}
//             max={max}
//             value={maxVal}
//             onChange={(e) => handlePriceChange(e, false)}
//             className="thumb thumb--right"
//           />
//           <div className="slider">
//             <div className="slider__track" />
//             <div ref={range} className="slider__range" />
//           </div>
//         </div>
//       </div>

//       <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
//         <div className="bg-white p-2 rounded-lg shadow-md">
//           <label className="block text-sm font-medium text-[#543c52] mb-1">
//             Тип проїзду:
//           </label>
//           <div className="flex flex-col gap-2">
//             {['Літак', 'Автобус'].map((type) => (
//               <label key={type} className="flex items-center space-x-2">
//                 <input 
//                   type="checkbox" 
//                   className="w-4 h-4 accent-[#543c52] rounded"
//                   checked={filters.transport === type}
//                   onChange={() => handleTransportChange(type)}
//                 />
//                 <span className="text-sm text-[#543c52]">{type}</span>
//               </label>
//             ))}
//           </div>
//         </div>

//         <div className="bg-white p-2 rounded-lg shadow-md">
//           <label className="block text-sm font-medium text-[#543c52] mb-1">
//             Спеціальні: 
//           </label>
//           <div className="flex flex-col gap-2">
//             {['Акційні', 'Гарячий тур'].map((type) => (
//               <label key={type} className="flex items-center space-x-2">
//                 <input 
//                   type="checkbox" 
//                   className="w-4 h-4 accent-[#543c52] rounded"
//                   checked={
//                     type === 'Гарячий тур' ? filters.hotTours : 
//                     type === 'Акційні' ? filters.promotion : false
//                   }
//                   onChange={(e) => handleSpecialOffersChange(type, e.target.checked)}
//                 />
//                 <span className="text-sm text-[#543c52]">{type}</span>
//               </label>
//             ))}
//           </div>
//         </div>
//       </div>

//       <div className="bg-white p-4 rounded-lg shadow-md">
//         <label className="block text-sm font-medium text-[#543c52] mb-2">
//           Тип харчування:
//         </label>
//         <div className="flex flex-col gap-2">
//           {['ОВ (без харчування)', 'ВВ (сніданок)', 'НВ (сніданок + вечеря)', 'FB (3-раз. харчування)', 'Al (все включено)'].map((food) => (
//             <label key={food} className="flex items-center space-x-2">
//               <input
//                 type="checkbox"
//                 className="w-4 h-4 accent-[#543c52] rounded"
//                 checked={filters.selectedFood.includes(food)}
//                 onChange={() => handleFoodTypeChange(food)}
//               />
//               <span className="text-sm text-[#543c52]">{food}</span>
//             </label>
//           ))}
//         </div>
//       </div>
//       </div>
//   );
// };

//   const Countries = () => {
//     const dispatch = useDispatch();
//     const navigate = useNavigate();
//     const { filters, countries } = useSelector(state => state.tours);
//     const [search, setSearch] = useState("");
  
//     const handleCountryChange = (country) => {
//       const updatedFilters = {
//         searchQuery: filters.searchQuery || "",
//         countries: country !== "Всі країни" ? country : "",
//         startDate: filters.startDate,
//         endDate: filters.endDate,
//         adults: filters.adults,
//         children: filters.children,
//       };
//       dispatch(setFilters(updatedFilters));
//       navigate("/alltours");
//     };
  
//     const allCountries = Array.isArray(countries) ? [...countries] : [];
  
//     const filteredCountries = allCountries.filter(country =>
//       country.toLowerCase().includes(search.toLowerCase())
//     );
  
//     return (
//       <div className="p-2">
//         <input
//           type="text"
//           placeholder="Знайти країну..."
//           className="mb-2 p-2 border rounded w-full"
//           value={search}
//           onChange={(e) => setSearch(e.target.value)}
//         />

//         <div className="space-y-2 max-h-60 overflow-y-auto mb-4">
//           {filteredCountries.map(country => (
//             <div 
//               key={country}
//               onClick={() => handleCountryChange(country)}
//               className={`p-1 text-sm cursor-pointer rounded ${
//                 filters.countries === country 
//                   ? ' text-[#543c52] transition' 
//                   : 'hover:text-[#f55951]'
//               }`}
//             >
//               {country}
//             </div>
//           ))}
//         </div>
  
//         <button
//         onClick={() => {
//           dispatch(resetMainFilters());
//           dispatch(resetDetailsFilters());
//           navigate('/alltours');
//         }}
//         className="ml-auto mt-4 flex items-center gap-1 text-sm text-[#f55951]"
//       >
//           <span>Усі тури</span>
//           <FiArrowRight />
//         </button>
//       </div>
//     );
//   };
  
  const TABS = [
    {
      title: "Гарячі тури",
      Component: Products,
    },
    {
      title: "Країни",
      Component: Countries,
    },
    {
        title: "Фільтрувати",
        Component: Filters,
      },

  ].map((n, idx) => ({ ...n, id: idx + 1 }));

export default React.memo(Header);
