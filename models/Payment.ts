import {Schema,model,models,Types} from "mongoose";
const PaymentSchema=new Schema({
  userId:{type:Types.ObjectId,ref:"User",required:true}, paymentMethodId:{type:Types.ObjectId,ref:"PaymentMethod",required:true},
  amount:{type:Number,required:true,min:1}, currency:{type:String,enum:["NGN","USD","BTC"],required:true},
  reference:{type:String,required:true}, proofUrl:{type:String,default:""}, note:{type:String,default:""},
  status:{type:String,enum:["pending","approved","declined"],default:"pending"}, declineReason:{type:String,default:""},
  reviewedBy:{type:Types.ObjectId,ref:"User"}, reviewedAt:{type:Date}
},{timestamps:true});
export default models.Payment||model("Payment",PaymentSchema);
