//PRODUCT MODEL
const ProductModel = require('../models/productModel');
const UserModel = require('../models/userModel');


//CONTROLLER FUNCTION TO RENDER ALL PRODUCTS ON SHOP PAGE
exports.getProducts = (req , res , next) => {
    ProductModel.fetchAll()
        .then( products => {
           res.render('shop/product-list' , {docTitle : 'Shop' , path: '/shop' , prods : products})
        }).catch(err => {
            console.log(err);
       });
}

    //CONTROLLER FUNCTION TO RENDER CART 
      exports.getCart = (req , res , next) => {
          let total = 0 ;
        req.user.getCart()
        .then(products => {
            for(product of products){
                total = total + (product.price * product.qty) ;
            }
            res.render('shop/cart' , {docTitle : 'Cart' , path : '/cart' , prods : products , total : total});
        })
        .catch();
      }


//CONTROLLER FUNCTION TO TAKE CART 
exports.postCart = (req , res , next) => {
    const productId = req.body.productId;
    let price ;
    ProductModel.findById(productId)
    .then(product => {
        price = product.price ;

        const user = req.user ;
        user.addToCart(productId , price)
        .then(result => {
            res.redirect('/');
        })
        .catch(err => {
            console.log(err);
        });
      
    })
    .catch();

   
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
    const productId = req.params.productId ;
    ProductModel.findById(productId).then(product =>{
        res.render('shop/product-details' , {docTitle: 'Product Details' , path: '/product-details' , product: product});
    }).catch();       
   
}



//CONTROLLER FUNCTION TO GET ORDER PAGE
exports.getOrder = (req , res , next ) => {
    res.render('shop/order' , {docTitle : 'Orders' , path : '/order'}) ;
}


exports.postOrder = (req , res , next) => {
    req.user.addOrder()
    .then(result => {
        res.redirect('/order');
    })
    .catch(err => {
        console.log(err);
    })
}