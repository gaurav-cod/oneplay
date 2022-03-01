import { AfterViewInit, Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { AuthService } from "src/app/services/auth.service";
import { RestService } from "src/app/services/rest.service";

@Component({
  selector: "app-admin-layout",
  templateUrl: "./admin-layout.component.html",
  styleUrls: ["./admin-layout.component.scss"],
})
export class AdminLayoutComponent implements AfterViewInit, OnInit {
  friendsCollapsed = true;

  constructor(
    private readonly restService: RestService,
    private readonly authService: AuthService,
    private readonly route: ActivatedRoute
  ) {}

  ngOnInit(): void {
          this.authService.wishlist = this.restService.getWishlist();
  }

  ngAfterViewInit(): void {
    this.route.queryParams.subscribe((params) => {
      if (params.subscribe && confirm("Proceed to pay?")) {
        this.handlePay(params.subscribe);
      }
    });
  }

  private handlePay(packageName: string) {
    this.restService.payForSubscription(packageName).subscribe(
      (data) => {
        const config = {
          root: "",
          flow: "DEFAULT",
          data: {
            orderId: data.orderId,
            token: data.token,
            tokenType: "TXN_TOKEN",
            amount: data.amount,
          },
          handler: {
            notifyMerchant: function (eventName, data) {
              console.log("notifyMerchant handler function called");
              console.log("eventName => ", eventName);
              console.log("data => ", data);
            },
          },
        };
        // @ts-ignore
        if (window.Paytm && window.Paytm.CheckoutJS) {
          // @ts-ignore
          window.Paytm.CheckoutJS.onLoad(function excecuteAfterCompleteLoad() {
            // @ts-ignore
            window.Paytm.CheckoutJS.init(config)
              .then(function onSuccess() {
                // @ts-ignore
                window.Paytm.CheckoutJS.invoke();
              })
              .catch(function onError(error) {
                console.log("error => ", error);
              });
          });
        }
      },
      (error) => alert(error.error.message)
    );
  }
}
