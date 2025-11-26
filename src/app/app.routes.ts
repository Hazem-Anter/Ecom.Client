import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';


// export const routes: Routes = [];

export const routes: Routes = [
  {
    path: 'authentication',
    loadChildren: () =>
      import('./features/authentication/authentication-module').then(m => m.AuthenticationModule)
  },
  {
    path: 'shopping',
    loadChildren: () =>
      import('./features/shopping/shopping-module').then(m => m.ShoppingModule)
  },
  {
    path: 'cart',
    loadChildren: () =>
      import('./features/cart/cart-module').then(m => m.CartModule)
  },
  {
    path: 'payments',
    loadChildren: () =>
      import('./features/payments/payments-module').then(m => m.PaymentsModule)
  },
  {
    path: 'orders',
    loadChildren: () =>
      import('./features/orders/orders-module').then(m => m.OrdersModule)
  },
  {
    path: '',
    redirectTo: 'shopping',
    pathMatch: 'full'
  },
  {
    path: '**',
    redirectTo: 'shopping'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
