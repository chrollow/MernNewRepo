import TextField from "@mui/material/TextField";
import { useState } from "react";
import DeleteIcon from "@mui/icons-material/Delete";
import MenuItem from "@mui/material/MenuItem";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import ImageIcon from "@mui/icons-material/Image";
import { categories } from "../../utils/constants";
import Spinner from "../../components/Spinner";
import axios from "axios";
import FormData from "form-data";
import { useAuth } from "../../context/auth";
import ScrollToTopOnRouteChange from "./../../utils/ScrollToTopOnRouteChange";
import SeoData from "../../SEO/SeoData";
import MUIDataTable from "mui-datatables";
import { Formik, Field, Form, ErrorMessage } from "formik";
import * as Yup from "yup";

const CreateProduct = () => {
    const { auth } = useAuth();
    const navigate = useNavigate();

    const [highlights, setHighlights] = useState([]);
    const [highlightInput, setHighlightInput] = useState("");
    const [specs, setSpecs] = useState([]);
    const [specsInput, setSpecsInput] = useState({
        title: "",
        description: "",
    });

    const [imagesPreview, setImagesPreview] = useState([]);
    const [logoPreview, setLogoPreview] = useState("");

    const [isSubmit, setIsSubmit] = useState(false);

    const MAX_IMAGE_SIZE = 500 * 1024;
    const MAX_IMAGES_COUNT = 4;

    const handleSpecsChange = (e) => {
        setSpecsInput({ ...specsInput, [e.target.name]: e.target.value });
    };

    const addSpecs = () => {
        if (!specsInput.title.trim() && !specsInput.description.trim()) return;
        setSpecs([...specs, specsInput]);
        setSpecsInput({ title: "", description: "" });
    };

    const addHighlight = () => {
        if (!highlightInput.trim()) return;
        setHighlights([...highlights, highlightInput]);
        setHighlightInput("");
    };

    const deleteHighlight = (index) => {
        setHighlights(highlights.filter((h, i) => i !== index));
    };

    const deleteSpec = (index) => {
        setSpecs(specs.filter((s, i) => i !== index));
    };

    const handleLogoChange = (e) => {
        const file = e.target.files[0];

        if (file.size > MAX_IMAGE_SIZE) {
            toast.warning("Logo image size exceeds 500 KB!");
            return;
        }
        const reader = new FileReader();

        reader.onload = () => {
            if (reader.readyState === 2) {
                setLogoPreview(reader.result);
            }
        };

        reader.readAsDataURL(file);
    };

    const handleProductImageChange = (e) => {
        const files = Array.from(e.target.files);
        if (files.length > MAX_IMAGES_COUNT) {
            toast.warning("You can only upload up to 4 images");
            return;
        }

        files.forEach((file) => {
            if (file.size > MAX_IMAGE_SIZE) {
                toast.warning("One of the product images exceeds 500 KB");
                return;
            }
            const reader = new FileReader();

            reader.onload = () => {
                if (reader.readyState === 2) {
                    setImagesPreview((oldImages) => [
                        ...oldImages,
                        reader.result,
                    ]);
                }
            };
            reader.readAsDataURL(file);
        });
    };

    const validationSchema = Yup.object({
        name: Yup.string().required("Product name is required"),
        description: Yup.string().required("Product description is required"),
        price: Yup.number().min(0, "Price cannot be negative").required("Price is required"),
        discountPrice: Yup.number().min(0, "Discount price cannot be negative").required("Discount price is required"),
        category: Yup.string().required("Category is required"),
        stock: Yup.number().min(0, "Stock cannot be negative").required("Stock is required"),
        warranty: Yup.string().required("Warranty is required"),
        brand: Yup.string().required("Brand name is required"),
    });

    const newProductSubmitHandler = async (values) => {
        window.scrollTo({ top: 0, behavior: "smooth" });
        setIsSubmit(true);
        try {
            if (!logoPreview) {
                toast.warning("Please Add Brand Logo");
                return;
            }
            if (specs.length <= 1) {
                toast.warning("Please Add Minimum 2 Specifications");
                return;
            }
            if (imagesPreview.length <= 0) {
                toast.warning("Please Add Product Images");
                return;
            }

            const formData = new FormData();
            formData.append("name", values.name);
            formData.append("description", values.description);
            formData.append("price", values.price);
            formData.append("discountPrice", values.discountPrice);
            formData.append("category", values.category);
            formData.append("stock", values.stock);
            formData.append("warranty", values.warranty);
            formData.append("brandName", values.brand);
            formData.append("logo", logoPreview);

            imagesPreview.forEach((image) => formData.append("images", image));
            highlights.forEach((h) => formData.append("highlights", h));
            specs.forEach((s) => formData.append("specifications", JSON.stringify(s)));

            const response = await axios.post(
                `${import.meta.env.VITE_SERVER_URL}/api/v1/product/new-product`,
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                        Authorization: auth?.token,
                    },
                }
            );

            response.status === 201 && toast.success("Product Added Successfully!");
            navigate("/admin/dashboard/all-products");
        } catch (error) {
            console.error("Error:", error);
            setIsSubmit(false);
            error.response.status === 500 && toast.error("Something went wrong! Please try after sometime.");
        }
    };

    return (
        <>
            <SeoData title="New Product | Flipkart" />
            <ScrollToTopOnRouteChange />

            {isSubmit ? (
                <div className="relative h-full">
                    <Spinner />
                </div>
            ) : (
                <Formik
                    initialValues={{
                        name: "",
                        description: "",
                        price: "",
                        discountPrice: "",
                        category: "",
                        stock: "",
                        warranty: "",
                        brand: "",
                    }}
                    validationSchema={validationSchema}
                    onSubmit={newProductSubmitHandler}
                >
                    {({ values, handleChange, handleBlur, errors, touched }) => (
                        <Form
                            encType="multipart/form-data"
                            className="flex flex-col w-full sm:flex-row bg-white rounded-lg shadow p-6"
                            id="mainForm"
                        >
                            {/* Left Column - Product Details */}
                            <div className="flex flex-col mx-auto py-2 gap-4 w-full sm:w-1/2">
                                <Field
                                    name="name"
                                    as={TextField}
                                    label="Name"
                                    variant="outlined"
                                    size="small"
                                    required
                                    value={values.name}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    error={touched.name && Boolean(errors.name)}
                                    helperText={touched.name && errors.name}
                                />
                                <Field
                                    name="description"
                                    as={TextField}
                                    label="Description"
                                    multiline
                                    rows={4}
                                    required
                                    variant="outlined"
                                    size="small"
                                    value={values.description}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    error={touched.description && Boolean(errors.description)}
                                    helperText={touched.description && errors.description}
                                />
                                <div className="flex gap-4 justify-between">
                                    <Field
                                        name="price"
                                        as={TextField}
                                        label="Price"
                                        type="number"
                                        variant="outlined"
                                        size="small"
                                        InputProps={{
                                            inputProps: { min: 0 },
                                        }}
                                        required
                                        value={values.price}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        error={touched.price && Boolean(errors.price)}
                                        helperText={touched.price && errors.price}
                                    />
                                    <Field
                                        name="discountPrice"
                                        as={TextField}
                                        label="Discount Price"
                                        type="number"
                                        variant="outlined"
                                        size="small"
                                        InputProps={{
                                            inputProps: { min: 0 },
                                        }}
                                        required
                                        value={values.discountPrice}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        error={touched.discountPrice && Boolean(errors.discountPrice)}
                                        helperText={touched.discountPrice && errors.discountPrice}
                                    />
                                </div>
                                <Field
                                    name="category"
                                    as={TextField}
                                    label="Category"
                                    select
                                    fullWidth
                                    variant="outlined"
                                    size="small"
                                    required
                                    value={values.category}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    error={touched.category && Boolean(errors.category)}
                                    helperText={touched.category && errors.category}
                                >
                                    {categories.map((el, i) => (
                                        <MenuItem key={i} value={el}>
                                            {el}
                                        </MenuItem>
                                    ))}
                                </Field>

                                <div className="flex gap-4 justify-between">
                                    <Field
                                        name="stock"
                                        as={TextField}
                                        label="Stock"
                                        type="number"
                                        variant="outlined"
                                        size="small"
                                        required
                                        value={values.stock}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        error={touched.stock && Boolean(errors.stock)}
                                        helperText={touched.stock && errors.stock}
                                    />
                                    <Field
                                        name="warranty"
                                        as={TextField}
                                        label="Warranty"
                                        variant="outlined"
                                        size="small"
                                        required
                                        value={values.warranty}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        error={touched.warranty && Boolean(errors.warranty)}
                                        helperText={touched.warranty && errors.warranty}
                                    />
                                </div>

                                <Field
                                    name="brand"
                                    as={TextField}
                                    label="Brand Name"
                                    variant="outlined"
                                    size="small"
                                    required
                                    value={values.brand}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    error={touched.brand && Boolean(errors.brand)}
                                    helperText={touched.brand && errors.brand}
                                />
                                {/* Highlight and Specifications */}
                                <div>
                                    <TextField
                                        label="Product Highlights"
                                        variant="outlined"
                                        size="small"
                                        value={highlightInput}
                                        onChange={(e) => setHighlightInput(e.target.value)}
                                    />
                                    <button
                                        type="button"
                                        onClick={addHighlight}
                                        className="py-1 px-3 bg-blue-500 text-white rounded mt-2"
                                    >
                                        Add Highlight
                                    </button>
                                    <ul>
                                        {highlights.map((highlight, index) => (
                                            <li key={index} className="flex justify-between items-center mt-2">
                                                {highlight}
                                                <DeleteIcon
                                                    onClick={() => deleteHighlight(index)}
                                                    className="cursor-pointer"
                                                />
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <div>
                                    <TextField
                                        label="Specification Title"
                                        variant="outlined"
                                        size="small"
                                        name="title"
                                        value={specsInput.title}
                                        onChange={handleSpecsChange}
                                    />
                                    <TextField
                                        label="Specification Description"
                                        variant="outlined"
                                        size="small"
                                        name="description"
                                        value={specsInput.description}
                                        onChange={handleSpecsChange}
                                    />
                                    <button
                                        type="button"
                                        onClick={addSpecs}
                                        className="py-1 px-3 bg-green-500 text-white rounded mt-2"
                                    >
                                        Add Specification
                                    </button>
                                    <ul>
                                        {specs.map((spec, index) => (
                                            <li key={index} className="flex justify-between items-center mt-2">
                                                {spec.title}: {spec.description}
                                                <DeleteIcon
                                                    onClick={() => deleteSpec(index)}
                                                    className="cursor-pointer"
                                                />
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                {/* Image Upload */}
                                <div>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleLogoChange}
                                        className="mt-4"
                                    />
                                    {logoPreview && (
                                        <img src={logoPreview} alt="Logo Preview" className="mt-4 w-32 h-32 object-contain" />
                                    )}

                                    <input
                                        type="file"
                                        accept="image/*"
                                        multiple
                                        onChange={handleProductImageChange}
                                        className="mt-4"
                                    />
                                    <div className="flex gap-2 mt-4">
                                        {imagesPreview.map((img, index) => (
                                            <img
                                                key={index}
                                                src={img}
                                                alt={`Preview ${index}`}
                                                className="w-16 h-16 object-contain"
                                            />
                                        ))}
                                    </div>
                                </div>

                                {/* Form Submit Button */}
                                <button
                                    type="submit"
                                    className="mt-6 py-2 px-4 bg-blue-600 text-white rounded"
                                >
                                    Create Product
                                </button>
                            </div>
                        </Form>
                    )}
                </Formik>
            )}
        </>
    );
};

export default CreateProduct;
