const express=require('express')
const mongoose=require('mongoose')
const cors=require('cors')
const product =require('./models/productModel.js')
const cart=require('./models/cartModel.js')
const calculate=require('./price.js')
const db=require('./db.js')
const { error, timeStamp } = require('console')
const app=express()

app.use(cors())
app.use(express.json())


const PORT=process.env.PORT||3000


// get route to get all the product
app.get('/api/products',async(req,res)=>{
    try {
        const allproduct = await product.find({})
        if(allproduct){
            console.log(`All the products :`,allproduct)
            res.status(200).json(allproduct)  // Send the array directly
        }
    } catch (error) {
        console.error('ERROR:',error)
        res.status(500).json({ message: 'something went wrong' })
    }
})

//post route to create product
app.post('/newproduct',async(req,res)=>{
    const {name,price}=req.body
    try {
         const newproduct=await product.create({
        name:name,
        price:price
    })
    if(!newproduct){
        console.log('error')
        res.status(400).json({message:'All field required'})
    }
    else{
        console.log('product created successfully')
        res.status(200).json({message:'product created'})
    }
    } catch (error) {
        console.error('ERROR:',error)
        res.status(500).json({message:'something went wrong'})
    }
   
})

//delete route to delete cart
app.delete('/api/cartdelete/:id',async(req,res)=>{
    const { id } =req.params;
    try {
        const deletecart=await cart.findByIdAndDelete(
            id
        )
        if(deletecart){
            console.log(`product deleted:`,deletecart)
            res.status(200).json({message:`cart deleted`})
        }
    } catch (error) {
        console.error(`ERROR`,error)
        res.status(500).json({message:`something went wrong`})
    }
})

//post route to create cart
//post route to create cart
app.post('/api/cart/:id',async(req,res)=>{
    const {id}=req.params;
    const quantity=req.body.qty;
    try {
        // Check if product exists first
        const productExists = await product.findById(id);
        if(!productExists) {
            return res.status(404).json({message: 'Product not found'});
        }

        // Create new cart
        const newcart = new cart({
            id: id,
            qty: quantity
        });
        
        // Save cart
        const savedcart = await newcart.save();
        let price = await calculate(id, quantity);

        // Send response with cart details
        res.status(200).json({
            message: 'Cart created successfully', 
            cartId: savedcart._id,
            product: {
                name: productExists.name,
                price: productExists.price
            },
            quantity: quantity,
            totalAmount: price
        });

    } catch (error) {
        console.error('ERROR:', error);
        res.status(500).json({message: 'Something went wrong'});
    }
});


//get a cart with total amount
app.get('/api/cart/:id',async(req,res)=>{
    const Cartid=req.params.id;
    try {
    const cartdetails=await cart.findById(Cartid).populate('id')
    if(!cartdetails){
        console.error(`ERROR:`,error)
        res.status(404).json({message:'Cart not found'})
    }
   else{
    let productprice=cartdetails.id.price
    let productqty=cartdetails.qty
    let productname=cartdetails.id.name
    let totalAmount= productprice*productqty
    console.log(cartdetails,Cartid)
        res.status(200).json({ 
    cartId: cartdetails._id,
    product: {
        name: productname,
        price: productprice
    },
    quantity: productqty,
    totalAmount: totalAmount})
    }
    } catch (error) {
        console.error(`ERROR:`,error)
        res.status(500).json({message:'something went wrong '})
    }
})
//get a cart with invoice
app.post('/api/checkout/:id',async(req,res)=>{
    const { id }=req.params;
    try {
        const detail=await cart.findById(id).populate('id')
        
        let invoice={
            total:detail.qty*detail.id.price,
            timeStamp:detail.createdAt
        }
        if(!detail){
            res.status(400).json({message:"All feilds are required"})
        }else{
            console.log(detail)
            res.status(200).json({
        invoice: {
        total: detail.qty * detail.id.price,
        timeStamp: detail.createdAt,
        productName: detail.id.name,
        quantity: detail.qty,
        pricePerUnit: detail.id.price
    }
})
        }
    } catch (error) {
        console.error('ERROR:', error)
        res.status(500).json({ message: 'Checkout failed' })
    }
})

app.listen(PORT,()=>{
    console.log(`Server is running on http://localhost:${PORT}`)
})
