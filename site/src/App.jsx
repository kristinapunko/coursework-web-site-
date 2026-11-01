import { lazy, Suspense, useEffect } from 'react'
import './App.css'
import Slides from './components/ui/Slides'
import TourList from './components/TourList'
import GridComponent from './components/AboutUs'
import DestinationGrid from './components/PopularTours'
import Error from './components/Error'
import TourL from './components/ThematicTours'
import RootLayout from './layout/RootLayout'
import NotFound from './components/NotFound'
import { Navigate, Route, createBrowserRouter, createRoutesFromElements, RouterProvider, useLocation } from 'react-router-dom'
import Filters from './components/Filters'
import { useDispatch, useSelector } from 'react-redux';
import { checkLoggedInUser } from './features/authentication/authSlice'
import ImageGrid from './components/ImageSlider'
import authBackground from './assets/ken-cheung-KonWFWUaAuk-unsplash.webp'

const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const TourDescription = lazy(() => import('./pages/TourDescription'));
const AllTours = lazy(() => import('./pages/AllTours'));
const CabinetLayout = lazy(() => import('./layout/CabinetLayout'));
const Cabinet = lazy(() => import('./pages/Сabinet'));
const Booking = lazy(() => import('./pages/Booking'));
const AgencyReviews = lazy(() => import('./pages/AgencyReviews'));
const AboutusPage = lazy(() => import('./pages/AboutusPage'));

function App() {
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(checkLoggedInUser()); 
  }, [dispatch]);
  
    return (
      <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
        <RouterProvider router={router}/>
      </Suspense>
    )
}

const Home = () => {
  const { tours } = useSelector((state) => state.tours);
  return <>

      <Slides className='-z-10'/>
      <Filters/>
      <Name main="Знайди свою найкращу" other="країну" />
      <ImageGrid />
      <Name main="Усі тури" other=""/>
      <TourList tours={tours}/>
      <Name main="Чому ми" other=""/>
      <GridComponent />
      <Name main="Найпопулярніші напрямки" other="турів"/>
      <DestinationGrid />
      <Name main="Тематичні" other="тури"/>
      <TourL/>

  </>
};
  
const Name = (props) =>(
  <div className="flex justify-center items-center">
    <h1 className='capitalize text-[#361d32] text-xl my-4 lg:my-10 lg:text-3xl'>
        <span className='font-semibold'>{props.main}</span> {props.other}
    </h1>
</div>
)

const AuthLayout = ({ children }) => (
  <div
    className="text-white h-[100vh] flex justify-center items-center bg-cover bg-center"
    style={{
      backgroundImage: `linear-gradient(to top, rgba(54, 29, 50, 0.7), rgba(0, 0, 0, 0)), url("${authBackground}")`,
    }}
  >
    {children}
  </div>
);

const RequireAuth = ({ children }) => {
  const location = useLocation();
  const { isLoggedIn, status } = useSelector((state) => state.auth);

  if (status === 'idle' || status === 'loading') {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }
  if (!isLoggedIn) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  return children;
};

const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      <Route element={<RootLayout />}>
        <Route index element={<Home />} />
        <Route path="tour/:id" element={<TourDescription />} errorElement={<Error />} />
        <Route path="alltours" element={<AllTours />} />
        <Route path="reviews" element={<AgencyReviews />} />
        <Route path="aboutus" element={<AboutusPage />} />
        <Route path="cabinet" element={<RequireAuth><CabinetLayout /></RequireAuth>}>
          <Route index element={<Cabinet />} />
          <Route path="likedTours" element={<Cabinet />} />
          <Route path="booking" element={<Booking />} />
        </Route>
      </Route>
      <Route path="login" element={<AuthLayout><Login /></AuthLayout>} />
      <Route path="register" element={<AuthLayout><Register /></AuthLayout>} />
      <Route path="*" element={<NotFound />} />
    </>
  )
);



export default App
