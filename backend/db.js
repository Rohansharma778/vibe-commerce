const mongoose=require('mongoose')
const dotenv=require('dotenv')
dotenv.config()

const MONGO_URI=process.env.URI

mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(()=>{
    console.log('database connected successfully')
})
.catch((err)=>{
    console.error('ERROR:',err)
})