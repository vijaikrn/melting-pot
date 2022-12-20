const Product = require("../models/product-model");
const User = require("../models/user-model");
const Category = require("../models/category-model");
const bcrypt = require("bcrypt");
const multer = require("multer");
const path = require("path");
const Order = require("../models/order-model");
const Coupon = require("../models/coupon-model");
const Banner = require("../models/banner-model");
const { userInfo } = require("os");
const { findOneAndUpdate } = require("../models/category-model");
const { log } = require("console");

// let isAdminLoggedin = false;
// let adminSession = false || {};
// let choice;

const securePassword = async (password) => {
  try {
    const passwordHash = await bcrypt.hash(password, 10);
    return passwordHash;
  } catch (error) {
    console.log(error.message);
  }
};

//multer
let Storage = multer.diskStorage({
  destination: "./public/admin/images",
  filename: (req, file, cb) => {
    cb(
      null,
      file.fieldname + "_" + Date.now() + path.extname(file.originalname)
    );
  },
});
let upload = multer({
  storage: Storage,
}).single("image");

//admin add product page
const addProducts = async (req, res) => {
  const categoryData = await Category.find();
  res.render("admin/add-product", { category: categoryData, admin: true });
};

//admin insert product functionality
const insertProduct = async (req, res) => {
  try {
    const product = new Product({
      Serial: req.body.Serial,
      Name: req.body.Name,
      Description: req.body.Description,
      Price: req.body.Price,
      Category: req.body.Category,
      image: req.file.filename,
    });
    console.log(product);
    const productData = await product.save();
    const categoryData = await Category.find();
    if (productData) {
      res.render("admin/add-product", {
        category: categoryData,
        message: "Product added Successfully!!",
        admin: true,
      });
    } else {
      res.render("admin/add-product", {
        message: "Product adding failed",
        admin: true,
      });
    }
  } catch (error) {
    console.log(error.message);
  }
};

const addBanner = async (req, res) => {
  try {
    const banner = new Banner({
      name: req.body.name,
      image: req.file.filename,
    });
    const bannerData = await banner.save();
    if (bannerData) {
      res.render("admin/add-banner", {
        banner: bannerData,
        message: "Banner added Successfully!!",
        admin: true,
      });
    } else {
      res.render("admin/add-banner", {
        banner: bannerData,
        message: "Banner adding failed",
        admin: true,
      });
    }
  } catch (error) {
    console.log(error.message);
  }
};

const viewBanners = async (req, res) => {
  try {
    const bannerData = await Banner.find();
    res.render("admin/add-banner", { banner: bannerData, admin: true });
  } catch (error) {
    console.log(error.message);
  }
};

const viewProducts = async (req, res) => {
  var search = "";
  if (req.query.search) {
    search = req.query.search;
  }
  var page = 1;
  if (req.query.page) {
    page = req.query.page;
  }

  const limit = 10;
  const productData = await Product.find({
    $or: [
      { Name: { $regex: ".*" + search + ".*", $options: "i" } },
      { Category: { $regex: ".*" + search + ".*", $options: "i" } },
    ],
  })
    .lean()
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
  // choice = "product";
  // console.log(productData);
  res.render("admin/view-products", {
    products: productData,
    // choice: choice,
    admin: true,
    totalPages: Math.ceil(count / limit),
    currentpage: new Number(page),
    next: new Number(page) + 1,
    prev: new Number(page) - 1,
  });
  return viewProducts;
};

const adminLoginGet = (req, res) => {
  res.render("admin/admin-login", { admin: true });
};

const adminLogin = async (req, res) => {
  try {
    const email = req.body.email;
    const password = req.body.password;

    const userData = await User.findOne({ email: email });

    if (userData) {
      const passwordMatch = await bcrypt.compare(password, userData.password);
      if (passwordMatch) {
        if (userData.isAdmin === 0) {
          res.render("admin/admin-login", {
            message: "incorrect credentials,please try again",
            admin: true,
          });
          // console.log("is admin is 0");
        } else {
          admin: true;
          adminSession = req.session;
          // isAdminLoggedin = true;
          adminSession.userId = userData._id;
          res.redirect("/admin");
        }
      } else {
        res.render("admin/admin-login", {
          message: "incorrect credentials,please try again",
          admin: true,
        });
        console.log("password");
      }
    } else {
      res.render("admin/admin-login", {
        message: "Email and password is incorrect.",
        admin: true,
      });
      // console.log("email and password is incorrect");
    }
  } catch (error) {
    console.log(error.message);
  }
};

