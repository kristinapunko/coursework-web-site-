import { NavLink, Outlet } from 'react-router-dom';

const CabinetLayout = () => {
  return (
    <>
      <div>
        <ul className="flex lg:flex-row flex-col lg:items-center lg:gap-[4vw] gap-2 md:gap-5 lg:gap-8 mx-8 mt-4 md:m-12">
          <li>
            <NavLink
              to="likedTours" 
              className="active text-md xl:text-base relative inline-block text-[#543c52] after:content-[''] after:absolute after:left-0 after:bottom-0 after:w-0 after:h-[2px] after:bg-[#543c52] after:transition-all after:duration-300 hover:after:w-full"
            >
              Улюблені тури
            </NavLink>
          </li>
          <li>
            <NavLink
              to="booking"
              className="text-md xl:text-base relative inline-block text-[#543c52] after:content-[''] after:absolute after:left-0 after:bottom-0 after:w-0 after:h-[2px] after:bg-[#543c52] after:transition-all after:duration-300 hover:after:w-full"
            >
              Бронювання
            </NavLink>
          </li>
        </ul>
      </div>
      <div>
        <Outlet />
      </div>
    </>
  );
};

export default CabinetLayout;
