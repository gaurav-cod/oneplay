import { Component, EventEmitter, OnInit, Output } from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { PartyService } from "src/app/services/party.service";
import { RestService } from "src/app/services/rest.service";
import Swal from "sweetalert2";

@Component({
  selector: "app-create-party",
  templateUrl: "./create-party.component.html",
  styleUrls: ["./create-party.component.scss"],
})
export class CreatePartyComponent implements OnInit {
  @Output("goBack") goBack = new EventEmitter();
  @Output("selectParty") selectParty = new EventEmitter<string>();

  loading = false;

  partyForm = new FormGroup({
    name: new FormControl("", Validators.required),
    description: new FormControl("", Validators.required),
    type: new FormControl("private", Validators.required),
  });

  constructor(
    private readonly restService: RestService,
    private readonly partyService: PartyService
  ) {}

  ngOnInit(): void {}

  onSubmit(): void {
    this.loading = true;
    this.restService.createParty(this.partyForm.value).subscribe(
      (party) => {
        this.partyService.createParty(party);
        this.loading = false;
        this.selectParty.emit(party.id);
      },
      (error) => {
        this.loading = false;
        Swal.fire({
          title: "Error",
          text: error,
          icon: "error",
        });
      }
    );
  }
}
