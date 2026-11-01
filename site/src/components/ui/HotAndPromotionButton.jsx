import {FaFireAlt } from "react-icons/fa";
import { MdDiscount } from "react-icons/md";

const HotAndPromotionButton = ({tour, containerClass = "" }) => {
  return (
    <>
    {tour.hot_deal ? (
        <div className={`${containerClass}`}>
          <button
            className="bg-white p-2 rounded-full shadow-md tooltip"
            data-tooltip="Гарячий тур"
          >
            <FaFireAlt className="text-[#543c52]" />
          </button>
        </div>
      ) : tour.promotion ? (
        <div className={`${containerClass}`}>
          <button
            className="bg-white p-2 rounded-full shadow-md tooltip"
            data-tooltip="Акція"
          >
            <MdDiscount className="text-[#543c52]" />
          </button>
        </div>
      ) : null}
    </>
  )
}

export default HotAndPromotionButton
