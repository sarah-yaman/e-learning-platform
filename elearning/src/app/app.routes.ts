import { Routes } from '@angular/router';
import { HomeComponent } from './view/pages/home/home.component';
import { AboutComponent } from './view/pages/about/about.component';
import { LandingPageComponent } from './view/pages/landing-page/landing-page.component';
import { ViewComponent } from './view/view.component';
import { AdminComponent } from './admin/admin.component';
import { CoursesComponent } from './admin/pages/courses/courses.component';
import {CartComponent} from './view/pages/cart/cart.component'
import {OrderComponent} from "./view/pages/order/order.component";
import {OrdersComponent} from './admin/pages/orders/orders.component';
import {OrderDetailsComponent} from "./admin/pages/order-details/order-details.component";
import {LoginComponent} from './view/pages/login/login.component';
import {SignupComponent} from './view/pages/signup/signup.component';
import {PaymentComponent} from './view/pages/payment/payment.component';
import {authGuard} from './guards/auth.guard'

export const routes: Routes = [
    {path:"admin", component:AdminComponent, canActivate:[authGuard], children:[
        {path:"", redirectTo:"courses", pathMatch:"full"},
        {path:"courses", component:CoursesComponent},
        {path:"orders", component:OrdersComponent},
        {path:"order-details/:id", component:OrderDetailsComponent}

    ]}
    ,
    {path:"", component:ViewComponent, children:[
        {path:"", redirectTo:"home", pathMatch:"full"},
        {path:"home", component:LandingPageComponent},
        {path:"courses", component:HomeComponent},
        {path:"about", component: AboutComponent},
        {path:"cart", component:CartComponent},
        {path:"order", component:OrderComponent},
        {path:"payment", component:PaymentComponent},
        {path:"login", component:LoginComponent},
        {path:"signup", component:SignupComponent}
    ]},

];
