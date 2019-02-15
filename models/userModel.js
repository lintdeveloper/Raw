const mongodb = require('mongodb');

const getDb = require('../util/database').getDb ;

class UserModel {
 
    constructor(username , email , cart , id){
        this.name = username ;
        this.email = email;
        this.cart = cart ;
        this._id = id ;
    }

    //TO SAVE A USER
    save(){
        const db = getDb();
        return db.collection('users').insertOne(this) ;
    }

    //ADD PRODUCT TO THE CART
    addToCart(productId , price){
        const productIndex = this.cart.item.findIndex(p => p.prodId.toString() === productId.toString()) ;
        let newQty = 1 ;
        const updatedCartItem = [...this.cart.item] ;

        if(productIndex >= 0){
           updatedCartItem[productIndex].qty = this.cart.item[productIndex].qty + 1 ;
        }
        else{
            updatedCartItem.push({prodId : new mongodb.ObjectId(productId) , qty : newQty , price : price}) ;
        }

       const updatedCart = {
            item : updatedCartItem
        } ;

        const db = getDb();
       return db.collection('users').updateOne({_id : new mongodb.ObjectId(this._id)} , {$set: {cart : updatedCart}}) ;

    }


    //RETURN ALL THE PRODUCTS IN CART WITH QUANTITY
    getCart(){
       const db = getDb();
       const prodIds = this.cart.item.map(i => {
           return i.prodId ;
       }) ;

      return db.collection('products').find({_id : {$in : prodIds}}).toArray()
       .then(products => {
        return products.map(p => {
           return {...p , qty : this.cart.item.find(i => {
                return i.prodId.toString() === p._id.toString() ;
           }).qty 
          };
        })
       }) 
     
    }


    //DELETING CART ITEM
    deleteItemFromCart(prodId){
        const updatedCartItem = this.cart.item.filter(p => {
            return p.prodId.toString() !== prodId.toString();
        });
        const db = getDb();
        return db.collection('users').updateOne({_id : new mongodb.ObjectId(this._id)} , {$set : {cart :{item : updatedCartItem}}}) ;
    }




    //FIND USER BY ID
    static findById(id){
        const db = getDb();
        return db.collection('users').findOne({ _id : new mongodb.ObjectId(id)}) ;
    }


    //ADD ORDER FROM CART
    addOrder(){
        let order ;
        const d = new Date() ;
        const date = d.getDate() + "/" + d.getMonth() + "/" + d.getFullYear() ;
        const time = d.getHours() + ":" + d.getMinutes() ;
       return this.getCart()
        .then( products => {
            order = {
                item : products ,
                date : date ,
                time : time ,
                user : {
                    _id : new mongodb.ObjectId(this._id) ,
                    name : this.name 
                }
            }
            const db = getDb();
            return db.collection('orders').insertOne(order) ;

        })
        .then(result => {
            const db= getDb();
            this.cart.item = [] ;
          return  db.collection('users').updateOne({_id : new mongodb.ObjectId(this._id)} , {$set : {cart : {item : []}}} );
        })
        .catch(err => {
            console.log(err);
        });
    }

}

module.exports = UserModel ;