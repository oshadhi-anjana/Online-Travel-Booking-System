const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const schema = new mongoose.Schema({
username: {type:String,required:true,trim:true,maxlength:80}, contact:{type:String,required:true,trim:true,maxlength:30}, location:{type:String,required:true,trim:true,maxlength:120}, email:{type:String,required:true,unique:true,lowercase:true,trim:true}, password:{type:String,required:true,select:false}, role:{type:String,enum:['user','admin'],default:'user'}
},{timestamps:true});
schema.pre('save',async function(){if(this.isModified('password')) this.password=await bcrypt.hash(this.password,12);});
module.exports=mongoose.model('Users',schema);
