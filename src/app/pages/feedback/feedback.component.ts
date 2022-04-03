import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { ToastrService } from "ngx-toastr";
import { GameSessionRO } from "src/app/interface";
import { RestService } from "src/app/services/rest.service";

@Component({
  selector: "app-feedback",
  templateUrl: "./feedback.component.html",
  styleUrls: ["./feedback.component.scss"],
})
export class FeedbackComponent implements OnInit {
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
    private readonly toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      if (params.id) {
        this.restService.getGameSession(params.id).subscribe((gameSession) => {
          this.gameSession = gameSession;
        });
      }
    });
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
          this.toastr.success("Feedback submitted successfully!");
        },
        (err) => {
          this.toastr.error("Error submitting feedback");
        }
      );
  }
}
