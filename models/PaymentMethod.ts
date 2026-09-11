import mongoose,{Schema,model,models} from "mongoose";
const PaymentMethodSchema=new Schema({
  name:{type:String,required:true}, type:{type:String,enum:["bank","wallet"],required:true},
  currency:{type:String,enum:["NGN","USD","BTC"],required:true}, institution:{type:String,required:true},
  accountName:{type:String,required:true}, accountNumber:{type:String,default:""}, walletAddress:{type:String,default:""},
  instructions:{type:String,default:""}, isActive:{type:Boolean,default:true}
},{timestamps:true});
export default models.PaymentMethod||model("PaymentMethod",PaymentMethodSchema);
