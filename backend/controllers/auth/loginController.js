import { comparePassword } from "../../helper/authHelper.js";
import userModel from "../../models/userModel.js";
import JWT from "jsonwebtoken";

// POST LOGIN
export const loginController = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Checking the EMAIL and PASSWORD
        if (!email || !password) {
            console.log("Login attempt with missing email or password.");
            return res.status(401).send({
                success: false,
                message: "Invalid username or password",
                errorType: "invalidCredentials",
            });
        }

        // FINDING THE USER
        const user = await userModel.findOne({ email });
        if (!user) {
            console.log(`Login failed. User not found for email: ${email}`);
            return res.status(401).send({
                success: false,
                message: "User Not Registered!",
                errorType: "invalidUser",
            });
        }

        // IF USER EXISTS - CHECKING THE PASSWORD
        const match = await comparePassword(password, user.password);
        if (!match) {
            console.log(`Login failed. Incorrect password for user: ${email}`);
            return res.status(401).send({
                success: false,
                message: "Invalid Password!",
                errorType: "invalidPassword",
            });
        }

        // TOKEN
        const token = await JWT.sign(
            { _id: user._id },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        // Log the token in the console
        console.log("JWT Generated:", token);

        // SUCCESS RESPONSE
        res.status(200).send({
            success: true,
            message: "Logged in Successfully!",
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                address: user.address,
                role: user.role,
            },
            token,
        });
    } catch (error) {
        console.log("Login error: " + error);
        res.status(500).send({
            success: false,
            message: "Error in Login",
            error,
        });
    }
};
