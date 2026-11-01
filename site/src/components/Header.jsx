import { memo, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { IoMdMenu } from 'react-icons/io';
import logo from '../assets/Logo .webp';
import { logoutUser } from '../features/authentication/authSlice';
import HeaderTabs from './header/HeaderTabs';
import '../App.css';

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dispatch = useDispatch();
  const { user, isLoggedIn } = useSelector((state) => state.auth);
  const handleLogout = () => dispatch(logoutUser());

  return (
    <header className="sticky top-0 left-0 w-full bg-white shadow-md z-50">
      <nav className="flex justify-between items-center w-[92%] mx-auto">
        <div>
          <a href="#">
            <img className="w-[140px] md:w-[160px]" src={logo} alt="" />
          </a>
        </div>

        <div
          className={`nav-links absolute bg-white w-full left-0 transition-all duration-300 ease-in-out ${
            isOpen ? 'top-[100%] opacity-100' : 'top-[-1000%] opacity-0'
          } lg:static lg:w-auto lg:flex lg:items-center lg:opacity-100 lg:top-0 lg:min-h-fit px-5`}
        >
          <ul className="flex lg:flex-row flex-col lg:items-center lg:gap-[4vw] gap-5 lg:gap-8">
            <li>
              <NavLink
                to="/"
                className="text-md xl:text-base relative inline-block text-[#543c52] after:content-[''] after:absolute after:left-0 after:bottom-0 after:w-0 after:h-[2px] after:bg-[#543c52] after:transition-all after:duration-300 hover:after:w-full"
              >
                Головна
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/alltours"
                className="text-md xl:text-base relative inline-block text-[#543c52] after:content-[''] after:absolute after:left-0 after:bottom-0 after:w-0 after:h-[2px] after:bg-[#543c52] after:transition-all after:duration-300 hover:after:w-full"
              >
                Пошук
              </NavLink>
            </li>
            {isLoggedIn && (
              <li>
                <NavLink
                  to="/cabinet"
                  className="text-md xl:text-base relative inline-block text-[#543c52] after:content-[''] after:absolute after:left-0 after:bottom-0 after:w-0 after:h-[2px] after:bg-[#543c52] after:transition-all after:duration-300 hover:after:w-full"
                >
                  Кабінет
                </NavLink>
              </li>
            )}
            <li>
              <HeaderTabs isOpen={isOpen} />
            </li>
          </ul>

          <div className="flex items-center gap-6 lg:hidden mb-8">
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
          ) : (
            <>
              <Link className="bg-[#f1e8e6] text-sm text-[#543c52] px-4 py-2 rounded-full hover:bg-[#edd2cb] lg:block hidden" to="/login">
                Log in
              </Link>
              <Link className="bg-[#543c52] text-sm text-[#f1e8e6] px-4 py-2 rounded-full hover:bg-[#361d32] lg:block hidden" to="/register">
                Sign up
              </Link>
            </>
          )}
          <button
            onClick={() => setIsOpen((open) => !open)}
            className="lg:hidden cursor-pointer right-20px"
          >
            <IoMdMenu size={24} color="#543c52" />
          </button>
        </div>
      </nav>
    </header>
  );
};

export default memo(Header);
