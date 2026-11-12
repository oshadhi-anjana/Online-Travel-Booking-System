const mongoose = require('mongoose');
const slip = new mongoose.Schema({ name:String, mime:String, size:Number, uploadedAt:Date, data:{type:Buffer, select:false} }, {_id:false});
module.exports = mongoose.model('Booking', new mongoose.Schema({
  userID:{type:mongoose.Schema.Types.ObjectId,ref:'Users',required:true},
  destination:{type:String,required:true}, destinationId:{type:String,required:true},
  startDate:{type:String,required:true}, guests:{type:Number,required:true,min:1,max:12},
  total:{type:Number,required:true}, days:Number,
  paymentStatus:{type:String,enum:['Pending','Under review','Paid'],default:'Pending'},
  paymentSlip:{type:slip,default:undefined},
  status:{type:String,enum:['Reserved','Confirmed','Completed','Cancelled'],default:'Reserved'}
}, {timestamps:true}));
