import { Schema, model, models } from "mongoose";
const UserSchema = new Schema({
  name:{type:String,required:true,trim:true},
  email:{type:String,required:true,unique:true,lowercase:true,trim:true},
  phone:{type:String,required:true},
  passwordHash:{type:String,required:true},
  role:{type:String,enum:["user","admin"],default:"user"},
  balances:{
    NGN:{type:Number,default:0},
    USD:{type:Number,default:0},
    BTC:{type:Number,default:0}
  },
  investedBalances:{
    NGN:{type:Number,default:0},
    USD:{type:Number,default:0},
    BTC:{type:Number,default:0}
  },
  totalProfit:{type:Number,default:0},
  isActive:{type:Boolean,default:true}
},{timestamps:true});
export default models.User || model("User",UserSchema);
