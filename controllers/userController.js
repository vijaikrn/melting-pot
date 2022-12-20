const Product = require("../models/product-model");
const User = require("../models/user-model");
const Category = require("../models/category-model");
const Cart = require("../models/cart-model");
const bcrypt = require("bcrypt");
const fast2sms = require("fast-two-sms");
const Order = require("../models/order-model");
const Coupon = require("../models/coupon-model");
const Banner= require('../models/banner-model')
let isLoggedIn;
isLoggedIn = false;
let userSession = false || {};
let USERID;
let coupon;
let discountedPrice = null;

const securePassword = async (password) => {
  try {
    const passwordHash = await bcrypt.hash(password, 10);
    return passwordHash;
  } catch (error) {
    console.log(error.message);
  }
};

const userSignupForm = (req, res) => {
  res.render("users/signup", { admin: false });
};

const userSignup = async (req, res) => {
  try {
    const spassword = await securePassword(req.body.password);
    const user = User({
      name: req.body.name,
      email: req.body.email,
      mobile: req.body.mno,
      password: spassword,
      isAdmin: 0,
    });
    console.log(user);

    const userData = await user.save();
    USERID = userData._id;
    if (userData) {
      sendMessage(req.body.mno);
      res.render("users/otpPage", {
        admin: false,
      });
    } else {
      res.render("users/signup", {
        message: "Your registration was a failure",
        admin: false,
      });
    }
  } catch (error) {
    console.log(error.message);
  }
};

// const userLoginPage = (req, res) => {
//   res.render("users/login");
// };

const userVerifyLogin = async (req, res) => {
  try {
    const email = req.body.email;
    const password = req.body.password;

    const userData = await User.findOne({ email: email });

    if (userData) {
      const passwordMatch = await bcrypt.compare(password, userData.password);
      if (passwordMatch) {
        if (userData.isVerified === 0) {
          res.render("users/login", {
            message: "please verify your OTP",
            admin: false,
          });
        } else {
          if (userData.isAdmin === 1) {
            res.render("users/login", { message: "Not user", admin: false });
          } else {
            false;
            userSession = req.session;
            userSession.userId = userData._id;
            isLoggedin = true;
            res.redirect("/home");
            console.log("logged in");
          }
        }
      } else {
        res.render("users/login", {
          message: "Email and password is incorrect",
          admin: false,
        });
      }
    } else {
      res.render("users/login", {
        message: "Email and password is incorrect",
        admin: false,
      });
    }
  } catch {
    console.log("error.message");
  }
};

const userHomePage = async (req, res) => {
  userSession = req.session;

  var search = "";
  if (req.query.search) {
    search = req.query.search;
  }
  var page = 1;
  if (req.query.page) {
    page = req.query.page;
  }

  const limit = 8;
  const productData = await Product.find({
    $or: [
      { Name: { $regex: ".*" + search + ".*", $options: "i" } },
      { Category: { $regex: ".*" + search + ".*", $options: "i" } },
    ],
  })
    .lean()
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .exec();

  const count = await Product.find({
    $or: [
      { Name: { $regex: ".*" + search + ".*", $options: "i" } },
      { Category: { $regex: ".*" + search + ".*", $options: "i" } },
    ],
  }).countDocuments();
  const categoryData = await Category.find();
  const bannerData = await Banner.find()
  res.render("users/view-productsLoggedIn", {
    admin: false,
    category: categoryData,
    products: productData,
    banner:bannerData,
    isLoggedIn,
    id: userSession.userId,
    totalPages: Math.ceil(count / limit),
    currentpage: page,
    next: page + 1,
    prev: page - 1,
  });
};

const userGeneralPage = async (req, res) => {
  var search = "";
  if (req.query.search) {
    search = req.query.search;
  }

  var page = 1;
  if (req.query.page) {
    page = req.query.page;
  }
  const categoryData = await Category.find();
  const limit = 8;
  const productData = await Product.find({
    $or: [
      { Name: { $regex: ".*" + search + ".*", $options: "i" } },
      { Category: { $regex: ".*" + search + ".*", $options: "i" } },
    ],
  })
    .lean()
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .exec();

  const count = await Product.find({
    $or: [
      { Name: { $regex: ".*" + search + ".*", $options: "i" } },
      { Category: { $regex: ".*" + search + ".*", $options: "i" } },
    ],
  }).countDocuments();

  const bannerData = await Banner.find()

  res.render("users/view-products", {
    products: productData,
    category: categoryData,
    banner:bannerData,
    admin: false,
    totalPages: Math.ceil(count / limit),
    currentpage: page,
    next: page + 1,
    prev: page - 1,
  });
};

const userLogout = async (req, res) => {
  try {
    userSession = req.session;
    userSession.userId = false;
    isLoggedIn = false;
    admin: false;
    console.log("logged out");
    res.redirect("/");
  } catch (error) {
    console.log(error.message);
  }
};

