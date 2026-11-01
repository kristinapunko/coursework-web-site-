import { calculateDaysAndNights, normalizeStringList } from '../../utils/utils';

const ServiceList = ({ title, values }) => (
  <div className="mt-4 p-4 sm:mt-6 sm:p-6 rounded-lg">
    <h3 className="text-2xl sm:text-3xl font-semibold text-[#543c52] mb-4 sm:mb-8">{title}</h3>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-2">
      {normalizeStringList(values).map((value, index) => (
        <div key={index} className="flex items-center space-x-2 border border-[#361d32]/50 p-3 rounded-lg shadow-xl">
          <span>{value.charAt(0).toUpperCase() + value.slice(1)}</span>
        </div>
      ))}
    </div>
  </div>
);

const TourContent = ({ tour, details }) => (
  <>
    <div className="mt-4 p-4 sm:mt-6 sm:p-6 rounded-lg shadow-xl">
      <h3 className="text-2xl sm:text-3xl font-semibold text-[#543c52] mb-2">Програма туру</h3>
      <h2 className="text-sm sm:text-md font-semibold text-[#543c52] mb-4">
        Тур на {calculateDaysAndNights(tour.start_date, tour.end_date)}.
      </h2>
      <div className="ml-6">
        {String(details.program ?? '').split('\n').map((line, index) => {
          const trimmedLine = line.trim();
          return trimmedLine.startsWith('День') ? (
            <h2 key={index} className="text-md font-semibold text-[#543c52] my-4 underline">
              {trimmedLine}
            </h2>
          ) : (
            <p key={index} className="text-[#543c52] ml-3">{trimmedLine}</p>
          );
        })}
      </div>
    </div>

    <ServiceList title="Що входить в тур" values={details.services} />
    <ServiceList title="Що не входить в тур" values={details.noservices} />
  </>
);

export default TourContent;
