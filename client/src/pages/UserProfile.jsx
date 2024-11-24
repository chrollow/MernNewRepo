import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/auth";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Formik, Field, Form, ErrorMessage } from "formik";
import * as Yup from "yup";

const UserProfile = () => {
  const { auth, setAuth } = useAuth();
  const [profile, setProfile] = useState(false);
  const [emailSection, setEmailSection] = useState(false);
  const [phoneSection, setPhoneSection] = useState(false);

  const handleProfile = () => setProfile(!profile);
  const handleEmail = () => setEmailSection(!emailSection);
  const handlePhone = () => setPhoneSection(!phoneSection);

  const nameValidationSchema = Yup.object().shape({
    name: Yup.string().required("Name is required"),
  });

  const emailValidationSchema = Yup.object().shape({
    email: Yup.string()
      .email("Invalid email address")
      .required("Email is required"),
  });

  const phoneValidationSchema = Yup.object().shape({
    phone: Yup.string()
      .matches(/^\d{10}$/, "Phone number must be 10 digits")
      .required("Phone number is required"),
  });

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_SERVER_URL}/api/v1/auth/update-details`,
        {
          newName: values.name,
          newEmail: values.email,
          newPhone: values.phone,
          email: auth?.user?.email,
        }
      );

      setAuth({
        ...auth,
        user: { ...auth.user, name: values.name, email: values.email, phone: values.phone },
      });

      localStorage.setItem("auth", JSON.stringify(response.data));
      toast.success(response.data.message);
      setSubmitting(false);
      resetForm();
    } catch (error) {
      console.error(error);
      setSubmitting(false);
      toast.error("Something went wrong!");
    }
  };

  return (
    <div className="w-full">
      <div className="w-full flex flex-col items-start p-5 gap-10">
        {/* Name Section */}
        <div className="flex flex-col items-start gap-4">
          <div className="flex gap-5">
            <div className="font-[600] text-[16px]">Personal Information</div>
            <button className="text-[14px] text-primaryBlue font-[500]" onClick={handleProfile}>
              {!profile ? "Edit" : "Cancel"}
            </button>
          </div>
          {profile ? (
            <Formik
              initialValues={{ name: auth?.user?.name }}
              validationSchema={nameValidationSchema}
              onSubmit={handleSubmit}
            >
              {({ isSubmitting }) => (
                <Form className="flex gap-6 items-center">
                  <div className="border-2 p-2 flex flex-col max-h-[50px] min-h-[50px] w-[220px]">
                    <label htmlFor="name" className="text-[10px]">Name</label>
                    <Field
                      type="text"
                      id="name"
                      name="name"
                      className="text-[14px] focus:outline-none"
                    />
                    <ErrorMessage name="name" component="div" className="text-red-500 text-sm" />
                  </div>
                  <button
                    type="submit"
                    className="bg-primaryBlue text-white font-[600] w-[80px] h-[40px] px-4 py-2 rounded-sm"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Saving..." : "Save"}
                  </button>
                </Form>
              )}
            </Formik>
          ) : (
            <div className="border-2 p-2 w-[220px] min-h-[50px] text-slate-500">{auth?.user?.name}</div>
          )}
        </div>

        {/* Email Section */}
        <div className="flex flex-col items-start gap-4">
          <div className="flex gap-5">
            <div className="font-[600] text-[16px]">Email Address</div>
            <button className="text-[14px] text-primaryBlue font-[500]" onClick={handleEmail}>
              {!emailSection ? "Edit" : "Cancel"}
            </button>
          </div>
          {emailSection ? (
            <Formik
              initialValues={{ email: auth?.user?.email }}
              validationSchema={emailValidationSchema}
              onSubmit={handleSubmit}
            >
              {({ isSubmitting }) => (
                <Form className="flex gap-6">
                  <div className="border-2 p-2 w-[220px]">
                    <Field
                      type="email"
                      name="email"
                      className="border-2 p-2 w-[220px] focus:outline-primaryBlue focus:outline-1"
                    />
                    <ErrorMessage name="email" component="div" className="text-red-500 text-sm" />
                  </div>
                  <button
                    type="submit"
                    className="bg-primaryBlue text-white font-[600] w-[80px] h-[40px] px-4 py-2 rounded-sm"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Saving..." : "Save"}
                  </button>
                </Form>
              )}
            </Formik>
          ) : (
            <div className="border-2 p-2 w-[220px] text-slate-500">{auth?.user?.email}</div>
          )}
        </div>

        {/* Phone Section */}
        <div className="flex flex-col items-start gap-4">
          <div className="flex gap-5">
            <div className="font-[600] text-[16px]">Mobile Number</div>
            <button className="text-[14px] text-primaryBlue font-[500]" onClick={handlePhone}>
              {!phoneSection ? "Edit" : "Cancel"}
            </button>
          </div>
          {phoneSection ? (
            <Formik
              initialValues={{ phone: auth?.user?.phone }}
              validationSchema={phoneValidationSchema}
              onSubmit={handleSubmit}
            >
              {({ isSubmitting }) => (
                <Form className="flex gap-6">
                  <div className="border-2 p-2 w-[220px]">
                    <Field
                      type="tel"
                      name="phone"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      minLength="10"
                      maxLength="10"
                      className="border-2 p-2 w-[220px] focus:outline-primaryBlue focus:outline-1"
                    />
                    <ErrorMessage name="phone" component="div" className="text-red-500 text-sm" />
                  </div>
                  <button
                    type="submit"
                    className="bg-primaryBlue text-white font-[600] w-[80px] h-[40px] px-4 py-2 rounded-sm"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Saving..." : "Save"}
                  </button>
                </Form>
              )}
            </Formik>
          ) : (
            <div className="border-2 p-2 w-[220px] text-slate-500">{auth?.user?.phone}</div>
          )}
        </div>

        {/* FAQ Section */}
        <div>
          <h3 className="text-[16px] font-[600] mt-4">FAQs</h3>
          {/* FAQ content */}
        </div>

        {/* Deactivate Account */}
        <div className="text-[14px] text-primaryBlue font-[500] mt-4 -mb-4">
          <Link to="./deactivate">Deactivate Account</Link>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
