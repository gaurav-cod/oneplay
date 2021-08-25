import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from './sidebar/sidebar.component';
import { NavbarComponent } from './navbar/navbar.component';
import { FooterComponent } from './footer/footer.component';
import { RouterModule } from '@angular/router';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ConsoleComponent } from './console/console.component';
import { SafePipe } from '../pipes/safe.pipe';

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    NgbModule
  ],
  declarations: [
    FooterComponent,
    NavbarComponent,
    SidebarComponent,
    ConsoleComponent,
    SafePipe,
  ],
  exports: [
    FooterComponent,
    NavbarComponent,
    SidebarComponent,
    ConsoleComponent
  ]
})
export class ComponentsModule { }
