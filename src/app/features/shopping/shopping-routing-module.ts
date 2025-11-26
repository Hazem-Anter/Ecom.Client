import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

// Example route configurations for shopping feature
// import { ProductListComponent } from './pages/product-list/product-list.component';
// import { ProductDetailComponent } from './pages/product-detail/product-detail.component';

// const routes: Routes = [
//   { path: '', component: ProductListComponent },
//   { path: ':id', component: ProductDetailComponent }
// ];


const routes: Routes = [];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ShoppingRoutingModule { }
