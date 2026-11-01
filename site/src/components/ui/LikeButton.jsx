import { FaHeart, FaRegHeart } from "react-icons/fa";
import { useSelector } from 'react-redux';

const LikeButton = ({ liked, onClick, tour, disabled = false }) => {

  const { isLoggedIn } = useSelector((state) => state.auth);

  const handleClick = (e) => {
    e.preventDefault();
    if (!disabled && isLoggedIn) {
      if (liked) {
        const isSure = confirm("Ви впевнені, що хочете видалити тур з улюблених?");
        if (isSure) onClick(tour);
      } else {
        onClick(tour);
      }
    } else if (!isLoggedIn) {
      alert('Будь ласка, увійдіть до системи, щоб додавати тури до улюблених');
    }
  };  

  return (
    <button
      className={`bg-white p-2 rounded-full shadow-md tooltip ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      data-tooltip={isLoggedIn ? 
        (liked ? "Видалити з улюблених" : "Додати до улюблених") :  "Увійдіть, щоб додати до улюблених"}
      onClick={handleClick}
      disabled={disabled}
      aria-label={liked ? "Видалити з улюблених" : "Додати до улюблених"}
    >
      {liked ? ( <FaHeart className="text-[#f55951]" /> ) : ( <FaRegHeart className="text-[#543c52]" />)}
    </button>
  );
};

export default LikeButton;
