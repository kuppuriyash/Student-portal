import express from 'express'
import { registerUser, loginUser, logoutUser, verifyUser } from '../controllers/AuthControllers.js'

const AuthRouter = express.Router()

AuthRouter.post('/register', registerUser)
AuthRouter.post('/login'   , loginUser)
AuthRouter.post('/logout'  , logoutUser)
AuthRouter.get('/verify'  , verifyUser)

export default AuthRouter
