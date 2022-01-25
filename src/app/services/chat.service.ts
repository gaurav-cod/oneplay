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
  private socket: Socket;
  private messages: BehaviorSubject<MessageModel[]> = new BehaviorSubject([]);
  private userId: string;

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
    this.restService
      .getDirectMessages(friendId)
      .subscribe((messages) => this.messages.next(messages));
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

  public sendMessage(
    message: string,
    receiver: string,
  ) {
    this.socket?.emit("message", {
      message,
      receiver,
      type: "direct",
    });
  }

  public handleDisconnect() {
    this.socket?.disconnect();
  }
}
