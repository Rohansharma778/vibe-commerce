const mongoose=require('mongoose');

const cartSchema=new mongoose.Schema({
id:
    {type:mongoose.Schema.Types.ObjectId, ref: 'product'}
,
qty:{
    type:Number,
    default:1
},
createdAt:{
    type:Date,
    default:Date.now
}

})

const cart=mongoose.model('cart',cartSchema)

module.exports=cart;
