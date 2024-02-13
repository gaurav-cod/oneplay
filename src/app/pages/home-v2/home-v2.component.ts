import { Component, OnDestroy, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { Subscription } from 'rxjs';
import { GameFeedModel } from 'src/app/models/gameFeed.model';
import { UserModel } from 'src/app/models/user.model';
import { AuthService } from 'src/app/services/auth.service';
import { RestService } from 'src/app/services/rest.service';
import Swal from "sweetalert2";

@Component({
  selector: 'app-home-v2',
  templateUrl: './home-v2.component.html',
  styleUrls: ['./home-v2.component.scss']
})
export class HomeV2Component implements OnInit, OnDestroy {

  public heroBannerRow: GameFeedModel;

  private _feedSubscription: Subscription;
  private _paramSubscription: Subscription;
  private _userSubscription: Subscription;

  private userDetails: UserModel | null = null;

  constructor(
    private readonly restService: RestService,
    private readonly activatedRoute: ActivatedRoute,
    private readonly router: Router,
    private readonly title: Title,
    private readonly loaderService: NgxUiLoaderService,
    private readonly authService: AuthService
  ) { }

  ngOnInit(): void {

    this.title.setTitle("Home");
    this.loaderService.start();

    this._paramSubscription = this.activatedRoute.params.subscribe({
      next: (params)=> {
        this._feedSubscription?.unsubscribe();
        this._feedSubscription = this.restService.getHomeFeed().subscribe({
          next: (response) => {
            const feeds = response.filter((feed)=> feed.games.length > 0);
            this.heroBannerRow = feeds.filter((feed)=> feed.type === "header").at(0);
          }, error: (error)=> {
            this.loaderService.stop();
            if (error.timeout) {
              this.router.navigateByUrl("/server-error");
            }
          }
        })

        this._userSubscription = this.authService.user.subscribe((user) => {
          this.userDetails = user;
        });
      }
    })
  }
  ngOnDestroy(): void {
    this._feedSubscription?.unsubscribe();
    this._paramSubscription?.unsubscribe();
    Swal.close();
  }
}
