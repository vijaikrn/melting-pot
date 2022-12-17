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

userRoute.get('/add-to-cart',userController.addToCart)

userRoute.post('/add-to-cart',userController.addToCart)

userRoute.get('/user-cart',userController.loadCart)

userRoute.post('/updateQuantity',userController.updateQuantity)

userRoute.get('/delete-cart',userController.deleteCart)

userRoute.post('/delete-cart',userController.deleteCart)

userRoute.get('/category',userController.selectCategory)

userRoute.get('/otp-validation',userController.validateUser)

userRoute.post('/otp-validation',userController.validateUser)

userRoute.get('/postCheckout',userController.getCheckout)

userRoute.post('/postCheckout',userController.postCheckout)

userRoute.get('/paypal',userController.paypal)

userRoute.get('/orderplaced',userController.ordersuccesful)

userRoute.post('/apply-coupon',userController.applycoupon)

userRoute.get('/product-detail',userController.viewProductDetails)

module.exports = userRoute;