const adminLogout = async (req, res) => {
  try {
    adminSession = req.session;
    adminSession.userId = false;
    isAdminLoggedin = false;
    res.redirect("/admin/login");
  } catch (error) {
    console.log(error.message);
  }
};

const viewUsers = async (req, res) => {
  var search = "";
  if (req.query.search) {
    search = req.query.search;
  }

  var page = 1;
  if (req.query.page) {
    page = req.query.page;
  }

  const limit = 10;

  const userData = await User.find({
    $or: [
      { name: { $regex: ".*" + search + ".*", $options: "i" } },
      { email: { $regex: ".*" + search + ".*", $options: "i" } },
    ],
  })
    .lean()
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .exec();
  const count = await User.find({
    $or: [
      { name: { $regex: ".*" + search + ".*", $options: "i" } },
      { email: { $regex: ".*" + search + ".*", $options: "i" } },
    ],
  }).countDocuments();
  // choice = "user";
  // console.log(userData);
  res.render("admin/view-users", {
    users: userData,
    totalPages: Math.ceil(count / limit),
    currentpage: new Number(page),
    next: new Number(page) + 1,
    prev: new Number(page) - 1,
    // choice: choice,
    admin: true,
  });
  return viewUsers;
};

const editProduct = async (req, res) => {
  try {
    const id = req.query.id;
    console.log(id);
    const productData = await Product.findById({ _id: id });
    console.log(productData);
    if (productData) {
      res.render("admin/edit-product", { product: productData, admin: true });
    } else {
      res.redirect("/");
    }
  } catch (error) {
    console.log(error.message);
  }
};

const editProductPost = async (req, res) => {
  try {
    const productData = await Product.findByIdAndUpdate(
      { _id: req.body.id },
      {
        $set: {
          Name: req.body.Name,
          Description: req.body.Description,
          Serial: req.body.Serial,
          Price: req.body.Price,
          Category: req.body.Category,
          image: req.file.filename,
        },
      }
    );
    res.redirect("/admin");
  } catch (error) {
    console.log(error.message);
  }
};

// const deleteProduct = async (req, res) => {
//   try {
//     const id = req.query.id;
//     const productData = await Product.deleteOne({ _id: id });
//     res.redirect("/admin");
//   } catch (error) {
//     console.log(error.message);
//   }
// };
const deleteProducts = async (req, res) => {
  const id = req.query.id;
  const deletedProduct = await Product.findOneAndUpdate(
    { _id: id },
    { $set: { isAvailable: 0 } }
  );

  res.redirect("/admin");
};

const blockUser = async (req, res) => {
  try {
    const id = req.query.id;
    const userData = await User.findById({ _id: id });
    if (userData.isVerified) {
      await User.findByIdAndUpdate({ _id: id }, { $set: { isVerified: 0 } });
    } else {
      await User.findByIdAndUpdate({ _id: id }, { $set: { isVerified: 1 } });
    }
    res.redirect("/admin/users");
  } catch (error) {
    console.log(error.message);
  }
};

const addCategoryGet = async (req, res) => {
  try {
    const categoryData = await Category.find();
    res.render("admin/add-category", { admin: true, category: categoryData });
  } catch (error) {
    console.log(error.message);
  }
};

const addCategory = async (req, res) => {
  try {
    const category = new Category({
      Category: req.body.Category,
    });

    const categoryData = await category.save();
    if (categoryData) {
      res.redirect("/admin/add-category");
    } else {
      res.redirect("/admin/add-category");
    }
  } catch (error) {
    console.log(error.message);
  }
};

const deleteCategory = async (req, res) => {
  try {
    const id = req.query.id;
    console.log(id);
    const categoryData = await Category.findByIdAndDelete({ _id: id });
    console.log(categoryData);

    res.redirect("/admin/add-category");
  } catch (error) {
    console.log(error.message);
  }
};

