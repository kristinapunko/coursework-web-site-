import { useNavigate } from 'react-router-dom';
import { FaHome, FaSadCry } from 'react-icons/fa';

const NotFound = () => {
    const navigate = useNavigate();
    
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-white to-[#f1e8e6] p-4">
            <div className="text-center max-w-md mx-auto">
                <div className="text-8xl mb-6 animate-bounce">
                    <FaSadCry className="inline-block text-[#543c52]" />
                </div>
                <h1 className="text-9xl font-bold text-[#f55951] mb-4">404</h1>
                <h2 className="text-2xl font-semibold text-[#361d32] mb-6">
                    Сторінку не знайдено
                </h2>               
                <p className="text-[#361d32] mb-8">
                    Схоже, що подорож, яку ви шукаєте, не існує або була переміщена.
                    Спробуйте повернутись на головну сторінку та почати знову.
                </p>
                <button
                    onClick={() => navigate('/')}
                    className="bg-[#543c52] text-[#f1e8e6] hover:bg-[#361d32] font-medium py-3 px-6 rounded-full shadow-md transition duration-300 flex items-center justify-center mx-auto"
                >
                    <FaHome className="mr-2" />
                    На головну сторінку
                </button>
            </div>
        </div>
    );
};

export default NotFound;
