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
  private _$requests = new BehaviorSubject<FriendModel[]>([]);
  private _$unreadSenders = new BehaviorSubject<string[]>([]);

  get friends(): Observable<FriendModel[]> {
    return this._$friends.asObservable();
  }

  setFriends(friends: FriendModel[]) {
    this._$friends.next(friends);
  }

  get pendings(): Observable<FriendModel[]> {
    return this._$pendings.asObservable();
  }

  setPendings(pendings: FriendModel[]) {
    this._$pendings.next(pendings);
  }

  get requests(): Observable<FriendModel[]> {
    return this._$requests.asObservable();
  }

  setRequests(requests: FriendModel[]) {
    this._$requests.next(requests);
  }

  get unreadSenders(): Observable<string[]> {
    return this._$unreadSenders.asObservable();
  }

  setUnreadSenders(data: string[]) {
    this._$unreadSenders.next(data);
  }

  getFriendById(id: string): FriendModel {
    return this._$friends.value.find((friend) => friend.id === id);
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

  acceptRequest(friend: FriendModel) {
    this._$requests.next(
      this._$requests.getValue().filter((f) => f.id !== friend.id)
    );
    this._$friends.next([...this._$friends.getValue(), friend]);
  }

  declineRequest(friend: FriendModel) {
    this._$requests.next(
      this._$requests.getValue().filter((f) => f.id !== friend.id)
    );
  }

  updateOnlineStatus(friend: FriendModel, isOnline: boolean) {
    this._$friends.next(
      this._$friends.getValue().map((f) =>
        f.id === friend.id ? f.copyWith({ isOnline }) : f
      )
    );
  }
}
