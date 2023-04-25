import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from "@angular/core";
import { FormControl, Validators } from "@angular/forms";
import { Meta, Title } from "@angular/platform-browser";
import { ActivatedRoute } from "@angular/router";
import { of } from "rxjs";
import { VideoWithGameId } from "src/app/interface";
import { GameModel } from "src/app/models/game.model";
import { MessageModel } from "src/app/models/message.model";
import { UserModel } from "src/app/models/user.model";
import { VideoModel } from "src/app/models/video.model";
import { AvatarPipe } from "src/app/pipes/avatar.pipe";
import { AuthService } from "src/app/services/auth.service";
import { RestService } from "src/app/services/rest.service";
import { StreamChatService } from "src/app/services/stream-chat.service";
import { memoize } from "src/app/utils/memoize.util";

@Component({
  selector: "app-stream",
  templateUrl: "./stream.component.html",
  styleUrls: ["./stream.component.scss"],
  providers: [AvatarPipe],
})
export class StreamComponent implements OnInit, OnDestroy, AfterViewInit {
  chats: MessageModel[] = [];
  game: GameModel;
  video: VideoModel;
  topVideos: VideoModel[] = [];

  message = new FormControl("", Validators.required);

  user: UserModel = {} as UserModel;

  @ViewChild("chatBox") chatBox: ElementRef<HTMLUListElement>;

  get playing() {
    return this.video?.sourceLink.replace("watch?v=", "embed/") || "";
  }

  constructor(
    private readonly route: ActivatedRoute,
    private readonly title: Title,
    private readonly meta: Meta,
    private readonly restService: RestService,
    private readonly streamChatService: StreamChatService,
    private readonly authService: AuthService,
    private readonly gavatar: AvatarPipe,
  ) {
    this.authService.user.subscribe((user) => (this.user = user));
    this.streamChatService.messages$.subscribe((chats) => {
      this.chats = chats;
    });
  }

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      const data: VideoWithGameId = JSON.parse(decodeURIComponent(params.id));
      this.title.setTitle("OnePlay | Watch " + data.video.title);
      this.meta.addTags([
        { name: "keywords", content: data.video.creatorName },
        { name: "description", content: data.video.description },
      ]);
      this.video = data.video;
      this.restService.getGameDetails(data.video.gameId).subscribe((game) => {
        this.game = game;
      });
      this.restService.getVideos(data.video.gameId).subscribe((videos) => {
        this.topVideos = videos;
      });
      this.streamChatService.loadMessages(data.video.contentId);
      this.streamChatService.handleDisconnect();
      this.streamChatService.handleConnect(data.video.contentId);
    });
  }

  ngOnDestroy(): void {
    this.streamChatService.handleDisconnect();
  }

  ngAfterViewInit(): void {
    this.streamChatService.messages$.subscribe((msg) => {
      setTimeout(() => {
        this.scrollToBottom();
      }, 10);
    });
  }

  sendMessage() {
    if (this.message.valid) {
      this.streamChatService.sendMessage(this.message.value, this.video.contentId);
      this.message.reset();
    }
  }

  @memoize()
  getSenderName(message: MessageModel) {
    if (message.sender === this.user.id) {
      return of(this.user.firstName + " " + this.user.lastName);
    }
    return this.restService.getName(message.sender);
  }

  isUserSender(message: MessageModel) {
    return message.sender === this.user.id;
  }

  private scrollToBottom() {
    this.chatBox.nativeElement.scrollTop =
      this.chatBox.nativeElement.scrollHeight;
  }

  onImgError(event, video: VideoModel) {
    event.target.src = this.gavatar.transform(video.creatorName)
  }
}
