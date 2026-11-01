import { Link } from "react-router-dom";
import { BiUser } from "react-icons/bi";
import { AiOutlineUnlock, AiOutlineLock } from "react-icons/ai";
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import '../App.css';
import { loginUser } from "../features/authentication/authSlice";
import { useNavigate } from 'react-router-dom'

const Login = () => {
    const navigate = useNavigate();
    const [passwordShown, setPasswordShown] = useState(false);

    const [formData, setFormData] = useState({
        email: "",
        password: ""
    });
    const [isLoagin, setIsLoagin] = useState(false);
    const [successMessage, setSuccessMessage] = useState(null);
    const [error, setError] = useState(null);

    const dispatch = useDispatch();
    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        })
    }
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccessMessage(null);
    
        if (isLoagin) return;
        setIsLoagin(true);
    
        try {
            await dispatch(loginUser(formData)).unwrap();
            setError(null);
            setSuccessMessage("Успішний вхід");
            setFormData({ email: "", password: "" });
            navigate('/');
        } catch (err) {
            const message = typeof err === 'string' ? err : err?.message || "Невідома помилка";
    
            if (message.includes("username")) {
                setError("Користувач із таким ім’ям вже існує");
            } else if (message.includes("email")) {
                setError("Цей email вже використовується");
            } else if (message.includes("password")) {
                setError("Пароль не відповідає вимогам");
            } else {
                setError(message || "Сталася помилка під час входу");
            }
        } finally {
            setIsLoagin(false);
        }
    };
    
  
    const togglePasswordVisibility = () => {
        setPasswordShown(!passwordShown);
    };
    return (
        <div>
            <div className="bg-[#543c52]/50 border-[#edd2cb] rounded-2xl mx-6 py-8 px-8 md:px-16 shadow-lg backdrop-blur-sm relative">
                <h1 className="text-3xl md:text-4xl text-white font-bold text-center mb-4 md:mb-8">Login</h1>
                {error && <p className="text-red-500 text-lg text-center">{error}</p>} 
                {successMessage && <p className="text-green-500 text-center ">{successMessage}</p>} 
                <form onSubmit={handleSubmit}> 
                    <div className="relative  my-3 md:my-6">
                        <input type="email" name="email" value={formData.email} autoComplete="email"  
    id="email-input"  
    required  onChange={handleChange} className="block w-full md:w-80 py-2.3 px-0 text-sm text-white bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:focus:border-[#f55951] focus:outline-none focus:ring-0 focus-text-white focus-border-[#f55951] peer" placeholder="" />
                        <label htmlFor="" className="absolute text-sm text-white duration-300 transform -translate-y-6 scale-75 -top-1  -z-10 origin-[0] peer-focus:left-0 peer-focus:text-[#f55951] peer-focus:dark:text-[#f55951] peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">Your Email</label>
                        <BiUser className="absolute -top-1 right-4" />
                    </div>
                    
                    <div className="relative my-7">
                        <input type={passwordShown ? "text" : "password"} name="password" value={formData.password} onChange={handleChange} className="block  w-full md:w-80 py-2.3 px-0 text-sm text-white bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:focus:border-[#f55951] focus:outline-none focus:ring-0 focus-text-white focus-border-[#f55951] peer" placeholder="" />
                        <label htmlFor="" className="absolute text-sm text-white duration-300 transform -translate-y-6 scale-75 -top-1  -z-10 origin-[0] peer-focus:left-0 peer-focus:text-[#f55951] peer-focus:dark:text-[#f55951] peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">Your Password</label>
                        <button
                            type="button"
                            onClick={togglePasswordVisibility}
                            className="absolute -top-1 right-4"
                        >
                            {passwordShown ? <AiOutlineLock /> : <AiOutlineUnlock />}
                        </button>
                    </div>
                    <span className="m-4">Повенрутися на <button onClick={()=>navigate('/')} className="text-[#f55951]" >головну сторінку</button></span>
                
                    <button disabled={isLoagin} className="w-full mb-4 text-[18px] mt-4 md:mt-6 rounded-full bg-white text-[#543c52] hover:text-[#f55951] py-1 md:py-2 transition-colors duration-300" type="submit">Login</button>
                    <div>
                        <span className="m-4">New Here? <Link className="text-[#f55951]" to='/register'>Create an Account</Link></span>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default Login;
