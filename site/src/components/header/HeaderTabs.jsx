import { useCallback, useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { FiChevronDown } from 'react-icons/fi';
import { CountriesMenu, HotToursMenu, TourFiltersMenu } from './HeaderTourMenus';

const TABS = [
  { title: 'Гарячі тури', Component: HotToursMenu },
  { title: 'Країни', Component: CountriesMenu },
  { title: 'Фільтрувати', Component: TourFiltersMenu },
].map((tab, index) => ({ ...tab, id: index + 1 }));

const TabButton = ({ children, tab, handleSetSelected, selected }) => (
  <button
    id={`shift-tab-${tab}`}
    onMouseEnter={() => handleSetSelected(tab)}
    onClick={() => handleSetSelected(tab)}
    className={`flex items-center gap-1 rounded-full text-md ${
      selected === tab
        ? "relative inline-block text-[#543c52] after:content-[''] after:absolute after:left-0 after:bottom-0 after:w-0 after:h-[2px] after:bg-[#543c52] after:transition-all after:duration-300 hover:after:w-full"
        : 'text-[#543c52]'
    }`}
  >
    <span>{children}</span>
    <FiChevronDown className={`transition-transform ${selected === tab ? 'rotate-180' : ''}`} />
  </button>
);

const DropdownPointer = ({ selected }) => {
  const [left, setLeft] = useState(0);

  const movePointer = useCallback(() => {
    if (!selected) return;

    const hoveredTab = document.getElementById(`shift-tab-${selected}`);
    const overlayContent = document.getElementById('overlay-content');
    if (!hoveredTab || !overlayContent) return;

    const tabRect = hoveredTab.getBoundingClientRect();
    const { left: contentLeft } = overlayContent.getBoundingClientRect();
    setLeft(tabRect.left + tabRect.width / 2 - contentLeft);
  }, [selected]);

  useEffect(() => {
    movePointer();
    window.addEventListener('resize', movePointer);
    return () => window.removeEventListener('resize', movePointer);
  }, [movePointer]);

  return (
    <motion.span
      style={{ clipPath: 'polygon(0 0, 100% 0, 50% 50%, 0% 100%)' }}
      animate={{ left }}
      transition={{ duration: 0.25, ease: 'easeInOut' }}
      className="absolute z-40 left-1/2 top-0 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rotate-45 rounded-tl border border-[#361d32] bg-[#543c52]"
    />
  );
};

const DesktopDropdown = ({ selected, direction }) => (
  <motion.div
    id="overlay-content"
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: 8 }}
    className="absolute left-0 tabs-container z-20 top-[calc(100%_+_24px)] w-96 rounded-lg border bg-white border-[#361d32] p-4"
  >
    <div className="absolute -top-[24px] left-0 right-0 h-[24px]" />
    <DropdownPointer selected={selected} />

    {TABS.map(({ id, Component }) => (
      <div className="overflow-hidden" key={id}>
        {selected === id && (
          <motion.div
            initial={{ opacity: 0, x: direction === 'l' ? 100 : direction === 'r' ? -100 : 0 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
          >
            <Component />
          </motion.div>
        )}
      </div>
    ))}
  </motion.div>
);

const HeaderTabs = ({ isOpen }) => {
  const [selected, setSelected] = useState(null);
  const [direction, setDirection] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleSetSelected = (value) => {
    if (typeof selected === 'number' && typeof value === 'number') {
      setDirection(selected > value ? 'r' : 'l');
    } else if (value === null) {
      setDirection(null);
    }
    setSelected(value);
  };

  const toggleTab = (id) => {
    setSelected((current) => (current === id ? null : id));
  };

  return (
    <div
      onMouseLeave={() => handleSetSelected(null)}
      className={isOpen ? 'block' : 'relative flex h-fit gap-8 text-sm xl:text-base'}
    >
      {TABS.map(({ id, title, Component }) => (
        <div key={id} className="relative">
          {isOpen && isMobile ? (
            <div className="pb-6">
              <button
                onClick={() => toggleTab(id)}
                className="relative inline-block text-[#543c52] after:content-[''] after:absolute after:left-0 after:bottom-0 after:w-0 after:h-[2px] after:bg-[#543c52] after:transition-all after:duration-300 hover:after:w-full"
              >
                {title}
              </button>
              <AnimatePresence>
                {selected === id && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="mt-2 pt-2 bg-white p-2"
                  >
                    <Component />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <TabButton selected={selected} handleSetSelected={handleSetSelected} tab={id}>
              {title}
            </TabButton>
          )}
        </div>
      ))}

      {!isOpen && (
        <AnimatePresence>
          {selected && <DesktopDropdown direction={direction} selected={selected} />}
        </AnimatePresence>
      )}
    </div>
  );
};

export default HeaderTabs;
