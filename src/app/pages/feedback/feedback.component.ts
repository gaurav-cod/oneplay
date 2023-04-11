import { Component, OnInit } from "@angular/core";
import { FormControl } from "@angular/forms";
import { Title } from "@angular/platform-browser";
import { ActivatedRoute } from "@angular/router";
import { GameSessionRO } from "src/app/interface";
import { RestService } from "src/app/services/rest.service";
import Swal from "sweetalert2";

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
export class FeedbackComponent implements OnInit {
  feedPage = false;
  rate = 5;
  comment = "";

  gameSession: GameSessionRO;

  answeres: string[] = [];

  constructor(
    private readonly route: ActivatedRoute,
    private readonly restService: RestService,
    private readonly title: Title
  ) {}

  get qna() {
    return qnaData[this.rate - 1];
  }

  ngOnInit(): void {
    this.title.setTitle("Feedback");
    this.route.queryParams.subscribe((params) => {
      if (params.id) {
        this.restService.getGameSession(params.id).subscribe((gameSession) => {
          this.gameSession = gameSession;
        });
      }
    });
  }

  feedBackPage() {
    this.answeres = this.qna.map((qna) => qna.a[0]);
    this.feedPage = true;
  }

  onSubmit() {
    if (!this.gameSession) {
      Swal.fire({
        title: "Oops...",
        text: "Invalid Session",
        icon: "error",
        confirmButtonText: "Try Again",
      });
      return;
    }
    this.restService
      .saveFeedback({
        game_id: this.gameSession?.game_id,
        user_id: this.gameSession?.user_id,
        session_id: this.gameSession?.user_session_id,
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
          });
        },
        (err) => {
          Swal.fire({
            title: "Error Code: " + err.code,
            text: err.message,
            icon: "error",
            confirmButtonText: "Try Again",
          });
        }
      );
  }
}
