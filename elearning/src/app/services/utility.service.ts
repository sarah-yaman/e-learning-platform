import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UtilityService {

  numOfItem:BehaviorSubject<number> = new BehaviorSubject(0)
  constructor() {
    this.cartItem()
   }

  cartItem(){
    let cart = localStorage.getItem("cart");
    if(cart){
      let cartItem = JSON.parse(cart);
      this.numOfItem.next(cartItem.length);
    }else{
      this.numOfItem.next(0)
    }
  }

  emptyCart(){
    localStorage.removeItem("cart");
  }


  // TOKen
  setToken(token:String){
    localStorage.setItem("token", `${token}`)

  }

  getToken(){
   return localStorage.getItem('token')
  }

  removeToken(){
    localStorage.removeItem("token");
  }
}
