const mongoose=require('mongoose')
const { type } = require('os')

const productSchema=new mongoose.Schema({
id:{
    type:String,
},
name:{
    type:String,
    required:true,
    minLength:3,
},
price:{
    type:Number,
    required:true,
    max:500000,
    min:0.1
},

})

const product=mongoose.model('product',productSchema)

module.exports=product