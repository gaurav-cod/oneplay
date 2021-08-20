import { Component, OnInit } from '@angular/core';
import Chart from 'chart.js';
import { PC } from 'src/app/models/pc.model';
import { RestService } from 'src/app/services/rest.service';

// core components
import {
  chartOptions,
  parseOptions,
  chartExample1,
  chartExample2
} from "../../variables/charts";

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  public pc: PC;
  public loading = false;

  constructor(private readonly restService: RestService) { }

  ngOnInit() {
    var chartOrders = document.getElementById('chart-orders');

    parseOptions(Chart, chartOptions());

    var ordersChart = new Chart(chartOrders, {
      type: 'bar',
      options: chartExample2.options,
      data: chartExample2.data
    });

    this.loading = true;
    this.restService.getPcInfo().subscribe(
      data => {
        this.pc = data
        this.loading = false;
      },
      error => {
        alert(error);
        this.loading = false;
      }
    );
  }

  get ipv4() {
    return this.pc?.ipv4 || '_'
  }

  get launchTime() {
    return this.pc?.launchStartTime?.toLocaleString() || '_'
  }

  get message() {
    return this.pc?.message || '_';
  }

  get password() {
    return this.pc?.password || '_';
  }

  get status() {
    return this.pc?.state || 'loading';
  }

  startPc() {
    this.loading = true;
    this.restService.startPc().subscribe(
      () => window.location.reload(),
      error => {
        alert(error);
        this.loading = false;
      }
    )
  }

  stopPc() {
    this.loading = true;
    this.restService.stopPc().subscribe(
      () => window.location.reload(),
      error => {
        alert(error);
        this.loading = false;
      }
    )
  }

  startConsole() {
    this.loading = true;
    this.restService.startConsole().subscribe(
      () => window.location.reload(),
      error => {
        alert(error);
        this.loading = false;
      }
    )
  }

  stopConsole() {
    this.loading = true;
    this.restService.stopConsole().subscribe(
      () => window.location.reload(),
      error => {
        alert(error);
        this.loading = false;
      }
    )
  }
}
