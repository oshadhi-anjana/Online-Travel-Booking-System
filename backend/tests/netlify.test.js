const {test}=require('node:test');
const assert=require('node:assert/strict');
process.env.SECRET_KEY='function-adapter-test-secret';
const {createHandler}=require('../netlify/functions/api');
const User=require('../models/user');
const Booking=require('../models/booking');
const Destination=require('../models/destination');
const jwt=require('jsonwebtoken');
const bcrypt=require('bcrypt');
const id='507f1f77bcf86cd799439011';
const token=jwt.sign({id},process.env.SECRET_KEY);
const handler=createHandler(async()=>{});
function event(path,{method='GET',body='',binary=false,type='application/json',auth=false}={}){return {path,httpMethod:method,headers:{host:'example.netlify.app','content-type':type,...(auth?{authorization:'Bearer '+token}:{})},body:binary?body.toString('base64'):body,isBase64Encoded:binary,queryStringParameters:null,requestContext:{identity:{sourceIp:'127.0.0.1'}}};}
test('Netlify adapter supports public API and direct function paths',async()=>{const old=Destination.find;try{Destination.find=()=>({sort:()=>({lean:async()=>[]})});for(const path of ['/api/destinations','/.netlify/functions/api/destinations']){const r=await handler(event(path));assert.equal(r.statusCode,200);assert.equal(JSON.parse(r.body)[0].id,'ella');}}finally{Destination.find=old;}});
test('Netlify adapter preserves JSON login and does not expose passwords',async()=>{const old=User.findOne;try{const hash=await bcrypt.hash('function-password',4);User.findOne=()=>({select:async()=>({_id:id,username:'Traveller',email:'test@example.com',password:hash})});const r=await handler(event('/api/user/login',{method:'POST',body:JSON.stringify({email:'test@example.com',password:'function-password'})}));assert.equal(r.statusCode,200);const data=JSON.parse(r.body);assert.ok(data.token);assert.equal(data.user.password,undefined);}finally{User.findOne=old;}});
test('Netlify adapter decodes binary slips and preserves upload restrictions',async()=>{const old=Booking.findOneAndUpdate;const png=Buffer.from([137,80,78,71,13,10,26,10]);try{Booking.findOneAndUpdate=async(filter,update)=>{assert.equal(filter.userID,id);assert.deepEqual(filter.paymentSlip,{$exists:false});assert.ok(update.$set.paymentSlip.data.equals(png));return {toObject:()=>({_id:id,paymentStatus:'Under review',paymentSlip:{name:'receipt.png'}})};};const r=await handler(event('/api/bookings/'+id+'/payment-slip',{method:'PUT',body:png,binary:true,type:'image/png',auth:true}));assert.equal(r.statusCode,200);assert.equal(JSON.parse(r.body).paymentStatus,'Under review');}finally{Booking.findOneAndUpdate=old;}});
test('Netlify adapter encodes private binary downloads without corruption',async()=>{const old=Booking.findById;const pdf=Buffer.from('%PDF-1.4\nBinary test\n');try{Booking.findById=()=>({select:async()=>({userID:id,paymentSlip:{mime:'application/pdf',data:pdf}})});const r=await handler(event('/api/bookings/'+id+'/payment-slip',{auth:true}));assert.equal(r.statusCode,200);assert.equal(r.isBase64Encoded,true);assert.ok(Buffer.from(r.body,'base64').equals(pdf));assert.equal(r.headers['cache-control'],'no-store');}finally{Booking.findById=old;}});
test('database initialization failures return JSON and can retry',async()=>{let attempts=0;const recover=createHandler(async()=>{if(++attempts===1)throw new Error('private connection info');});const failed=await recover(event('/api/health'));assert.equal(failed.statusCode,503);assert.ok(!failed.body.includes('private connection info'));const retried=await recover(event('/api/missing'));assert.equal(retried.statusCode,404);assert.equal(attempts,2);});
