import { Component, EventEmitter, OnInit, Output } from "@angular/core";
import { UntypedFormControl, UntypedFormGroup, Validators } from "@angular/forms";
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

  partyForm = new UntypedFormGroup({
    name: new UntypedFormControl("", Validators.required),
    description: new UntypedFormControl("", Validators.required),
    type: new UntypedFormControl("private", Validators.required),
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
