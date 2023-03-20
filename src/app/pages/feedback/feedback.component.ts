import { Component, OnInit } from "@angular/core";
import { Title } from "@angular/platform-browser";
import { ActivatedRoute } from "@angular/router";
import { GameSessionRO } from "src/app/interface";
import { RestService } from "src/app/services/rest.service";
import Swal from "sweetalert2";

@Component({
  selector: "app-feedback",
  templateUrl: "./feedback.component.html",
  styleUrls: ["./feedback.component.scss"],
})
export class FeedbackComponent implements OnInit {
  feedPage = false;
  rate = 0;
  choice = "Great Experience/Highly Recommend to friends & family";
  comment = "";

  options = [
    "Great Experience/Highly Recommend to friends & family",
    "Moderate lag/hang/latency, but mostly playable experience",
    "Too much lag/hang/latency and unplayable experience",
  ];

  gameSession: GameSessionRO;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly restService: RestService,
    private readonly title: Title,
  ) {}

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
    this.feedPage = true;
  }

  onSubmit() {
    this.restService
      .saveFeedback({
        game_id: this.gameSession.game_id,
        user_id: this.gameSession.user_id,
        session_id: this.gameSession.user_session_id,
        rating: this.rate,
        suggestion: this.choice,
        comment: this.comment,
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
