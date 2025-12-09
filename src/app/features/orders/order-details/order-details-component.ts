import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../../../core/services/api-service';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { OrderStatusStepperComponent } from '../order-status-stepper/order-status-stepper-component';
import { MatDividerModule } from '@angular/material/divider';
import { MaterialModule } from '../../../shared/material/material-module';

@Component({
  standalone: true,
  selector: 'app-order-details',
  imports: [
    CommonModule,
    MatCardModule,
    MatTableModule,
    MatDividerModule,
    OrderStatusStepperComponent
  ],
  template: `
    <!-- Outer Container: Dark Gradient Background -->
    <div class="min-h-[calc(100vh-80px)] bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 px-4 py-8">
      <div class="container mx-auto max-w-5xl">

        <!-- Page Header -->
        <div class="mb-8 pl-3 border-l-4 border-blue-500">
          <h1 class="text-3xl font-bold text-white mb-2 tracking-tight">Order Details</h1>
          <p class="text-gray-400">View and track your order status</p>
        </div>

        <!-- Status Stepper (Assuming this component handles its own dark mode styles or is transparent) -->
        <div class="mb-8 bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
           <app-order-status-stepper [status]="order()?.status"></app-order-status-stepper>
        </div>

        @if (order(); as o) {
          <mat-card class="!bg-gray-800/80 !backdrop-blur-md !text-white !rounded-2xl !border !border-gray-700 !shadow-2xl overflow-hidden relative">
            
            <!-- Decorative Top Glow -->
            <div class="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500"></div>

            <div class="p-8">
              <!-- HEADER -->
              <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                  <h2 class="text-2xl font-bold text-white flex items-center gap-3">
                    <span class="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-400">
                       <i class="material-icons">receipt</i>
                    </span>
                    Order #{{ o.id }}
                  </h2>
                  <p class="text-gray-400 text-sm mt-1 ml-[52px]">Placed on {{ o.createdOn | date:'mediumDate' }}</p>
                </div>

                <!-- Dynamic Status Badge -->
                <div [class]="'px-4 py-1.5 rounded-full text-sm font-bold uppercase tracking-wider border ' + getStatusClass(o.status)">
                  {{ o.status }}
                </div>
              </div>

              <mat-divider class="!bg-gray-700 !mb-8"></mat-divider>

              <!-- ORDER INFO GRID -->
              <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                
                <!-- Info Item 1 -->
                <div class="bg-gray-900/50 rounded-xl p-4 border border-gray-700/50">
                  <h4 class="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Current Status</h4>
                  <p class="text-lg font-medium text-white flex items-center gap-2">
                    {{ o.status }}
                  </p>
                </div>

                <!-- Info Item 2 -->
                <div class="bg-gray-900/50 rounded-xl p-4 border border-gray-700/50">
                  <h4 class="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Tracking Number</h4>
                  <p class="text-lg font-mono text-gray-300">
                    {{ o.trackingNumber || 'Processing...' }}
                  </p>
                </div>

                <!-- Info Item 3 -->
                <div class="bg-gray-900/50 rounded-xl p-4 border border-gray-700/50">
                  <h4 class="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Estimated Delivery</h4>
                  <p class="text-lg font-medium text-white">
                    {{ o.deliveryDate ? (o.deliveryDate | date:'mediumDate') : 'Pending' }}
                  </p>
                </div>

              </div>

              <!-- ITEMS TABLE -->
              <h3 class="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <i class="material-icons text-gray-400">shopping_bag</i> Items
              </h3>

              <div class="overflow-hidden rounded-xl border border-gray-700/50">
                <table mat-table [dataSource]="o.items" class="w-full !bg-gray-900/30">

                  <!-- Product Column -->
                  <ng-container matColumnDef="productName">
                    <th mat-header-cell *matHeaderCellDef class="!pl-6 !text-gray-400 !bg-gray-800/50"> Product </th>
                    <td mat-cell *matCellDef="let item" class="!pl-6 !py-4 text-gray-200 font-medium">
                      {{ item.productTitle }}
                    </td>
                  </ng-container>

                  <!-- Qty -->
                  <ng-container matColumnDef="quantity">
                    <th mat-header-cell *matHeaderCellDef class="!text-gray-400 !bg-gray-800/50"> Qty </th>
                    <td mat-cell *matCellDef="let item" class="text-gray-400">
                      x{{ item.quantity }}
                    </td>
                  </ng-container>

                  <!-- Total -->
                  <ng-container matColumnDef="totalPrice">
                    <th mat-header-cell *matHeaderCellDef class="!pr-6 !text-right !text-gray-400 !bg-gray-800/50"> Total </th>
                    <td mat-cell *matCellDef="let item" class="!pr-6 !text-right text-white font-semibold">
                      {{ item.totalPrice | currency }}
                    </td>
                  </ng-container>

                  <tr mat-header-row *matHeaderRowDef="columns" class="!h-12 border-b !border-gray-700"></tr>
                  <tr mat-row *matRowDef="let row; columns: columns" class="!h-16 border-b !border-gray-700/30 hover:!bg-gray-700/20 transition-colors last:border-0"></tr>
                </table>
              </div>

              <!-- ORDER TOTAL FOOTER -->
              <div class="mt-8 flex justify-end">
                <div class="bg-gray-900/80 rounded-2xl p-6 border border-gray-700 w-full md:w-auto min-w-[250px]">
                  <div class="flex justify-between items-center mb-2">
                    <span class="text-gray-400">Subtotal</span>
                    <span class="text-gray-300">{{ o.totalAmount | currency }}</span>
                  </div>
                  <div class="flex justify-between items-center mb-4 pb-4 border-b border-gray-700">
                    <span class="text-gray-400">Shipping</span>
                    <span class="text-green-400">Free</span>
                  </div>
                  <div class="flex justify-between items-center">
                    <span class="text-white font-bold text-lg">Total</span>
                    <span class="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">
                      {{ o.totalAmount | currency }}
                    </span>
                  </div>
                </div>
              </div>

            </div>
          </mat-card>
        }
      </div>
    </div>

  `,
  styles: `.order-details-container {
  max-width: 900px;
  margin: 30px auto;
  padding: 0 20px;
}

.page-title {
  font-size: 28px;
  font-weight: 600;
  margin-bottom: 20px;
}

.status-stepper {
  margin-bottom: 25px;
}

.order-card {
  padding: 25px;
  border-radius: 14px;
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;

  .sub {
    color: #666;
    font-size: 14px;
  }
}

.status-badge {
  padding: 6px 14px;
  border-radius: 20px;
  font-weight: 600;
  font-size: 14px;
  text-transform: capitalize;
  color: white;

  &.pending {
    background-color: #f5a623;
  }
  &.processing {
    background-color: #1976d2;
  }
  &.shipped {
    background-color: #42a5f5;
  }
  &.delivered {
    background-color: #4caf50;
  }
  &.cancelled {
    background-color: #d32f2f;
  }
}

.info-grid {
  margin: 20px 0;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 15px;

  .info-item {
    h4 {
      margin: 0;
      font-weight: 600;
      font-size: 14px;
      color: #555;
    }

    p {
      margin-top: 4px;
      font-size: 16px;
      font-weight: 500;
    }
  }
}

.section-title {
  margin-top: 25px;
  margin-bottom: 10px;
  font-size: 20px;
  font-weight: 600;
}

.items-table {
  width: 100%;
  margin-bottom: 20px;

  .row-product {
    display: flex;
    align-items: center;

    .title {
      font-size: 16px;
      font-weight: 500;
    }
  }
}

.order-total {
  margin-top: 25px;
  display: flex;
  justify-content: space-between;
  font-size: 20px;
  font-weight: 600;

  span {
    color: #1976d2;
  }
}
`
})


export class OrderDetailsComponent implements OnInit {

  private route = inject(ActivatedRoute);
  private api = inject(ApiService);

  order = signal<any | null>(null);
  columns = ['productName', 'quantity', 'totalPrice'];

  statusLabels: Record<number, string> = {
    0: 'Pending',
    1: 'Processing',
    2: 'Shipped',
    3: 'Delivered'
  };

  ngOnInit() {
    const orderId = this.route.snapshot.paramMap.get('id');
    this.loadOrder(orderId!);
  }

  loadOrder(id: string) {
    this.api.get<any>(`api/order/${id}`).subscribe(res => {
      if (res.isSuccess) {
        this.order.set(res.result);
      }
    });
  }

  getStatusClass(status: string): string {
    const s = status.toLowerCase();
    if (s === 'pending') return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
    if (s === 'processing') return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
    if (s === 'shipped') return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20';
    if (s === 'delivered') return 'bg-green-500/10 text-green-400 border-green-500/20';
    if (s === 'cancelled') return 'bg-red-500/10 text-red-400 border-red-500/20';
    return 'bg-gray-700 text-gray-300 border-gray-600';
  }
  
}
