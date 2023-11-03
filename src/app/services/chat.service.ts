import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";
import { io, Socket } from "socket.io-client";
import { environment } from "src/environments/environment";
import { MessageModel } from "../models/message.model";
import { AuthService } from "./auth.service";
import { RestService } from "./rest.service";

@Injectable({
  providedIn: "root",
})
export class ChatService {
  public canLoadMore = true;
  public loading = false;

  private socket: Socket;
  private messages: BehaviorSubject<MessageModel[]> = new BehaviorSubject([]);
  private userId: string;
  private readonly pagingLimit = 10;

  constructor(
    private readonly restService: RestService,
    private readonly authService: AuthService
  ) {
    this.authService.user.subscribe((user) => (this.userId = user.id));
  }

  public get messages$() {
    return this.messages.asObservable();
  }

  public loadMessages(friendId: string) {
    this.messages.next([]);
    this.loading = true;
    this.restService
      .getDirectMessages(friendId, 0, this.pagingLimit)
      .toPromise()
      .then((messages) => {
        this.messages.next([...messages].reverse());
        this.canLoadMore = messages.length === this.pagingLimit;
        this.loading = false;
      });
  }

  public loadMore(friendId: string) {
    const oldMessages = this.messages.value;
    this.loading = true;
    this.restService
      .getDirectMessages(friendId, oldMessages.length, this.pagingLimit)
      .toPromise()
      .then((messages) => {
        this.messages.next([...[...messages].reverse(), ...oldMessages]);
        this.canLoadMore = messages.length === this.pagingLimit;
        this.loading = false;
      });
  }

  public handleConnect(friendId: string) {
    this.socket = io(environment.socket_endpoint, {
      query: {
        session_token: this.authService.sessionToken,
      },
    });

    this.socket.emit("join", { roomId: `${this.userId}:${friendId}` });

    this.socket.on("messageToClient", (message) => {
      this.messages.next([...this.messages.value, new MessageModel(message)]);
    });
  }

  public sendMessage(message: string, receiver: string) {
    this.socket?.emit("message", {
      message,
      receiver,
      type: "direct",
    });
  }

  public handleDisconnect() {
    this.socket?.disconnect();
    this.canLoadMore = true;
    this.messages.next([]);
  }
}