const addToCart = async (req, res) => {
  try {
    const productID = req.query.id;
    userSession = req.session;

    const checkCart = await Cart.findOne({ userID: userSession.userId });

    if (checkCart != null) {
      // console.log("1");
      const productCheck = await Cart.findOne({
        userID: userSession.userId,
        "product.productID": productID,
      });

      if (productCheck != null) {
        // console.log("2");
        await Cart.updateOne(
          {
            userID: userSession.userId,
            "product.productID": productID,
          },
          { $inc: { "product.$.quantity": 1 } }
        );
        res.redirect("/home");
      } else {
        console.log("3");
        await Cart.updateOne(
          { userID: userSession.userId },
          { $push: { product: { productID: productID, quantity: 1 } } }
        );
        res.redirect("/home");
      }
    } else {
      console.log("4");
      const cart = Cart({
        userID: userSession.userId,
        product: [{ productID: productID, quantity: 1 }],
      });

      await cart.save();
      console.log(cart)
      res.redirect("/home");
    }
  } catch (error) {
    console.log(error.message);
  }
};

const loadCart = async (req, res) => {
  userSession = req.session;
  const totalCart = await Cart.findOne({ userID: userSession.userId });
  const userCart = await Cart.findOne({ userID: userSession.userId }).populate(
    "product.productID"
  );

  if (userCart.product.length == 0) {
    res.render("users/user-cart", {
      cart: userCart.product,
      isLoggedIn,
      admin: false,
      totalprice: 0,
    });
  } else if (userCart.product.length != 0) {
    res.render("users/user-cart", {
      cart: userCart.product,
      isLoggedIn,
      admin: false,
      totalprice: totalCart.totalPrice,
    });
  }
};

const updateQuantity = async (req, res) => {
  try {
    ID = req.query.id;
    userSession = req.session;
    quantity = req.body.quantity;
    const productData = await Cart.findOne({
      userID: userSession.userId,
    }).populate("product.productID");
    const productIndex = await productData.product.findIndex(
      (index) => index._id == ID
    );
    productData.product[productIndex].quantity = quantity;
    productData.totalPrice = 0;
    const totalPrice = productData.product.reduce((acc, curr) => {
      return acc + curr.productID.Price * curr.quantity;
    }, 0);

    console.log(totalPrice);
    productData.totalPrice = totalPrice;

    await productData.save();
    admin: false;
    res.redirect("/user-cart");
  } catch (error) {
    console.log(error.message);
  }
};

const deleteCart = async (req, res) => {
  try {
    userSession = req.session;

    const cartData = await Cart.findOneAndUpdate(
      { userID: userSession.userId },
      { $pull: { product: { _id: req.query.id } } }
    );

    if (cartData.product.length == 0) {
      const cartData = await Cart.deleteOne({ _id: userSession.userId });
      res.render("users/user-cart", {
        message: "cart is empty",
        totalprice: 0,
        cart: cartData,
        admin: false,
      });
    } else res.redirect("/user-cart");
  } catch (error) {
    console.log(error.message);
  }
};

const selectCategory = async (req, res) => {
  try {
    var page = 1;
    if (req.query.page) {
      page = req.query.page;
    }
    const limit = 8;
    const productData = await Product.find({ Category: req.query.category })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();
    const count = await Product.find({
      Category: req.query.category,
    }).countDocuments();
    console.log(req.query.category);
    console.log(productData);
    const categoryData = await Category.find();
    const bannerData = await Banner.find()
    console.log(categoryData);
    res.render("users/view-productsLoggedIn", {
      category: categoryData,
      products: productData,
      banner:bannerData,
      admin: false,
      totalPages: Math.ceil(count / limit),
      currentpage: page,
      next: page + 1,
      prev: page - 1,
    });
  } catch (error) {
    console.log(error.message);
  }
};

const sendMessage = function (mobile, res) {
  randomOTP = Math.floor(Math.random() * 10000);
  var options = {
    authorization:
      "MSOj0bTnaP8phCARmWqtzkgEV4ZN2Ff9eUxXI7iJQ5HcDBKsL1vYiamnRcMxrsjDJboyFEXl0Sk37pZq",
    message: `Your OTP verification code is ${randomOTP}`,
    numbers: [mobile],
  };

  fast2sms
    .sendMessage(options)
    .then((response) => {
      console.log("OTP sent succcessfully");
    })
    .catch((error) => {
      console.log(error);
    });
  return randomOTP;
};

const validateUser = async (req, res) => {
  const otp = req.body.otp;
  if (otp == randomOTP) {
    const validateUser = await User.findById({ _id: USERID });
    validateUser.isVerified = 1;
    const test = await validateUser.save();
    if (test) {
      res.redirect("/home");
      isLoggedin = true;
    } else {
      res.render("registration", { message: "Invalid OTP" });
    }
  }
};

