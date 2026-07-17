import Thumbnail from "../models/Thumbnail.js";

// controller to get User all Thumbnails

export const getUserThumbnails = async (req, res) => {
  try{
    const {userId} = req.session;
    if(!userId){
      return res.status(401).json({
        message : "Unauthorized"
      })
    }
    const thumbnails = await Thumbnail.find({userId}).sort({createdAt : -1})
    res.status(200).json({
      message : "Thumbnails fetched successfully",
      thumbnails
    })
  }catch(error){
    res.status(500).json({
      message : error.message
    })
  }
}

// controller to get single thumbnail of User
export const getSingleThumbnail = async (req, res) => {
  try{
    const {id} = req.params;
    const {userId} = req.session;
    if(!userId){
      return res.status(401).json({
        message : "Unauthorized"
      })
    }
    const thumbnail = await Thumbnail.findOne({_id : id, userId})
    if(!thumbnail){
      return res.status(404).json({
        message : "Thumbnail not found"
      })
    }
    res.status(200).json({
      message : "Thumbnail fetched successfully",
      thumbnail
    })
  }catch(error){
    res.status(500).json({
      message : error.message
    })
  }
}
