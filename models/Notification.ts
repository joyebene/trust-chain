import {Schema,model,models,Types} from "mongoose";
const NotificationSchema=new Schema({
  userId:{type:Types.ObjectId,ref:"User",required:true}, title:{type:String,required:true}, message:{type:String,required:true},
  type:{type:String,enum:["payment","investment","system"],default:"system"}, read:{type:Boolean,default:false}
},{timestamps:true});
export default models.Notification||model("Notification",NotificationSchema);
