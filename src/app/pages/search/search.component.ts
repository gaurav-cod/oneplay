import { Component, OnInit } from "@angular/core";
import { Title } from "@angular/platform-browser";
import { ActivatedRoute, Router } from "@angular/router";
import { NgxUiLoaderService } from "ngx-ui-loader";
import { GameModel } from "src/app/models/game.model";
import { UserModel } from "src/app/models/user.model";
import { RestService } from "src/app/services/rest.service";

@Component({
  selector: "app-search",
  templateUrl: "./search.component.html",
  styleUrls: ["./search.component.scss"],
})
export class SearchComponent implements OnInit {
  query: string;
  games: GameModel[] = [];
  users: UserModel[] = [];
  tab: "games" | "users" = "games";
  currentPage = 0;
  isLoading = false;
  canLoadMore = true;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly restService: RestService,
    private readonly title: Title,
    private readonly loaderService: NgxUiLoaderService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      this.route.queryParams.subscribe((query) => {
        if (!(params.tab === "games" || params.tab === "users")) {
          this.router.navigate(["search", "games"], {
            queryParams: { q: query.q },
          });
        }
        this.tab = params.tab;
        this.query = query.q;
        this.title.setTitle("OnePlay | Search " + params.tab + " - " + query.q);
        this.canLoadMore = true;
        this.currentPage = 0;
        switch (this.tab) {
          case "games":
            this.loadGames();
            break;
          case "users":
            this.loadUsers();
            break;
        }
      });
    });
  }

  onScroll() {
    switch (this.tab) {
      case "games":
        this.loadMoreGames();
        break;
      case "users":
        this.loadMoreUsers();
        break;
    }
  }
  
  changeTab(tab: "games" | "users") {
    this.router.navigate(["search", tab], {
      queryParams: { q: this.query },
    });
  }

  private loadGames() {
    this.startLoading(0);
    this.restService.search(this.query, 0, 12).subscribe(
      (response) => {
        this.games = response;
        if (this.games.length < 12) {
          this.canLoadMore = false;
        }
        this.stopLoading(0);
      },
      (error) => {
        this.stopLoading(0);
      }
    );
  }

  private loadMoreGames() {
    if (this.isLoading || !this.canLoadMore) {
      return;
    }
    this.startLoading(this.currentPage + 1);
    this.restService.search(this.query, this.currentPage + 1, 12).subscribe(
      (games) => {
        this.games = [...this.games, ...games];
        if (games.length < 12) {
          this.canLoadMore = false;
        }
        this.stopLoading(this.currentPage + 1);
        this.currentPage++;
      },
      (error) => {
        this.stopLoading(this.currentPage + 1);
      }
    );
  }

  private loadMoreUsers() {
    if (this.isLoading || !this.canLoadMore) {
      return;
    }
    this.startLoading(this.currentPage + 1);
    this.restService
      .searchUsers(this.query, this.currentPage + 1, 12)
      .subscribe(
        (users) => {
          this.users = [...this.users, ...users];
          if (users.length < 12) {
            this.canLoadMore = false;
          }
          this.stopLoading(this.currentPage + 1);
          this.currentPage++;
        },
        (error) => {
          this.stopLoading(this.currentPage + 1);
        }
      );
  }

  private loadUsers() {
    this.startLoading(0);
    this.restService.searchUsers(this.query, 0, 12).subscribe(
      (response) => {
        this.users = response;
        if (this.users.length < 12) {
          this.canLoadMore = false;
        }
        this.stopLoading(0);
      },
      (error) => {
        this.stopLoading(0);
      }
    );
  }

  private startLoading(page: number) {
    if (page === 0) {
      this.loaderService.start();
    } else {
      this.loaderService.startLoader("scroll");
    }
    this.isLoading = true;
  }

  private stopLoading(page: number) {
    if (page === 0) {
      this.loaderService.stop();
    } else {
      this.loaderService.stopLoader("scroll");
    }
    this.isLoading = false;
  }
}
