import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BookingFormComponent } from './components/booking-form/booking-form.component';
import { NotFoundComponent } from './components/parts/not-found/not-found.component';

const routes: Routes = [
  {
    path: 'booking/:id',
    component: BookingFormComponent,
  },
  {
    path: '**',
    component: NotFoundComponent,
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
