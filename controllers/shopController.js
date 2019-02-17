//PRODUCT MODEL
const Product = require('../models/productModel');
const User = require('../models/userModel');
const Order = require('../models/orderModel') ;


//CONTROLLER FUNCTION TO RENDER ALL PRODUCTS ON SHOP PAGE
exports.getProducts = (req , res , next) => {
    const isAuth = req.session.isLoggedIn == true ? true : false ;
    Product.find()
        .then( products => {
           res.render('shop/product-list' , {docTitle : 'Shop' , path: '/shop' , prods : products , isAuth : isAuth})
        }).catch(err => {
            console.log(err);
       });
}



    //CONTROLLER FUNCTION TO RENDER CART 
      exports.getCart = (req , res , next) => {
        const isAuth = req.session.isLoggedIn == true ? true : false ;
        let total = 0 ;
        let products = [];
        req.user.populate('cart.item.prodId').execPopulate()
        .then(user => {
            products = user.cart.item ;
            for(product of products){
                total = total + (product.prodId.price * product.qty) ;
            }
            res.render('shop/cart' , {docTitle : 'Cart' , path : '/cart' , prods : products , total : total , isAuth : isAuth});
        })
        .catch(err => {
            console.log(err);
        }) ;

      }


//CONTROLLER FUNCTION TO TAKE CART 
exports.postCart = (req , res , next) => {
    const productId = req.body.productId;
    req.user.addToCart(productId)
    .then(result => {
        res.redirect('/');
    })
    .catch(err => {
        console.log(err);
    });

   
}


//CONTROLLER FUNCTION TO DELETE A PRODUCT FROM CART
exports.getDeleteProductFromCart = (req , res , next) => {
    const productId = req.params.productId ;
    req.user.deleteItemFromCart(productId)
    .then(result => {
        res.redirect('/cart');
    })
    .catch(err => {
        console.log(err);
    });
   
}


//CONTROLLER FUNCTION TO RENDER PRODUCT DETAILS
exports.getProductDetails = (req , res , next ) =>{
    const isAuth = req.session.isLoggedIn == true ? true : false ;
    const productId = req.params.productId ;
    Product.findById(productId).then(product =>{
        res.render('shop/product-details' , {docTitle: 'Product Details' , path: '/product-details' , product: product , isAuth : isAuth});
    }).catch();       
   
}



//CONTROLLER FUNCTION TO GET ORDER PAGE
exports.getOrder = (req , res , next ) => {
    const isAuth = req.session.isLoggedIn == true ? true : false ;
    req.user.fetchOrders()
    .then(orders => {
        console.log(req.user);
        res.render('shop/order' , {docTitle : 'Orders' , path : '/order' , orders : orders , isAuth : isAuth}) ;
    })
   .catch(err => {
       console.log(err);
   })
}


exports.postOrder = (req , res , next) => {
    const d = new Date();
    let products ;
    const date = d.getDay() + "/" + d.getMonth() + "/" + d.getFullYear() ;
    const time = d.getHours() + ":" + d.getMinutes()  ;
    req.user.populate('cart.item.prodId').execPopulate()
    .then(user => {
        products = user.cart.item.map(i => {
            return {qty : i.qty , data : {...i.prodId._doc }}  ;
        });
         const order = new Order({
            products : products,
            time : time ,
            date : date ,
            user : {
                userId : req.user,
                name : req.user.name
            }
        });

        return order.save() ;
    })
    .then(result => {
        req.user.cart.item  = [];
        return req.user.save();
    })
    .then(result => {
        res.redirect('/order');
    })
    .catch(err => {
        console.log(err);
    })
}