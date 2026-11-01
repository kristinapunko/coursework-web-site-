const CountOfPeople = ({tour}) => {
  return (
    <p className="text-[#543c52] text-sm sm:text-md">
        Ціна за тур {tour.adults === 1 ? `${tour.adults} дорослий` : `${tour.adults} дорослих`}{" "}
        {tour.children > 0 && (tour.children === 1 ? `${tour.children} дитина` : `${tour.children} дітей`)}
    </p>
  )
}

export default CountOfPeople
