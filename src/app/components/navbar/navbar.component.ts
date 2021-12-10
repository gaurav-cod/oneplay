import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { ROUTES } from '../sidebar/sidebar.component';
import { Location } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { UserModel } from 'src/app/models/user.model';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {
  public focus;
  public listTitles: any[];
  public location: Location;
  public query = new FormControl('');
  private user: UserModel;

  @Output() toggleFriends = new EventEmitter();

  get title() {
    return this.user ? (this.user.firstName + ' ' + this.user.lastName) : 'User';
  }

  constructor(location: Location,private readonly authService: AuthService, private readonly router: Router) {
    this.location = location;
    this.authService.user.subscribe(u => this.user = u);
  }

  ngOnInit() {
    this.listTitles = ROUTES.filter(listTitle => listTitle);
  }

  getTitle(){
    var titlee = this.location.prepareExternalUrl(this.location.path());
    if(titlee.charAt(0) === '#'){
        titlee = titlee.slice( 1 );
    }

    for(var item = 0; item < this.listTitles.length; item++){
        if(this.listTitles[item].path === titlee) {
            return this.listTitles[item].title;
        }
    }
    return 'Oneplay';
  }

  toggleFriendsList() {
    this.toggleFriends.emit();
  }

  search() {
    this.router.navigate(['/search'], { queryParams: { q: this.query.value } });
  }

  logout() {
    this.authService.logout();
  }

}
