import { Component, ViewEncapsulation, AfterViewInit, ViewChild, ElementRef } from "@angular/core";
import { Subject, tap } from "rxjs";
import {TabulatorFull as Tabulator} from 'tabulator-tables';
import { DateTime } from "luxon";

// define some sample data
const tabledata = [
 	{id:1, name:"Oli Bob", age:"12", col:"red", dob:""},
 	{id:2, name:"Mary May", age:"1", col:"blue", dob:"14/05/1982"},
 	{id:3, name:"Christine Lobowski", age:"42", col:"green", dob:"22/05/1982"},
 	{id:4, name:"Brendon Philips", age:"125", col:"orange", dob:"01/08/1980"},
 	{id:5, name:"Margret Marmajuke", age:"16", col:"yellow", dob:"31/01/1999"},
 ];

@Component({
  selector: 'solid-tabulator-renderer',
  templateUrl: './tabulator-renderer.component.html',
  styleUrls: ['./tabulator-renderer.component.scss'],
  encapsulation: ViewEncapsulation.None,
  standalone: false
})
export class TabulatorRendererComponent implements AfterViewInit { 

    protected tableInstance: Tabulator | undefined;

    readonly afterViewInit$ = new Subject<void>();

    readonly renderTabulatorTableSub = this.afterViewInit$.pipe(
        tap(() => this.renderTable())
    ).subscribe();

    @ViewChild('tabulatorContainer', { static: true }) tabulatorContainer!: ElementRef;

    ngAfterViewInit() {
        this.afterViewInit$.next();
        this.afterViewInit$.complete();
    }

    protected renderTable() {
        this.tableInstance = new Tabulator(this.tabulatorContainer.nativeElement, {
            height: 500, // set height of table (in CSS or here), this enables the Virtual DOM and improves render speed dramatically (can be any valid css height value)
            data: tabledata, //assign data to table
            layout:"fitColumns", //fit columns to width of table (optional)
            columns:[ //Define Table Columns
                {title:"Name", field:"name", width:150},
                {title:"Age", field:"age", hozAlign:"left", formatter:"progress"},
                {title:"Favourite Color", field:"col"},
                {title:"Date Of Birth", field:"dob", sorter:"date", hozAlign:"center"},
            ],
            dependencies: {
                DateTime: DateTime
            }
        });
    }
}