const viewOrders = async (req, res) => {
  try {
    id = req.query.id;
    const orderData = await Order.find();
    res.render("admin/order-management", { admin: true, order: orderData });
  } catch (error) {
    console.log(error.message);
  }
};

const confirmOrder = async (req, res) => {
  try {
    const id = req.query.id;
    const orderData = await Order.findOneAndUpdate(
      { _id: id },
      { $set: { status: "confirmed" } }
    );
    res.redirect("/admin/order-management");
  } catch (error) {}
};

const cancelOrder = async (req, res) => {
  try {
    const id = req.query.id;
    const orderData = await Order.findOneAndUpdate(
      { _id: id },
      { $set: { status: "cancelled" } }
    );
    res.redirect("/admin/order-management");
  } catch (error) {
    console.log(error.message);
  }
};

const deliverOrder = async (req, res) => {
  try {
    const id = req.query.id;
    const orderData = await Order.findOneAndUpdate(
      { _id: id },
      { $set: { status: "delivered" } }
    );
    res.redirect("/admin/order-management");
  } catch (error) {
    console.log(error.message);
  }
};

const manageCouponGet = async (req, res) => {
  try {
    const couponData = await Coupon.find();
    res.render("admin/manage-coupon", { admin: true, coupon: couponData });
  } catch (error) {
    console.log(error.message);
  }
};

const addCoupon = async (req, res) => {
  try {
    const coupon = new Coupon({
      name: req.body.coupon,
      discount: req.body.discount,
    });
    const couponData = await coupon.save();
    if (couponData) {
      admin: true;
      res.redirect("/admin/manage-coupon");
    } else {
      admin: true;
      res.redirect("/admin/manage-coupon");
    }
  } catch (error) {
    console.log(error.message);
  }
};

const deleteCoupon = async (req, res) => {
  try {
    const id = req.query.id;
    const couponData = await Coupon.deleteOne({ _id: id });
    res.redirect("/admin/manage-coupon");
  } catch (error) {
    console.log(error.message);
  }
};

const loadAdminHome = async (req, res) => {
  try {
    adminSession = req.session;
    // const userData = await User.findById({_id:adminSession.userId})
    if (adminSession.userId) {
      const categoryData = await Category.find();
      const categoryArray = [];
      const orderGenreCount = [];
      for (let key of categoryData) {
        categoryArray.push(key.Category);
        orderGenreCount.push(0);
      }
      const completeorder = [];
      const orderData = await Order.find();

      for (let key of orderData) {
        const uppend = await key.populate("product.productID");
        completeorder.push(uppend);
      }

      for (let i = 0; i < completeorder.length; i++) {
        for (let j = 0; j < completeorder[i].product.length; j++) {
          const genre = completeorder[i].product[j].productID.Category;
          const isExisting = categoryArray.findIndex((category) => {
            return category === genre;
          });
          orderGenreCount[isExisting]++;
        }
      }

      console.log("categoryArray:", categoryArray);
      console.log("orderGenreCount:", orderGenreCount);
      // console.log('genre: ',completeorder[0].products[0].productID.Category);

      const productData = await Product.find();
      const userData = await User.find();
      res.render("admin/admin-panel", {
        admin: true,
        products: productData,
        users: userData,
        category: categoryArray,
        count: orderGenreCount,
      });
    } else {
      res.redirect("/admin/login");
    }
  } catch (error) {
    console.log(error.message);
  }
};

const deleteBanner = async (req, res) => {
  try {
    const id = req.query.id;
    await Banner.deleteOne({ _id: id });
    res.redirect("/admin/banner");
  } catch (error) {
    console.log(error.message);
  }
};

module.exports = {
  insertProduct,
  viewProducts,
  addProducts,
  upload,
  adminLoginGet,
  adminLogin,
  adminLogout,
  deleteProducts,
  viewUsers,
  editProduct,
  editProductPost,

  blockUser,
  addCategory,
  addCategoryGet,
  deleteCategory,
  viewOrders,
  confirmOrder,
  cancelOrder,
  deliverOrder,
  manageCouponGet,
  addCoupon,
  deleteCoupon,
  loadAdminHome,
  addBanner,
  viewBanners,
  deleteBanner,
};
