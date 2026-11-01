import { Link } from "react-router-dom";
import { BiUser } from "react-icons/bi";
import { AiOutlineUnlock, AiOutlineLock } from "react-icons/ai";
import { useDispatch } from 'react-redux';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../App.css';
import { registerUser } from "../features/authentication/authSlice";

const Register = () => {
  const navigate = useNavigate();
  const [passwordShown, setPasswordShown] = useState(false);
  const [confirmPasswordShown, setConfirmPasswordShown] = useState(false);

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password1: "",
    password2: ""
  });

  const [isLogging, setIsLogging] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);
  const [error, setError] = useState(null);

  const dispatch = useDispatch();
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
  
    if (formData.password1 !== formData.password2) {
      setError("Паролі не співпадають");
      return;
    }
  
    if (isLogging) return;
    setIsLogging(true);
  
    dispatch(registerUser(formData))
      .unwrap()
      .then(() => {
        setSuccessMessage("Успішна реєстрація");
        setFormData({
          username: "",
          email: "",
          password1: "",
          password2: ""
        });
        navigate('/');
      })
      .catch((err) => {
        const message = typeof err === 'string' ? err : err?.message || "Невідома помилка";
  
        if (message.includes("username")) {
          setError("Користувач із таким ім’ям вже існує");
        } else if (message.includes("email")) {
          setError("Цей email вже використовується");
        } else if (message.includes("password")) {
          setError("Пароль не відповідає вимогам");
        } else {
          setError("Сталася помилка під час реєстрації");
        }
      })
      .finally(() => {
        setIsLogging(false);
      });
  };
  
  const togglePasswordVisibility = () => {
            setPasswordShown(!passwordShown);
          };
      
      const toggleConfirmPasswordVisibility = () => {
        setConfirmPasswordShown(!confirmPasswordShown);
      };
    return (
        <div>
        <div className="bg-[#543c52]/50 border-[#edd2cb] rounded-2xl py-4 px-8 md:py-8 md:px-16 shadow-lg backdrop-blur-sm relative">
            <h1 className="text-3xl md:text-4xl text-white font-bold text-center mb-4 md:mb-8">Register</h1>
            {error && <p className="text-red-500 text-center text-lg">{error}</p>}
            {successMessage && <p className="text-green-500 text-center">{successMessage}</p>}
            <form onSubmit={handleSubmit}>
            <div className="relative  my-3 md:my-6">
                <input type="text" name="username" value={formData.username} className="block  w-full md:w-80 py-2.3 px-0 text-sm text-white bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:focus:border-[#f55951] focus:outline-none focus:ring-0 focus-text-white focus-border-[#f55951] peer" placeholder="" onChange={handleChange} />
                <label htmlFor="" className="absolute text-sm text-white duration-300 transform -translate-y-6 scale-75 -top-1  -z-10 origin-[0] peer-focus:left-0 peer-focus:text-[#f55951] peer-focus:dark:text-[#f55951] peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">Name</label>
                <BiUser className="absolute -top-1 right-4"/>
            </div>
            <div className="relative  my-7 ">
                <input type="email" name="email" value={formData.email} className="block  w-full md:w-80 py-2.3 px-0 text-sm text-white bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:focus:border-[#f55951] focus:outline-none focus:ring-0 focus-text-white focus-border-[#f55951] peer" placeholder=""  onChange={handleChange}/>
                <label htmlFor="" className="absolute text-sm text-white duration-300 transform -translate-y-6 scale-75 -top-1  -z-10 origin-[0] peer-focus:left-0 peer-focus:text-[#f55951] peer-focus:dark:text-[#f55951] peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">Your Email</label>
                <BiUser className="absolute -top-1 right-4"/>
            </div>
            <div className="relative my-7">
                <input type={passwordShown ? "text" : "password"} name="password1" value={formData.password1} className="block  w-full md:w-80 py-2.3 px-0 text-sm text-white bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:focus:border-[#f55951] focus:outline-none focus:ring-0 focus-text-white focus-border-blue-600 peer" placeholder=""  onChange={handleChange}/>
                <label htmlFor="" className="absolute text-sm text-white duration-300 transform -translate-y-6 scale-75 -top-1  -z-10 origin-[0] peer-focus:left-0 peer-focus:text-[#f55951] peer-focus:dark:text-[#f55951] peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">Your Password</label>
                <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="absolute -top-1 right-4"
                >
                    {passwordShown ? <AiOutlineLock /> : <AiOutlineUnlock />}
                </button>
            </div>
            <div className="relative my-4 md:my-7">
                <input type={confirmPasswordShown ? "text" : "password"} name="password2" value={formData.password2} className="block  w-full md:w-80 py-2.3 px-0 text-sm text-white bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:focus:border-[#f55951] focus:outline-none focus:ring-0 focus-text-white focus-border-[#f55951] peer" placeholder=""  onChange={handleChange}/>
                <label htmlFor="" className="absolute text-sm text-white duration-300 transform -translate-y-6 scale-75 -top-1  -z-10 origin-[0] peer-focus:left-0 peer-focus:text-[#f55951] peer-focus:dark:text-[#f55951] peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">Confirm Password</label>
                <button
                    type="button"
                    onClick={toggleConfirmPasswordVisibility}
                    className="absolute -top-1 right-4"
                >
                    {confirmPasswordShown ? <AiOutlineLock /> : <AiOutlineUnlock />}
                </button>
            </div>
            
            <button type="submit" disabled={isLogging} className="w-full mb-4 text-[18px] mt-4 md:mt-6 rounded-full bg-white text-[#543c52] hover:text-[#f55951] py-1 md:py-2 transition-colors duration-300" >Register</button>
            <div>
                <span className="m-4">Already Create an Account?<Link className="text-[#f55951]" to='/login'> Login</Link></span>
            </div>
            </form>
        </div>
    </div>
    )
};


export default Register;
