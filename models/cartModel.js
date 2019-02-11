const fs = require('fs');
const path = require('path');

const rootDir = require('../util/path');
const cartFile = path.join(rootDir , 'data' , 'cart.json');

module.exports = class Cart{
    
    // METHOD TO ADD PRODUCT IN CART
    static addProduct(id , price){
      
        fs.readFile(cartFile , (err , content) => {
            let cart = {products: [] , total: 0 };
        
            if(!err){
                cart = JSON.parse(content);
            }

            const existingProductIndex = cart.products.findIndex(p => p.productId === id) ;
            const existingProduct = cart.products[existingProductIndex];
            let updatedProduct ;

            if(existingProduct){
                updatedProduct = {...existingProduct};
                updatedProduct.qty = updatedProduct.qty + 1 ;
                cart.products = [...cart.products] ;
                cart.products[existingProductIndex] = updatedProduct;
            }
            else{
                updatedProduct = {productId: id , qty : 1}
                cart.products = [...cart.products , updatedProduct] ;
            }

            cart.total = cart.total + +price ;

            fs.writeFile(cartFile , JSON.stringify(cart) , (err) =>{
                console.log(err);
            });

        });
        
    }

    //METHOD TO DELETE A PRODUCT FROM CART
    static deleteProductFromCart(id , price){
        fs.readFile(cartFile , (err , content) =>{
            if(!err){
                let cart = JSON.parse(content);
                const existingProduct = cart.products.find(p=> p.productId === id);
                const qty = existingProduct.qty ;
                const updatedProducts = cart.products.filter(p => p.productId !== id);
                cart.products = updatedProducts ;
                cart.total = cart.total - qty*price ;
                
                fs.writeFile(cartFile, JSON.stringify(cart) , (err)=>{
                    console.log(err);
                });
            }
        });
    }


    //METHOD TO FETCH CART
    static fetchCart(cb){
        fs.readFile(cartFile , (err , content) =>{
            if(!err){
                let cart = JSON.parse(content);
                cb(cart);
            }
            else{
                cb(null) ;
            }
        });
    }

}