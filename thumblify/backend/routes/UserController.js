import express from 'express'
import { getSingleThumbnail, getUserThumbnails } from '../controllers/UserControllers.js';

const UserRouter = express.Router();

UserRouter.get('/thumbnails',getUserThumbnails)
UserRouter.get('/thumbnail/:id',getSingleThumbnail)

export default UserRouter
