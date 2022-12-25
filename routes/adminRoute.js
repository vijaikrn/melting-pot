const express = require("express");

const adminRoute = express();

const authAdmin = require("../middleware/authAdmin");

const bodyParser = require("body-parser");
adminRoute.use(bodyParser.json());
adminRoute.use(bodyParser.urlencoded({ extended: true }));

const adminController = require("../controllers/adminController");

adminRoute.get("/product-management", authAdmin.isLogin, adminController.viewProducts);

adminRoute.get("/", authAdmin.isLogin, adminController.viewProducts);

adminRoute.get("/add-product", adminController.addProducts);

adminRoute.post("/add-product",adminController.store.any(),adminController.insertProduct);

adminRoute.get("/login", authAdmin.isLogout, adminController.adminLoginGet);

adminRoute.post("/login", authAdmin.isLogout, adminController.adminLogin);

adminRoute.get("/logout", authAdmin.isLogin, adminController.adminLogout);

adminRoute.get("/users",authAdmin.isLogin, adminController.viewUsers);

adminRoute.get("/edit-product",authAdmin.isLogin, adminController.editProduct);

adminRoute.post("/edit-product",adminController.store.any(), adminController.editProductPost);

adminRoute.get('/delete-product',authAdmin.isLogin,adminController.deleteProducts)

adminRoute.get('/block-user',authAdmin.isLogin,adminController.blockUser)

adminRoute.get('/add-category',authAdmin.isLogin,adminController.addCategoryGet)

adminRoute.post('/add-category',adminController.addCategory)

adminRoute.post('/delete-category',adminController.deleteCategory)

adminRoute.get('/order-management',authAdmin.isLogin,adminController.viewOrders)

adminRoute.post('/order-management',adminController.viewOrders)

adminRoute.post('/confirm-order',adminController.confirmOrder)

adminRoute.post('/cancel-order',adminController.cancelOrder)

adminRoute.post('/deliver-order',adminController.deliverOrder)

adminRoute.get('/manage-coupon',authAdmin.isLogin,adminController.manageCouponGet)

adminRoute.post('/add-coupon',adminController.addCoupon)

adminRoute.post('/delete-coupon',adminController.deleteCoupon)

adminRoute.get('/admin-panel',authAdmin.isLogin,adminController.loadAdminHome)

adminRoute.get('/banner',authAdmin.isLogin,adminController.viewBanners)

adminRoute.post('/banner',adminController.store.any(),adminController.addBanner)

adminRoute.post('/delete-banner',adminController.deleteBanner)

adminRoute.get('/sales-report',authAdmin.isLogin,adminController.salesReport)


module.exports = adminRoute;
