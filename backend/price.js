const mongoose=require('mongoose')
const product=require('./models/productModel')

async function calculate(productId, quantity){
    try {
        const productDoc = await product.findById(productId)
        if (!productDoc) {
            throw new Error('Product not found')
        }
        const totalPrice = productDoc.price * quantity
        return totalPrice
    } catch (error) {
        console.error('Error calculating price:', error)
        return 0
    }
}

module.exports=calculate