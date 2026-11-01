import { useNavigate, useRouteError } from 'react-router-dom';
import { FaHome, FaExclamationTriangle } from 'react-icons/fa';

const Error = () => {
    const error = useRouteError();
    const navigate = useNavigate();

    const errorMessage = error?.statusText || error?.message || 'Невідома помилка';
    const errorStatus = error?.status || null;

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-white to-[#f1e8e6] p-4">
            <div className="text-center max-w-md mx-auto bg-white p-8 rounded-xl shadow-lg">
                <div className="text-9xl text-[#f55951] mb-4">
                    <FaExclamationTriangle className="inline-block" />
                </div>
                <h1 className="text-3xl font-bold text-[#543c52] mb-4">
                    Виникла помилка
                </h1>

                <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 text-left">
                    <p className="text-red-700 font-medium">
                        {errorMessage}
                    </p>
                    {errorStatus && (
                        <p className="text-gray-600 text-sm mt-1">
                            Код помилки: {errorStatus}
                        </p>
                    )}
                </div>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button
                        onClick={() => navigate('/')}
                        className="bg-[#543c52] text-[#f1e8e6] hover:bg-[#361d32] font-medium py-3 px-6 rounded-full shadow-md transition duration-300 flex items-center justify-center mx-auto"
                    >
                        <FaHome className="mr-2" />
                        На головну
                    </button>
                    <button
                        onClick={() => window.location.reload()}
                        className="bg-[#f1e8e6] text-[#543c52] hover:bg-[#edd2cb] font-medium py-3 px-6 rounded-full shadow-md transition duration-300 flex items-center justify-center mx-auto"
                    >
                        Спробувати знову
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Error;
