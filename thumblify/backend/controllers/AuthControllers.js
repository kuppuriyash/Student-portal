import UserModel from "../models/User.js";
import bcrypt from "bcrypt";

export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" })
    }

    const user = await UserModel.findOne({ email })

    if (user) {
      return res.status(400).json({ message: "User already exists" })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const newUser = await UserModel.create({ name, email, password: hashedPassword })
    await newUser.save()

    //setting user data in session
    req.session.isLoggedIn = true;
    req.session.userId = newUser._id.toString();

    return res.status(201).json({
      message: "User registered successfully",
      user : {
        name : newUser.name,
        email : newUser.email,
        _id : newUser._id.toString()
      }
    })
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: err.message })
  }
}

export const loginUser = async (req , res) => {
  try {
    const { email , password } = req.body;

    if(!email || !password){
      return res.status(400).json({ message : "All fields are required"})
    }

    const user = await UserModel.findOne({ email })

    if(!user){
      return res.status(400).json({ message : "User not found"})
    }

    const isPasswordMatched = await bcrypt.compare(password , user.password)

    if(!isPasswordMatched){
      return res.status(400).json({ message : "Invalid credentials"})
    }

    //setting user data in session
    req.session.isLoggedIn = true;
    req.session.userId = user._id.toString();

    return res.status(200).json({
      message : "User logged in successfully",
      user : {
        name : user.name,
        email : user.email,
        _id : user._id.toString()
      }
    })
  }catch(err){
    res.status(500).json({ message : err.message})
  }
}

// controllers for logout
export const logoutUser = async (req , res) => {
   req.session.destroy((err) => {
    if(err){
      return res.status(500).json({ message : "Failed to logout"})
    }
    res.clearCookie("connect.sid")
    return res.status(200).json({ message : "User logged out successfully"})
   })
}

// controllers for user verify
export const verifyUser = async (req, res) => {
  try {
    const { userId } = req.session;
    if(!userId){
      return res.status(401).json({
        message : "User not logged in"
      })
    }
    const user = await UserModel.findById(userId)
    if(!user){
      return res.status(401).json({
        message : "user not found"
      })
    }
    return res.status(200).json({
      message : "User verified successfully",
      user : {
        name : user.name,
        email : user.email,
        _id : user._id.toString()
      }
    })
  }catch(error){
    return res.json({
      message : "Failed to verify user",
      error : error.message
    })
  }
}
