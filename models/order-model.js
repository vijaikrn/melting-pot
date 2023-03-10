const mongoose = require('mongoose')

const checkoutSchema = mongoose.Schema({
    userID:{
        type:mongoose.Types.ObjectId,
        ref:'User'
    },
    fname:{
        type:String,
    },
    
   
    mno:{
        type:String,
    },
    address1:{
        type:String,
    },
    
    zip:{
        type:Number,
       
    },
    payment:{
        type:String,

    },
    status:{
        type:String,
        default:'pending'
    },
    totalPrice:{
        type:Number,
        default:0,
    },
    product:[{
        productID:{
            type:mongoose.Types.ObjectId,
            ref:'Product'
        },
        checkoutPrice:{
            type:Number
        },
        quantity:{
            type:Number
        }
    }],
    createdAt:{
        type:Date,
        immutable:true,
        default:()=>Date.now()
    }
    
})
module.exports = mongoose.model('Order',checkoutSchema);