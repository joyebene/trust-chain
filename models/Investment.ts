import {Schema,model,models,Types} from "mongoose";
const InvestmentSchema=new Schema({
  userId:{type:Types.ObjectId,ref:"User",required:true}, paymentId:{type:Types.ObjectId,ref:"Payment",required:true},
  amount:{type:Number,required:true}, currency:{type:String,enum:["NGN","USD","BTC"],required:true},
  targetReturnPercent:{type:Number,default:300}, cycleDaysMin:{type:Number,default:3}, cycleDaysMax:{type:Number,default:5},
  status:{type:String,enum:["active","completed","declined"],default:"active"}, startedAt:{type:Date,default:Date.now}, endsAt:{type:Date}
},{timestamps:true});
export default models.Investment||model("Investment",InvestmentSchema);
