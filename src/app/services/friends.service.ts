import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable } from "rxjs";
import { FriendModel } from "../models/friend.model";
import { UserModel } from "../models/user.model";

@Injectable({
  providedIn: "root",
})
export class FriendsService {
  private _$friends = new BehaviorSubject<FriendModel[]>([]);
  private _$pendings = new BehaviorSubject<FriendModel[]>([]);

  get friends(): Observable<FriendModel[]> {
    return this._$friends.asObservable();
  }

  set friends(friends: Observable<FriendModel[]>) {
    friends.subscribe((friends) => this._$friends.next(friends));
  }

  get pendings(): Observable<FriendModel[]> {
    return this._$pendings.asObservable();
  }

  set pendings(pendings: Observable<FriendModel[]>) {
    pendings.subscribe((pendings) => this._$pendings.next(pendings));
  }

  addFriend(friend: UserModel, id: string) {
    this._$pendings.next([
      ...this._$pendings.getValue(),
      new FriendModel({ ...friend.json, id, status: "pending" }),
    ]);
  }

  cancelRequest(friend: FriendModel) {
    this._$pendings.next(
      this._$pendings.getValue().filter((f) => f.id !== friend.id)
    );
  }

  deleteFriend(friend: FriendModel) {
    this._$friends.next(
      this._$friends.getValue().filter((f) => f.id !== friend.id)
    );
  }
}
