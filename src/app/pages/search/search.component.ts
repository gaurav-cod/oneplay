import { Component, OnInit, OnDestroy } from "@angular/core";
import { UntypedFormControl } from "@angular/forms";
import { Title } from "@angular/platform-browser";
import { ActivatedRoute, Router } from "@angular/router";
import { NgxUiLoaderService } from "ngx-ui-loader";
import { zip } from "rxjs";
import { FriendModel } from "src/app/models/friend.model";
import { GameModel } from "src/app/models/game.model";
import { UserModel } from "src/app/models/user.model";
import { AvatarPipe } from "src/app/pipes/avatar.pipe";
import { GLinkPipe } from "src/app/pipes/glink.pipe";
import { AuthService } from "src/app/services/auth.service";
import { CountlyService } from "src/app/services/countly.service";
import { FriendsService } from "src/app/services/friends.service";
import { RestService } from "src/app/services/rest.service";
import Swal from "sweetalert2";

@Component({
  selector: "app-search",
  templateUrl: "./search.component.html",
  styleUrls: ["./search.component.scss"],
  providers: [AvatarPipe, GLinkPipe],
})
export class SearchComponent implements OnInit, OnDestroy {
  query: string;
  games: GameModel[] = [];
  users: UserModel[] = [];
  tab: "games" | "users";
  currentPage = 0;
  isLoading = false;
  canLoadMore = true;
  isFocused = false;

  queryControl = new UntypedFormControl("");

  private keyword = "";
  private keywordHash = "";
  private acceptedFriends: FriendModel[] = [];
  private pendingFriends: FriendModel[] = [];
  private dontClose = false;

  private user: UserModel;

  get keywordQuery() {
    if (!!this.keyword && !!this.keywordHash) {
      return {
        keyword: this.keyword,
        hash: this.keywordHash,
      };
    }
    return {};
  }

