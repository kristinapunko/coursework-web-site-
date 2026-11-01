import { Outlet } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ScrollToTop from '../components/ScrollToTop';
import TourFilterSync from '../features/tours/TourFilterSync';


const RootLayout = () => {
  return (
    <>
    <TourFilterSync />
    <ScrollToTop/>
      <Header />
      <main>
        <Outlet />
      </main>
      <Footer />
    </>
  );
};

export default RootLayout;
