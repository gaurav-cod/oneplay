import { Component, OnDestroy, OnInit } from "@angular/core";
import { Location } from "@angular/common";
import { Title } from "@angular/platform-browser";
import { ActivatedRoute } from "@angular/router";
import { GameSessionRO } from "src/app/interface";
import { RestService } from "src/app/services/rest.service";
import Swal from "sweetalert2";
import { AuthService } from "src/app/services/auth.service";
import { Subscription } from "rxjs";
import { CountlyService } from "src/app/services/countly.service";

const qnaData = [
  [
    { q: "Which network you were using?", a: ["5G", "Wifi 2.4ghz", "Others"] },
    {
      q: "Was the stream/picture quality pixelated and lagging?",
      a: ["Yes", "No"],
    },
  ],
  [
    { q: "Which network you were using?", a: ["5G", "Wifi 2.4ghz", "Others"] },
    {
      q: "Was the stream/picture quality pixelated and lagging?",
      a: ["Yes", "No"],
    },
  ],
  [
    {
      q: "Do you already own a gaming pc or laptop or console?",
      a: ["Yes", "No"],
    },
    { q: "Was the picture/stream freezing?", a: ["Yes", "No"] },
  ],
  [
    {
      q: "Are you active gamer playing more than 40 hours per month?",
      a: ["Yes", "No"],
    },
    { q: "Do you have internet with more 50Mbps speed?", a: ["Yes", "No"] },
  ],
  [
    { q: "Will you refer Oneplay to your friends?", a: ["Yes", "No"] },
    { q: "What you loved the most?", a: ["Quality", "Value of money"] },
  ],
];

@Component({
  selector: "app-feedback",
  templateUrl: "./feedback.component.html",
  styleUrls: ["./feedback.component.scss"],
})
export class FeedbackComponent implements OnInit, OnDestroy {
  feedPage = false;
  rate = 5;
  comment = "";
  answeres: string[] = [];

  private gameId: string;
  private sessionId: string;
  private userId: string;

  private querySubscription: Subscription;
  private userSubscription: Subscription;

  constructor(
    private readonly route: ActivatedRoute,
    private location: Location,
    private readonly restService: RestService,
    private readonly title: Title,
    private readonly authService: AuthService,
    private readonly countlyService: CountlyService
  ) {}

  ngOnDestroy(): void {
    this.querySubscription?.unsubscribe();
    this.userSubscription?.unsubscribe();
    this.gameId = null;
    this.sessionId = null;
    this.reset();
    this.countlyService.cancelEvent("gameFeedback");
  }

  get qna() {
    return qnaData[this.rate - 1];
  }

  ngOnInit(): void {
    this.title.setTitle("Feedback");
    this.querySubscription = this.route.queryParams.subscribe((params) => {
      this.gameId = params.game_id;
      this.sessionId = params.session_id;
    });
    this.userSubscription = this.authService.user.subscribe((u) => {
      this.userId = u?.id;
    });
  }

  feedBackPage() {
    this.answeres = this.qna.map((qna) => qna.a[0]);
    this.feedPage = true;
  }

  onSubmit() {
    this.countlyService.endEvent("gameFeedback", {
      action: 'submit',
    });
    if (!this.gameId || !this.sessionId || !this.userId) {
      Swal.fire({
        title: "Oops...",
        text: "Invalid Session",
        icon: "error",
        confirmButtonText: "Try Again",
      }).then(({ isConfirmed }) => {
        if (isConfirmed) {
          this.reset();
        }
      });
      return;
    }
    this.restService
      .saveFeedback({
        game_id: this.gameId,
        user_id: this.userId,
        session_id: this.sessionId,
        rating: this.rate,
        suggestion: "",
        comment: this.comment,
        qna: this.qna.map((qna, i) => ({
          question: qna.q,
          answer: this.answeres[i],
        })),
      })
      .subscribe(
        () => {
          Swal.fire({
            title: "Thank you!",
            text: "Your feedback has been submitted successfully!",
            icon: "success",
            confirmButtonText: "OK",
          }).then(() => {
            this.location.back();
          });
        },
        (err) => {
          if (err.isOnline)
          Swal.fire({
            title: "Error Code: " + err.code,
            text: err.message,
            icon: "error",
            confirmButtonText: "Try Again",
          }).then(({ isConfirmed }) => {
            if (isConfirmed) {
              this.reset();
            }
          });
        }
      );
  }

  skip() {
    this.countlyService.endEvent("gameFeedback", {
      action: 'skip',
    });
    this.location.back();
  }

  private reset() {
    this.feedPage = false;
    this.rate = 5;
    this.comment = "";
    this.answeres = [];
  }
}
