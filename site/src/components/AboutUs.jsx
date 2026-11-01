import { FaPlaneDeparture, FaDatabase } from "react-icons/fa";
import { IoIosPricetags } from "react-icons/io";
import { IoStatsChartSharp, IoTicket} from "react-icons/io5";
import { MdOutlineRateReview } from "react-icons/md";

const GridComponent = () => {
  return (
    <>
      <div className="relative w-[90vw] xl:w-[80vw] mx-auto">

        <div className="relative z-10 bg-[#f1e8e6]/50 p-6 rounded-xl shadow-lg flex justify-around">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-6xl">
          <div className=" border border-[#361d32] rounded-xl p-6 m-x-6 md:m-x-20 flex items-center text-[#361d32]">
              <FaPlaneDeparture className="text-3xl mr-4" />
              Тури в 62 126 готелів світу
            </div>

            <div className=" border border-[#361d32] rounded-xl p-6 m-x-6 md:m-x-20 flex items-center text-[#361d32]">
              <IoIosPricetags className="text-3xl mr-4" />
              Актуальні ціни в реальному часі
            </div>

            <div className=" border border-[#361d32] rounded-xl p-6 m-x-6 md:m-x-20 flex items-center text-[#361d32]">
              <IoTicket className="text-3xl mr-4" />
              Продаємо тільки перевірені готелі
            </div>

            <div className=" border border-[#361d32] rounded-xl p-6 m-x-6 md:m-x-20 flex items-center text-[#361d32]">
              <IoStatsChartSharp className="text-3xl mr-4" />
              Гарантія кращого співвідношення ціни і якості
            </div>

            <div className=" border border-[#361d32] rounded-xl p-6 m-x-6 md:m-x-20 flex items-center text-[#361d32]">
              <MdOutlineRateReview className="text-3xl mr-4" />
              Багато позитивних відгуків
            </div>

            <div className=" border border-[#361d32] rounded-xl p-6 m-x-6 md:m-x-20 flex items-center text-[#361d32]">
              <FaDatabase className="text-3xl mr-4" />
              Велика клієнтська база
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default GridComponent;
