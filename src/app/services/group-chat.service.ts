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
export class GroupChatService {
  private socket: Socket;
  private messages: BehaviorSubject<MessageModel[]> = new BehaviorSubject([]);

  constructor(
    private readonly restService: RestService,
    private readonly authService: AuthService
  ) {}

  public get messages$() {
    return this.messages.asObservable();
  }

  public loadMessages(groupId: string) {
    this.messages.next([]);
    this.restService
      .getGroupMessages(groupId)
      .subscribe((messages) => this.messages.next(messages));
  }

  public handleConnect(groupId: string) {
    this.socket = io(environment.socket_endpoint, {
      query: {
        session_token: this.authService.sessionToken,
      },
    });

    this.socket.emit("join", { roomId: groupId });

    this.socket.on("messageToClient", (message) => {
      this.messages.next([...this.messages.value, new MessageModel(message)]);
    });
  }

  public sendMessage(message: string, groupId: string) {
    this.socket?.emit("message", {
      message,
      receiver: groupId,
      type: "room",
    });
  }

  public handleDisconnect() {
    this.socket?.disconnect();
  }
}
