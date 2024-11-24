import { useEffect, useState } from "react";
import authImg from "../../assets/images/auth.png";
import axios from "axios";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { AiFillEyeInvisible, AiFillEye } from "react-icons/ai";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useAuth } from "../../context/auth";
import Spinner from "../../components/Spinner";
import Cookies from "js-cookie";
import SeoData from "../../SEO/SeoData";
import { Formik, Field, Form, ErrorMessage } from "formik";
import * as Yup from "yup";

const Login = () => {
    const { auth, setAuth, isAdmin } = useAuth();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();

    // Effect to redirect if already logged in
    useEffect(() => {
        if (auth.token) {
            isAdmin ? navigate("/admin/dashboard") : navigate("/user/dashboard");
        }
    }, [navigate, auth, isAdmin]);

    // Form validation schema using Yup
    const validationSchema = Yup.object({
        email: Yup.string()
            .email("Invalid email address")
            .required("Email is required"),
        password: Yup.string()
            .min(5, "Password must be at least 5 characters")
            .required("Password is required"),
    });

    const handleFormSubmit = async (values) => {
        setIsSubmitting(true);
        try {
            toast("The backend is starting up, please wait for a minute if the loader is visible.");

            const response = await axios.post(
                `${import.meta.env.VITE_SERVER_URL}/api/v1/auth/login`,
                values
            );

            if (response.status === 200) {
                toast.success("Logged in Successfully!");

                setAuth({
                    ...auth,
                    user: response.data.user,
                    token: response.data.token,
                });

                // Save token and user to localStorage
                localStorage.setItem("token", response.data.token);
                localStorage.setItem("user", JSON.stringify(response.data.user));
                Cookies.set("auth", JSON.stringify(response.data), {
                    expires: 7,
                });

                navigate(location.state || "/");
            }
        } catch (error) {
            console.error("Error:", error);
            if (error.response?.status === 401) {
                if (error.response.data?.errorType === "invalidPassword") {
                    toast.error("Wrong password!");
                } else if (error.response.data?.errorType === "invalidUser") {
                    toast.error("User not Registered!");
                }
            } else if (error.response?.status === 500) {
                toast.error("Something went wrong! Please try after sometime.");
                navigate("/login");
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            <SeoData title="Log in - Existing User" description="Log in with user details" />
            {isSubmitting ? (
                <Spinner />
            ) : (
                <div className="container bg-primaryBg mt-5 sm:mt-0 md:mt-0 lg:mt-0 py-[2px]">
                    <div className="flex items-center flex-col sm:flex-row md:flow-row lg:flex-row my-10 mx-auto w-full sm:w-[70vw] md:w-[70vw] lg:w-[70vw] min-h-[400px] md:h-[80vh] lg:h-[80vh] bg-white shadow-[0px_0px_8px_2px_rgba(212,212,212,0.6)] ">
                        {/* sign up form */}
                        <div className="p-10 w-full h-full sm:w-[60%] md:w-[60%] lg:w-[60%] flex flex-col gap-y-10 ">
                            <Formik
                                initialValues={{ email: "", password: "" }}
                                validationSchema={validationSchema}
                                onSubmit={handleFormSubmit}
                            >
                                {({ values, handleChange, handleBlur, errors, touched }) => (
                                    <Form className="w-[90%] mx-auto transition-all">
                                        <div className="text-base leading-6 space-y-4 text-gray-700 sm:text-lg sm:leading-7 pt-3 ">
                                            <div className="relative">
                                                <Field
                                                    type="email"
                                                    name="email"
                                                    value={values.email}
                                                    onChange={handleChange}
                                                    onBlur={handleBlur}
                                                    className="peer placeholder-transparent h-8 w-full border-b-2 text-gray-900 text-sm focus:outline-none focus:border-blue-400"
                                                    placeholder="Email address"
                                                />
                                                <label
                                                    htmlFor="email"
                                                    className="absolute left-0 -top-3 text-gray-600 text-xs peer-placeholder-shown:text-sm peer-placeholder-shown:text-gray-440 peer-placeholder-shown:top-2 transition-all peer-focus:-top-3 peer-focus:text-gray-600 peer-focus:text-xs"
                                                >
                                                    Email Address
                                                </label>
                                                <ErrorMessage
                                                    name="email"
                                                    component="div"
                                                    className="text-xs text-red-600"
                                                />
                                            </div>

                                            <div className="relative">
                                                <Field
                                                    type="password"
                                                    name="password"
                                                    value={values.password}
                                                    onChange={handleChange}
                                                    onBlur={handleBlur}
                                                    className="peer placeholder-transparent h-8 w-full border-b-2 focus:border-blue-400 text-gray-900 focus:outline-none text-sm"
                                                    placeholder="Password"
                                                />
                                                <label
                                                    htmlFor="password"
                                                    className="absolute left-0 -top-3 text-gray-600 text-xs peer-placeholder-shown:text-sm peer-placeholder-shown:text-gray-440 peer-placeholder-shown:top-2 transition-all peer-focus:-top-3 peer-focus:text-gray-600 peer-focus:text-xs"
                                                >
                                                    Password
                                                </label>
                                                <ErrorMessage
                                                    name="password"
                                                    component="div"
                                                    className="text-xs text-red-600"
                                                />
                                            </div>

                                            <div className="text-[9px] text-slate-500 ">
                                                <p>
                                                    By continuing, you agree to ActiveAttire&apos;s Terms of Use and
                                                    Privacy Policy.
                                                </p>
                                            </div>

                                            <div className="relative flex flex-col">
                                                <button
                                                    type="submit"
                                                    className="bg-orange uppercase text-white text-[14px] font-[500] rounded-sm px-2 py-1"
                                                >
                                                    Log in
                                                </button>
                                            </div>
                                        </div>
                                    </Form>
                                )}
                            </Formik>

                            <div className="relative -mt-7 w-full text-center">
                                <Link to="/forgot-password" className=" text-primaryBlue font-[500] text-[12px] ">
                                    Forgot Password ?
                                </Link>
                            </div>
                            <div className="relative mt-4 w-full text-center">
                                <Link to="/register" className=" text-primaryBlue font-[500] text-[12px] ">
                                    New to ActiveAttire? Create an account
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default Login;
