import { formatPrice } from '../../utils/utils'

const FormattedPrice = ({tour}) => {
  return (
    <>
        {tour.promotion ? (
            <div className={`text-[#f55951]  font-bold}`}>
            <small className="line-through text-lg font-extralight">{formatPrice(tour.price)} грн</small> {formatPrice(tour.price_promotion)} грн
            </div>
        ) : (
            <div className="text-[#f55951]  font-bold">{formatPrice(tour.price)} грн</div>
        )}
    </>
  )
}

export default FormattedPrice
