const express = require("express");
const config = require("../config/config");
const userRoute = express()

const userController = require("../controllers/userController");

const bodyParser = require("body-parser");
userRoute.use(bodyParser.json());
userRoute.use(bodyParser.urlencoded({ extended: true }));

const session = require("express-session");
userRoute.use(session({ secret: config.sessionSecret }));
const auth = require("../middleware/auth")

userRoute.get("/home", auth.isLogin, userController.userHomePage);

userRoute.get("/",  userController.userGeneralPage);

userRoute.get("/login",auth.isLogout, userController.userVerifyLogin);

userRoute.post("/login",auth.isLogout, userController.userVerifyLogin);

userRoute.get("/signup", auth.isLogout,userController.userSignupForm);

userRoute.post("/signup", userController.userSignup);

userRoute.get('/logout',auth.isLogin,userController.userLogout)

userRoute.get('/add-to-cart',auth.isLogin,userController.addToCart)

userRoute.post('/add-to-cart',auth.isLogin,userController.addToCart)

userRoute.get('/user-cart',auth.isLogin,userController.loadCart)

userRoute.post('/updateQuantity',auth.isLogin,userController.updateQuantity)

userRoute.get('/delete-cart',auth.isLogin,userController.deleteCart)

userRoute.post('/delete-cart',auth.isLogin,userController.deleteCart)

userRoute.get('/category',userController.selectCategory)

userRoute.get('/otp-validation',auth.isLogin,userController.validateUser)

userRoute.post('/otp-validation',auth.isLogin,userController.validateUser)

userRoute.get('/postCheckout',auth.isLogin,userController.getCheckout)

userRoute.post('/postCheckout',auth.isLogin,userController.postCheckout)

userRoute.get('/paypal',auth.isLogin,userController.paypal)

userRoute.get('/orderplaced',auth.isLogin,userController.ordersuccesful)

userRoute.post('/apply-coupon',auth.isLogin,userController.applycoupon)

userRoute.get('/product-detail',userController.viewProductDetails)

userRoute.get('/order-history',auth.isLogin,userController.OrderHistory)

module.exports = userRoute;
