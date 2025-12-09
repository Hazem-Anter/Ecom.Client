import { Component, inject } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';
import { CreatePaymentVM, PaymentMethod, PaymentStatus, PaymentResultVM } from '../../../core/models/payment.models';
import { AuthService } from '../../../core/services/auth-service';
import { PaymentService } from '../payments.service';
import { PaymentStateService } from '../../../core/services/payment-state-service';
import { OrderService } from '../../../core/services/order-service';
import { StripeService } from '../../../core/services/stripe-service';
import { MaterialModule } from '../../../shared/material/material-module';

@Component({
  selector: 'app-summary-step',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MaterialModule,
  ],
  template: `
    <mat-card class="!bg-gray-800/80 !backdrop-blur-md !text-white !rounded-2xl !border !border-gray-700 !shadow-2xl overflow-hidden relative p-8 max-w-2xl mx-auto">
      
      <!-- Decorative Glow -->
      <div class="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-blue-500"></div>

      <!-- Header -->
      <div class="mb-8 text-center">
        <div class="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-blue-500/20">
          <mat-icon class="text-blue-400 !w-8 !h-8 !text-[32px]">assignment_turned_in</mat-icon>
        </div>
        <h2 class="text-3xl font-bold tracking-tight text-white">Order Summary</h2>
        <p class="text-gray-400 mt-1">Please review your details before completing the order.</p>
      </div>

      <div class="space-y-6">
        
        <!-- Shipping Section -->
        <div class="bg-gray-900/50 rounded-xl p-5 border border-gray-700/50 flex items-start gap-4">
          <mat-icon class="text-gray-500 mt-1">location_on</mat-icon>
          <div>
            <h3 class="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Shipping Address</h3>
            <p class="text-gray-200 text-lg leading-snug">
              {{ service.addressData()?.street }}
            </p>
            <p class="text-gray-400">
              {{ service.addressData()?.city }}, {{ service.addressData()?.country }}
            </p>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          <!-- Delivery Method -->
          <div class="bg-gray-900/50 rounded-xl p-5 border border-gray-700/50 flex items-start gap-4">
            <mat-icon class="text-gray-500 mt-1">local_shipping</mat-icon>
            <div>
              <h3 class="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Delivery</h3>
              <p class="text-gray-200 font-medium text-lg capitalize">
                {{ service.deliveryType() }}
              </p>
              <p class="text-gray-500 text-sm">Standard Shipping</p>
            </div>
          </div>

          <!-- Payment Method -->
          <div class="bg-gray-900/50 rounded-xl p-5 border border-gray-700/50 flex items-start gap-4">
            <mat-icon class="text-gray-500 mt-1">credit_card</mat-icon>
            <div>
              <h3 class="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Payment</h3>
              <p class="text-gray-200 font-medium text-lg">
                Stripe Secure
              </p>
              <p class="text-gray-500 text-sm">**** **** **** 4242</p>
            </div>
          </div>
        </div>

      </div>

      <mat-divider class="!bg-gray-700 !my-8"></mat-divider>

      <!-- Total Section -->
      <div class="flex flex-col items-center justify-center mb-8">
        <span class="text-gray-400 text-sm uppercase tracking-widest font-semibold mb-2">Total Amount</span>
        <span class="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400 drop-shadow-lg">
          {{ total | currency }}
        </span>
      </div>

      <!-- Action Button -->
      <button mat-flat-button (click)="placeOrder()"
        class="!w-full !h-14 !text-lg !rounded-xl 
               !bg-gradient-to-r !from-blue-600 !to-indigo-600 
               hover:!from-blue-500 hover:!to-indigo-500 
               !text-white !shadow-lg hover:!shadow-blue-500/25 
               hover:scale-[1.01] active:scale-95 transition-all duration-300 
               flex items-center justify-center gap-2 group">
        <span>Place Order</span>
        <mat-icon class="group-hover:translate-x-1 transition-transform">arrow_forward</mat-icon>
      </button>

    </mat-card>
  `,
  styles: [`
    /* Ensure icons are centered properly in the flex containers */
    mat-icon {
      height: 24px;
      width: 24px;
      font-size: 24px;
    }
  `]
})




export class SummaryStepComponent {

  service = inject(PaymentService);
  paymentState = inject(PaymentStateService);
  orderService = inject(OrderService);
  router = inject(Router);
  stripeService = inject(StripeService);
  auth = inject(AuthService);
  paymentApi = inject(PaymentService);
  get total() {
    return this.paymentState.getTotal();
  }



  placeOrder() {

    const addr = this.service.addressData();
    if (!addr) return;

    const shippingAddress = `${addr.street}, ${addr.city}, ${addr.country}, ${addr.zipCode}`;

    // 1️⃣ Create Order
    this.orderService.createOrder(shippingAddress).subscribe({
      next: (orderRes) => {

        if (!orderRes.isSuccess || !orderRes.result) {
          console.error("Order creation failed");
          return;
        }

        const orderId = orderRes.result.id;

        // 2️⃣ Create Payment Record BEFORE Stripe Call
        const paymentModel: CreatePaymentVM = {
          orderId: orderId,
          paymentMethod: PaymentMethod.Card,
          totalAmount: this.paymentState.getTotal(),
          createdBy: this.auth.currentUser()?.id
        };
        console.log(paymentModel);

        this.paymentApi.createPayment(paymentModel).subscribe({
          next: (paymentRes) => {

            if (!paymentRes || !paymentRes.id) {
              console.error("Payment creation failed");
              return;
            }

            const paymentId = paymentRes.id;

            // 3️⃣ Create Stripe Session (new version with isSuccess)
            this.stripeService.createCheckoutSession(orderId).subscribe({
              next: (sessionRes) => {

                if (!sessionRes || !sessionRes.url) {
                  console.error("Stripe session failed");
                  return;
                }
                window.location.href = sessionRes.url!;
                // const status = sessionRes.isSuccess
                //     ? PaymentStatus.Completed
                //     : PaymentStatus.Failed;

                //     console.log("Stripe session response:", sessionRes);

                // // 4️⃣ Update Payment Status BEFORE redirect
                // const statusModel: PaymentResultVM = {
                //     paymentId: paymentId,
                //     transactionId: null,
                //     status: status
                // };

                // this.paymentApi.updatePaymentStatus(statusModel).subscribe({
                //     next: () => {
                //         console.log("Payment status updated:", status);

                //         // 5️⃣ Redirect user to Stripe
                //         window.location.href = sessionRes.url!;
                //     },
                //     error: err => console.error("Payment status update failed", err)
                // });

              },
              error: err => console.error("Stripe session error:", err)
            });

          },
          error: err => console.error("Payment creation error:", err)
        });

      },
      error: err => console.error("Order reation error:", err)
    });
  }


}
