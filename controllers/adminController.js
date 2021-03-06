
//PRODUCT MODEL
const Product = require('../models/productModel');
const fileHelper = require('../util/fileHelper');
const { validationResult } = require('express-validator/check');


// CONTROLLER FUNCTION TO RENDER THE ADD PRODUCT VIEW PAGE
exports.getAddProduct = (req , res ,next) => {
    const isAuth = req.session.isLoggedIn == true ? true : false ;
    res.render('admin/add-product' , {docTitle : 'Add Product' , path: '/admin/add-product' , isAuth : isAuth , errorMsg : ''});
}

//CONTROLLER FUNCTION TO TAKE THE ADD PRODUCT POST REQUEST
exports.postAddProduct = (req , res , next) => {
    const title = req.body.title ;
    const image = req.file ;
    const price = req.body.price ;
    const description = req.body.description ;
    const errorMsg = validationResult(req);
    const isAuth = req.session.isLoggedIn == true ? true : false ;


    if(!errorMsg.isEmpty()){
       return res.status(422).render('admin/add-product' , {docTitle : 'Add Product' , path: '/admin/add-product' , isAuth : isAuth , errorMsg : errorMsg.array()[0].msg})
    }
    
    if(!image){
        return res.status(422).render('admin/add-product' , {docTitle : 'Add Product' , path: '/admin/add-product' , isAuth : isAuth , errorMsg : 'Invalid Image Type'})
    }
    
    const imagePath = "/images/" + image.filename ;

    const product = new Product({
        title : title ,
        image : imagePath ,
        price : price ,
        description : description ,
        userId : req.user._id
    }) ;
    
    product.save()
    .then( result => {
       res.redirect('/shop');
    })
    .catch(err => {
        console.log(err);
    });

}


// CONTROLLER FUNCTION TO GET THE EDIT PRODUCT VIEW PAGE
exports.getEditProduct = (req , res ,next) => {
    const isAuth = req.session.isLoggedIn == true ? true : false ;
    const productId = req.params.productId;
    Product.findById(productId)
    .then( product => {
        if(!product){
            return res.redirect('/');
         }
         res.render('admin/edit-product' , {docTitle : 'Edit Product' , path: '/admin/edit-product' , product: product , isAuth :isAuth ,  errorMsg : ''}); 
    })
    .catch(err =>{
        console.log(err);
    });
  
 }


// CONTROLLER FUNCTION TO TAKE POST REQUEST FOR EDITTING PRODUCT
 exports.postEditProduct = (req , res , next)=>{
     const title = req.body.title ;
     const price = req.body.price ;
     const image = req.file ;
     const description = req.body.description ;
     const productId = req.body.productId ;
     const errorMsg = validationResult(req);
     const isAuth = req.session.isLoggedIn == true ? true : false ;
 
     if(!errorMsg.isEmpty()){
        return res.status(422).render('admin/edit-product' , {docTitle : 'Edit Product' , path: '/admin/edit-product' , isAuth : isAuth , errorMsg : errorMsg.array()[0].msg})
     }

     Product.findById(productId)
     .then(product => {

        if(product.userId.toString() !== req.user._id.toString()){
           return res.redirect('/');
        }

        if(image){
            const imagePath = "/images/" + image.filename;
            fileHelper.deleteFile(image.path);
            product.image = imagePath ;
        }

         product.title = title ;
         product.price = price ;
         product.description = description ;

         return product.save()
         .then(result =>{
            res.redirect('/shop');
        })
     })
     .catch(err => {
         console.log(err);
     });

 }



  //CONTROLLER FUNCTION TO DELETE PRODUCT
  exports.deleteProduct = (req , res ,next)=>{
    const productId = req.params.productId ;
    Product.findById(productId)
    .then(product => {
        if(!product){
            return res.redirect('/');
        }
        const imagePath  = "public/" + product.image ;
        fileHelper.deleteFile(imagePath);
        return Product.deleteOne({_id: productId , userId : req.user._id}) ;
    })
    .then( result => {
        //res.redirect('/admin/products');
        res.status(200).json({message : 'success'});
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({message : 'Product cannot be Deleted'}) ;
    });
  }



// CONTROLLER FUNCTION TO GET ALL THE PRODUCTS PAGE
 exports.getProducts = (req , res ,next) => {
    const isAuth = req.session.isLoggedIn == true ? true : false ;
    Product.find({userId : req.user._id})
       .then( products => {
        res.render('admin/products' , {docTitle : 'All Products' , path: '/admin/products' , prods : products , isAuth : isAuth})
        })
        .catch(err => {
          console.log(err);
       });
   
}