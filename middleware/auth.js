const session = require('express-session')

let userSession = false || {}
let isLoggedIn



const isLogin = async(req,res,next)=>{
try {
    userSession = req.session
    if(userSession.userId){}
    else{
        res.redirect('/login')
    }
    next()
} catch (error) {
    console.log(error.message)
}

}

const isLogout = async(req,res,next)=>{
    try {
        userSession = req.session
        if(userSession.userId){
            isLoggedIn = true
            res.redirect('/')
        }
        next()
    } catch (error) {
        console.log(error.message)
    }
    
    }

    module.exports = {isLogin,isLogout}