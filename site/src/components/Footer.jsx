import { FaFacebookF, FaInstagram, FaYoutube, FaTelegram, FaTiktok } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { resetFilters as resetMainFilters, setFilters } from "../features/tours/toursSlice";
import { resetFilters as resetDetailsFilters, setFilters as setFiltersDetails } from "../features/tours/tourDetailsSlice";

const footerSections = [
  {
    title: "Куди поїхати",
    links: [
      { text: "Країни", to: "/alltours" },
      { text: "Гарячі тури", to: "/alltours", filters: { main: { hotTours: true } } },
      { text: "Автобусні тури", to: "/alltours", filters: { main: { transport: "Автобус" } } },
    ],
  },
  {
    title: "Види відпочинку",
    links: [
      { text: "Відпочинок на морі", to: "/alltours", filters: { details: { thematicFilter: "beach_tour" } } },
      { text: "Гастрономічні тури", to: "/alltours", filters: { details: { thematicFilter: "gastronomic_tour" } } },
      { text: "Відпочинок із дітьми", to: "/alltours", filters: { main: { hasChildren: true } } },
    ],
  },
  {
    title: "Про компанію",
    links: [
      { text: "Про нас", to: "/aboutus" },
      { text: "Написати відгук", to: "/reviews" },
    ],
  },
  {
    title: "Туристу",
    links: [
      { text: "Акційні тури", to: "/alltours", filters: { main: { promotion: true } } },
      { text: "Преміум тури", to: "/alltours", filters: { main: { premiumTours: true } } },
    ],
  },
];

// Конфігурація соціальних мереж
const socialIcons = [
  { Icon: FaFacebookF, key: "facebook" },
  { Icon: FaInstagram, key: "instagram" },
  { Icon: FaYoutube, key: "youtube" },
  { Icon: FaTelegram, key: "telegram" },
  { Icon: FaTiktok, key: "tiktok" },
];

const Footer = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleLinkClick = (filters, to) => {
    dispatch(resetMainFilters());
    dispatch(resetDetailsFilters());
    if (filters?.main) dispatch(setFilters(filters.main));
    if (filters?.details) dispatch(setFiltersDetails(filters.details));
    navigate(to);
  };

  const FooterLink = ({ text, to, filters }) => (
    <Link
      to={to}
      onClick={() => handleLinkClick(filters, to)}
      className="block text-[#edd2cb] hover:text-[#f55951] duration-300 text-sm cursor-pointer leading-6"
    >
      {text}
    </Link>
  );

  const SocialIcon = ({ Icon }) => (
    <span className="p-2 cursor-pointer inline-flex items-center rounded-full bg-[#f1e8e6] mx-1.5 text-xl hover:text-[#361d32] hover:bg-[#edd2cb] duration-300">
      <Icon />
    </span>
  );

  return (
    <footer className="bg-[#361d32] text-[#f1e8e6]">
      <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-6 sm:px-8 px-5 py-5 md:py-16">
        {footerSections.map((section) => (
          <ul key={section.title}>
            <h1 className="mb-1 font-semibold">{section.title}</h1>
            {section.links.map((link) => (
              <FooterLink
                key={link.text}
                text={link.text}
                to={link.to}
                filters={link.filters}
              />
            ))}
          </ul>
        ))}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 md:gap-10 text-center md:pt-2 text-sm pb-4 md:pb-8">
        <span>© 2025 Всі права захищено.</span>
        <span>Туристична агенція</span>
        <div className="text-[#f55951]">
          {socialIcons.map(({ Icon, key }) => (
            <SocialIcon key={key} Icon={Icon} />
          ))}
        </div>
      </div>
    </footer>
  );
};

export default Footer;