  get usertitle() {
    return this.user ? this.user.firstName + " " + this.user.lastName : "User";
  }

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly restService: RestService,
    private readonly title: Title,
    private readonly loaderService: NgxUiLoaderService,
    private readonly friendsService: FriendsService,
    private readonly gavatar: AvatarPipe,
    private readonly authService: AuthService,
    private readonly gLink: GLinkPipe,
    private readonly countlyService: CountlyService
  ) {
    this.authService.user.subscribe((u) => (this.user = u));
  }

  ngOnDestroy(): void {
    Swal.close();
    this.countlyService.endEvent("searchResultsViewMoreGames");
    this.countlyService.endEvent("searchResultsViewMoreUsers");
  }

  ngOnInit(): void {
    this.friendsService.friends.subscribe((f) => (this.acceptedFriends = f));
    this.friendsService.pendings.subscribe((f) => (this.pendingFriends = f));
    this.route.params.subscribe((params) => {
      this.route.queryParams.subscribe((query) => {
        this.tab = params.tab;
        this.query = query.q;
        this.title.setTitle("OnePlay | Search " + params.tab + " - " + query.q);
        this.canLoadMore = true;
        this.currentPage = 0;
        this.games = [];
        this.users = [];
        switch (this.tab) {
          case "games":
            this.loadGames();
            break;
          case "users":
            this.loadUsers();
            break;
          default:
            if (this.query == "") {
              this.loadGames();
            } else {
              this.laodGamesAndUsers();
            }
            break;
        }
      });
    });
    this.restService.search("", 0, 12).subscribe((response) => {
      this.games = response.results;
    });
  }

  search() {
    const path = ["search"];
    if (this.tab) {
      path.push(this.tab);
    }
    this.router.navigate(path, {
      queryParams: { q: this.queryControl.value },
      replaceUrl: true,
    });
  }

  viewGame(game: GameModel) {
    this.countlyService.addEvent("search", {
      keywords: this.query,
      actionDone: 'yes',
      actionType: 'gameClicked',
    })
    this.countlyService.endEvent("searchResultsViewMoreGames", {
      keywords: this.query,
      gameCardClicked: "yes",
      gameId: game.oneplayId,
      gameTitle: game.title,
    })

    this.router.navigate(["view", this.gLink.transform(game)], {
      queryParams: this.keywordQuery,
    });
  }

  searchNavigate(tab: "games" | "users") {
    this.countlyService.addEvent("search", {
      keywords: this.query,
      actionDone: 'yes',
      actionType: tab === 'games' ? 'seeMoreGames' : 'seeMoreUsers',
    })
    if (tab === "games") {
      this.countlyService.startEvent("searchResultsViewMoreGames", {
        discardOldData: true,
        data: {
          keywords: this.query,
          gameCardClicked: "no",
        },
      });
    }
    else {
      this.countlyService.startEvent("searchResultsViewMoreUsers", {
        discardOldData: true,
        data: {
          keywords: this.query,
          friendRequestClicked: "no",
        },
      });
    }
    this.router.navigate(["/search", tab], {
      queryParams: { q: this.query },
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

  getFriendAddIcon(friend: UserModel) {
    if (this.acceptedFriends.find((f) => f.user_id === friend.id)) {
      return "fa-user-check";
    } else if (this.pendingFriends.find((f) => f.user_id === friend.id)) {
      return "fa-user-clock";
    } else if (this.user.id === friend.id) {
      return "d-none";
    } else {
      return "fa-user-plus";
    }
  }

  onImgError(event) {
    event.target.src = "assets/img/default_bg.webp";
  }

  onUsersError(event) {
    event.target.src = "assets/img/defaultUser.svg";
  }

  private laodGamesAndUsers() {
    this.startLoading(0);
    zip([
      this.restService.search(this.query, 0, 4),
      this.restService.searchUsers(this.query, 0, 4),
    ]).subscribe({
      next: ([gRes, users]) => {
        this.games = gRes.results;
        this.keyword = gRes.keyword;
        this.keywordHash = gRes.keywordHash;
        this.users = users;
        this.canLoadMore = false;
        this.stopLoading(0);
      },
      error: (error) => {
        if (error.timeout) {
          this.router.navigateByUrl("/server-error");
        }
        this.stopLoading(0);
      },
    });
  }

  private loadGames() {
    this.startLoading(0);
    this.restService.search(this.query, 0, 12).subscribe(
      (response) => {
        this.games = response.results;
        this.keyword = response.keyword;
        this.keywordHash = response.keywordHash;
        if (this.games.length < 12) {
          this.canLoadMore = false;
        }
        this.stopLoading(0);
      },
      (error) => {
        if (error.timeout) {
          this.router.navigateByUrl("/server-error");
        }
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
        this.games = [...this.games, ...games.results];
        if (games.results.length < 12) {
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
        if (error.timeout) {
          this.router.navigateByUrl("/server-error");
        }
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

  addFriend(friend: UserModel) {
    this.countlyService.addEvent("search", {
      keywords: this.query,
      actionDone: 'yes',
      actionType: 'addFriend',
    })
    this.countlyService.endEvent("searchResultsViewMoreUsers", {
      userID: friend.id,
      keywords: this.query,
      friendRequestClicked: "yes",
    })
    if (this.user.id === friend.id) {
      return;
    }
    this.dontClose = true;
    const acceptedFriend = this.acceptedFriends.find(
      (f) => f.user_id === friend.id
    );
    const pendingFriend = this.pendingFriends.find(
      (f) => f.user_id === friend.id
    );
    if (acceptedFriend) {
      this.restService.deleteFriend(acceptedFriend.id).subscribe(
        () => {
          this.friendsService.deleteFriend(acceptedFriend);
        },
        (err) => this.showError(err)
      );
    } else if (pendingFriend) {
      this.restService.deleteFriend(pendingFriend.id).subscribe(
        () => {
          this.friendsService.cancelRequest(pendingFriend);
        },
        (err) => this.showError(err)
      );
    } else {
      this.restService.addFriend(friend.id).subscribe(
        (id) => {
          this.friendsService.addFriend(friend, id);
        },
        (err) => this.showError(err)
      );
    }
  }

  private showError(error) {
    Swal.fire({
      icon: "error",
      title: "Error Code: " + error.code,
      text: error.message,
    });
  }
}
