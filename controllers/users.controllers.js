const User = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const getUserLogin = async (req, res) => {
    console.log("login request!");
    try {
        const { email, password } = req.body;
        console.log(email, password);
        let user = await User.findOne({ email });
        if (user) {
            console.log(user);
            const validPassword = await bcrypt.compare(password, user.password);
            if (validPassword) {
                console.log(validPassword);
                const token = jwt.sign(
                    { userId: user._id },
                    process.env.SECRET,
                    { expiresIn: "1h" }
                );
                console.log(token);
                return res.status(200).json({
                    success: true,
                    name: user.name,
                    email: user.email,
                    token: token,
                });
            }
            console.log("user password");
            res.status(200).json({
                success: false,
                message: "Wrong Credential",
            });
        } else {
            console.log("user not found");
            res.status(401).json({
                success: true,
                message: "User Not Found!",
            });
        }
    } catch (err) {
        res.status(400).json({
            success: false,
            message: "Couldn't Login",
        });
    }
};

const createNewUser = async (req, res) => {
    try {
        const body = req.body;
        const userFound = await User.findOne({ email: body.email });
        if (userFound) {
            return res.status(409).json({
                success: true,
                error: "User Already Exists With the Email!",
            });
        }
        const newUser = new User(body);

        const salt = await bcrypt.genSalt(10);
        const hashPassword = await bcrypt.hash(newUser.password, salt);
        newUser.password = hashPassword;
        const createdUser = await newUser.save();

        res.status(200).json({
            success: true,
            user: createdUser,
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: "Couldn't Create New User",
            errorMessage: err.message,
        });
    }
};

const getUserDetails = async (req, res) => {
    try {
        const user = req.user;
        res.status(200).json({
            success: true,
            user,
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: "Couldn't Find User With the Given Id",
        });
    }
};

module.exports = {
    getUserLogin,
    createNewUser,
    getUserDetails,
};
