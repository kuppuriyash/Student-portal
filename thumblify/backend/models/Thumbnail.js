import mongoose from "mongoose";

const ThumbnailSchema = new mongoose.Schema({
  userId: {type : String, required : true, ref : "User" },
  title: {type : String, required : true, trim : true},
  description: {type : String, trim : true},
  style: {type : String, required : true, enum : ["Bold & Graphic", "Tech/Futuristic", "Minimalist", "Photorealistic", "Illustrated"]},
  aspect_ratio: {type : String, enum : ["16:9", "1:1", "9:16"]},
  color_scheme: {type : String, enum : ["vibrant", "sunset", "forest", "neon", "purple", "monochrome", "ocean", "pastel"]},
  text_overlay: {type : Boolean, default : false},
  image_url: {type : String},
  prompt_used: {type : String},
  user_prompt: {type : String},   
  isGenerating: {type : Boolean, default : false},
  createdAt: {type : Date, default : Date.now},
  updatedAt: {type : Date, default : Date.now},
})

const Thumbnail = mongoose.model("Thumbnail", ThumbnailSchema)

export default Thumbnail
