import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/client';

const initialState = {
  loading: false,
  tours: [],
  selectedTour: null,
  error: "",
  cities: [],
  countries: [],
  minPrice: 0,
  maxPrice: 0,
  filters: { 
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
    maxPrice:null,
    transport: null, 
    selectedFood: [],
    popularTours: false,
    premiumTours: false,
  }, 
  filteredTours: [], 
  popularTours: [],
};

export const fetchTours = createAsyncThunk(
  'tour/fetchTours',
  async () => {
    const response = await api.get('/tours/?format=json');
    return response.data;
  },
  {
    condition: (_, { getState }) => {
      const { loading, tours } = getState().tours;
      return !loading && tours.length === 0;
    },
  }
);

export const fetchTourById = createAsyncThunk('tourDetails/fetchTourById', async (id) => {
    const response = await api.get(`/tours/${id}/?format=json`);
    return response.data;
});

const toursSlice = createSlice({
  name: 'tour',
  initialState,
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
      state.filteredTours = filterTours(state);
    },
    setSelectedCity: (state, action) => {
      state.filters.cities = action.payload;
      state.filteredTours = filterTours(state);
    },
    setSelectedCountry: (state, action) => {
      state.filters.countries = action.payload;
      state.filteredTours = filterTours(state);
    },
    resetFilters: (state) => {
      state.filters = initialState.filters;
      state.filteredTours = state.tours;
      state.popularTours = [];
    },
    setPopularTours: (state, action) => {
      state.popularTours = action.payload;
      state.filters.popularTours = true;
      state.filteredTours = filterTours(state);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTours.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchTours.fulfilled, (state, action) => {
        state.loading = false;
        state.tours = action.payload;

        const uniqueCountries = [];
        action.payload.forEach(tour => {
          if (tour.countries) {
            const countriesArray = tour.countries.split(',').map(country => country.trim());
            countriesArray.forEach(country => uniqueCountries.push(country));
          }
        });

        state.countries = uniqueCountries.filter((country, index) => {
          return uniqueCountries.indexOf(country) === index;
        });

        const uniqueCities = [];
        action.payload.forEach(tour => {
          if (tour.countries && tour.cities) {
            const citiesArray = tour.cities
              .split(',')
              .map(city => city.trim())
              .filter(city => city !== ''); 
        
            citiesArray.forEach(city => uniqueCities.push(city));
          }
        });
        state.cities = uniqueCities.filter((city, index) => {
          return uniqueCities.indexOf(city) === index;
        });

        let minPrice = Infinity;
        let maxPrice = -Infinity;

        action.payload.forEach(tour => {
          const price = tour.promotion ? parseFloat(tour.price_promotion) : parseFloat(tour.price);
          if (price < minPrice) minPrice = price;
          if (price > maxPrice) maxPrice = price;
        });

        state.minPrice = Number.isFinite(minPrice) ? minPrice : 0;
        state.maxPrice = Number.isFinite(maxPrice) ? maxPrice : 0;

        state.filteredTours = filterTours(state); 
      })
      .addCase(fetchTours.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(fetchTourById.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchTourById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedTour = action.payload;
      })
      .addCase(fetchTourById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

const filterTours = (state) => {
  const { tours, filters, popularTours } = state;
  
  return tours.filter((tour) => {
    const { 
      searchQuery, 
      countries, 
      cities, 
      startDate, 
      endDate, 
      adults, 
      children,
      hasChildren,
      hotTours,
      promotion,
      minPrice = 0,
      maxPrice = Infinity,
      transport,
      selectedFood, 
      popularTours: isPopularTours,
      premiumTours,
    } = filters;

    const countriesArray = tour.countries ? tour.countries.split(',').map(c => c.trim()) : [];
    const citiesArray = tour.cities ? tour.cities.split(',').map(c => c.trim()) : [];
    const isCountryMatch = !countries || countriesArray.includes(countries);
    const isCityMatch = !cities || citiesArray.includes(cities);

    const tourStartDate = new Date(tour.start_date);
    const tourEndDate = new Date(tour.end_date);
    const filterStartDate = startDate ? new Date(startDate) : null;
    const filterEndDate = endDate ? new Date(endDate) : null;

    const isDateInRange = 
      (!filterStartDate || tourEndDate >= filterStartDate) && 
      (!filterEndDate || tourStartDate <= filterEndDate);

    const isSearchMatch = !searchQuery || 
      tour.name.toLowerCase().includes(searchQuery.toLowerCase());

    const isAdultsMatch = adults === null || tour.adults >= Number(adults);
    const isChildrenMatch = children === null || tour.children === Number(children); 
    const isHasChildrenMatch = !hasChildren || tour.children > 0;
    const isHotTourMatch = !hotTours || tour.hot_deal;
    const isPromotionMatch = !promotion || tour.promotion;
    const isTransportMatch = !transport || tour.departure_by === transport;

    let price = Number(tour.promotion ? tour.price_promotion : tour.price);
    const parsedMinPrice = minPrice !== null && minPrice !== undefined && minPrice !== "" ? Number(minPrice) : 0;
    const parsedMaxPrice = maxPrice !== null && maxPrice !== undefined && maxPrice !== "" ? Number(maxPrice) : Infinity;

    const isPriceMatch = price >= parsedMinPrice && price <= parsedMaxPrice;

    const isFoodMatch = !selectedFood || !selectedFood.length || selectedFood.includes(tour.food);
    const isPopularTourMatch = !isPopularTours || popularTours.some((popular) => popular.id === tour.id);
    
    const isPremiumTourMatch = !premiumTours || price >= 100000; 

    return (
      isSearchMatch &&
      isCountryMatch &&
      isCityMatch &&
      isDateInRange &&
      isAdultsMatch &&
      isChildrenMatch &&
      isHasChildrenMatch &&
      isHotTourMatch &&
      isPriceMatch && 
      isPromotionMatch &&
      isTransportMatch &&
      isFoodMatch &&
      isPopularTourMatch &&
      isPremiumTourMatch
    );
  });
};

export const { 
  setFilters, 
  resetFilters, 
  setSelectedCity, 
  setSelectedCountry, 
  setPopularTours 
} = toursSlice.actions;

export default toursSlice.reducer;