const postCheckout = async (req, res) => {
  userSession = req.session;
  const cartData = await Cart.findOne({ userID: userSession.userId });
  const orders = new Order({
    userID: userSession.userId,
    fname: req.body.fname,
    lname: req.body.lname,
    email: req.body.email,
    mno: req.body.mno,
    address1: req.body.address1,
    address2: req.body.address2,
    country: req.body.country,
    city: req.body.city,
    state: req.body.state,
    zip: req.body.zip,
    payment: req.body.payment,
    product: cartData.product,
    totalPrice: cartData.totalPrice,
  });
  await orders.save();
  console.log("order", orders);
  if (req.body.payment == "cod") {
    await Order.findOneAndUpdate(
      { userID: userSession.userId },
      { status: "billed" }
    );
    const orderData = await Order.findOne({
      userID: userSession.userId,
    }).populate("product.productID");
    const forTotal = await Order.findOne({ userID: userSession.userId });
    await Cart.deleteOne({userID:req.session.userId})
    res.render("users/orderplaced", {
      cart: orderData.product,
      totalprice: forTotal,
      admin: false,
    });
  } else if (req.body.payment == "paypal") {
    res.redirect("/paypal");
  }
};


const getCheckout = async (req, res) => {
  try {
    const totalCart = await Cart.findOne({ userID: userSession.userId });
    const userCart = await Cart.findOne({
      userID: userSession.userId,
    }).populate("product.productID");
    ship = 10;

    if (req.session.discountedPrice) {
      res.render("users/checkout", {
        cart: userCart.product,
        cartTotal: req.session.discountedPrice,
        admin: false,
        shipping: ship,
      });
    } else {
      res.render("users/checkout", {
        cart: userCart.product,
        cartTotal: totalCart.totalPrice,
        admin: false,
        shipping: ship,
      });
    }
  } catch (error) {
    console.log(error.message);
  }
};

const paypal = async (req, res) => {
  userSession = req.session;
  const orderData = await Order.findOne({ userID: userSession.userId });
  const cartData = await Cart.findOne({ userID: userSession.userId });
  console.log(orderData);
  if (req.session.discountedPrice) {
    res.render("users/paypal", {
      total: req.session.discountedPrice,
      admin: false,
    });
  } else
    res.render("users/paypal", {
      total: cartData.totalPrice + 10,
      admin: false,
    });
};

const ordersuccesful = async (req, res) => {
  userSession = req.session;
  const cartData = await Cart.findOne({
    userID: userSession.userId,
  }).populate("product.productID");
  const forTotal = await Cart.findOne({ userID: userSession.userId });
 await Cart.deleteOne({userID:req.session.userId})
  console.log("orderData.forTotal");
  res.render("users/orderplaced", {
    cart: cartData.product,
    totalprice: req.session.discountedPrice+10,
    admin: false,
  });
};

const applycoupon = async (req, res) => {
  try {
    userSession = req.session;
    coupon = req.body.coupon;
    const couponData = await Coupon.findOne({ name: coupon });
    const cartData = await Cart.findOne({ userID: userSession.userId });
    if (couponData) {
      req.session.discountedPrice =
        cartData.totalPrice - (cartData.totalPrice * couponData.discount) / 100;
      discountedPrice = req.session.discountedPrice;
      console.log(req.session);

      res.redirect("/postCheckout");
      // await Order.findOneAndUpdate({userID: userSession.userId},{$set:{totalPrice:discountedPrice}})
    }
  } catch (error) {
    console.log(error.message);
  }
};

const viewProductDetails = async (req, res) => {
  try {
    id = req.query.id;
    const productData = await Product.findOne({ _id: id });
    console.log(productData);
    res.render("users/product-detail", { products: productData, admin: false });
  } catch (error) {
    console.log(error.message);
  }
};

const OrderHistory = async (req, res) => {
  try {
    var page = 1
    const limit = 8
    const orderData = await Order.find({ userID: req.session.userId })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();
    const count = await Order.find({
      userID: req.session.userId,
    }).countDocuments();
    res.render("users/order-history", {
      admin: false,
      orders: orderData,
      totalPages: Math.ceil(count / limit),
      currentpage: page,
      next: page + 1,
      prev: page - 1,
    });
  } catch (error) {
    console.log(error.message);
  }
};


// const viewBanner = async(req,res)=>{
//   try {
//     const bannerData = await Banner.find()
//     res.render('users/view-products',{banner:bannerData,admin:false})
//   } catch (error) {
//     console.log(error.message);
//   }
// }

module.exports = {
  userSignupForm,
  userSignup,
  userVerifyLogin,
  userHomePage,
  userGeneralPage,
  userLogout,
  addToCart,
  loadCart,
  deleteCart,
  updateQuantity,
  selectCategory,
  sendMessage,
  validateUser,
  postCheckout,
  getCheckout,
  paypal,
  ordersuccesful,
  applycoupon,
  viewProductDetails,
  OrderHistory,
  // viewBanner
};
