import express from 'express'
import { deleteThumbnail } from '../controllers/ThumbnailControllers.js'
import { generateThumbnail } from '../controllers/ThumbnailControllers.js';

const ThumbnailRouter = express.Router();

ThumbnailRouter.delete('/delete/:id', deleteThumbnail);
ThumbnailRouter.post('/generate', generateThumbnail);

export default ThumbnailRouter;
