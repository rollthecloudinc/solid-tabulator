import { Component, ViewEncapsulation, AfterViewInit, ViewChild, ElementRef, inject, Input, DestroyRef, OnDestroy } from "@angular/core";
import { Observable, Subject, switchMap, tap, map, combineLatest, BehaviorSubject, of, iif } from "rxjs";
import {TabulatorFull as Tabulator} from 'tabulator-tables';
import { DateTime } from "luxon";
import jsPDF from 'jspdf'
import { applyPlugin } from 'jspdf-autotable'
import { TabulatorItem } from "../models/tabulator.models";
import { TabulatorContentHandler } from "../handlers/tabulator-content.handler";
import { AttributeValue } from "@rollthecloudinc/attributes";
import { InlineContext } from "@rollthecloudinc/context";
import { Pane, PanelResolverService } from "@rollthecloudinc/panels";
import { ContentPluginManager } from "@rollthecloudinc/content";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";

applyPlugin(jsPDF)

// define some sample data
/*const tabledata = [
 	{id:1, name:"Oli Bob", age:"12", col:"red", dob:""},
 	{id:2, name:"Mary May", age:"1", col:"blue", dob:"14/05/1982"},
 	{id:3, name:"Christine Lobowski", age:"42", col:"green", dob:"22/05/1982"},
 	{id:4, name:"Brendon Philips", age:"125", col:"orange", dob:"01/08/1980"},
 	{id:5, name:"Margret Marmajuke", age:"16", col:"yellow", dob:"31/01/1999"},
 ];*/

@Component({
  selector: 'solid-tabulator-renderer',
  templateUrl: './tabulator-renderer.component.html',
  styleUrls: ['./tabulator-renderer.component.scss'],
  encapsulation: ViewEncapsulation.None,
  standalone: false,
  providers: [
    TabulatorContentHandler
  ]
})
export class TabulatorRendererComponent implements AfterViewInit, OnDestroy { 

    protected readonly handler = inject(TabulatorContentHandler);
    protected readonly panelResolver = inject(PanelResolverService);
    protected readonly cpm = inject(ContentPluginManager);
    protected readonly destroyRef = inject(DestroyRef); // 1. Inject DestroyRef

    protected tableInstance: Tabulator | undefined;

    readonly afterViewInit$ = new Subject<void>();
    readonly settings$ = new Subject<Array<AttributeValue>>();
    readonly contexts$ = new BehaviorSubject<Array<InlineContext>>([]);
    readonly panes$ = new BehaviorSubject<Array<Pane>>([]);
    readonly originPanes$ = new BehaviorSubject<Array<Pane>>([]);

    @Input()
    set settings(settings: Array<AttributeValue>) {
        this.settings$.next(settings);
    }

    @Input()
    set panes(panes: Array<Pane>) {
        this.panes$.next(panes);
    }

    @Input()
    set originPanes(originPanes: Array<Pane>) {
        this.originPanes$.next(originPanes);
    }

    @Input()
    set contexts(contexts: Array<InlineContext>) {
        this.contexts$.next(contexts);
    }

    readonly renderTabulatorTableSub = combineLatest([
        this.settings$,
        this.panes$,
        this.originPanes$,
        this.contexts$,
        this.afterViewInit$
    ]).pipe(
        takeUntilDestroyed(this.destroyRef),
        map(([settings, panes, originPanes, contexts]) => ({ settings, metadata: new Map<string, any>([ [ 'panes', [ ...(panes && Array.isArray(panes) ? panes : []), ...(originPanes && Array.isArray(originPanes) ? originPanes : []) ] ], [ 'contexts', contexts ] ]) })),   
        switchMap(({ settings, metadata }) => this.handler.toObject(settings).pipe(
            map(item => ({ item, metadata }))
        )),
        switchMap(({ item, metadata }) => iif(
            () => item.bindingOption && item.bindingOption !== '',
            this.panelResolver.dataPanes(metadata.get('panes') as Array<Pane>).pipe(
                switchMap(dataPanes => this.cpm.getPlugin('datasource').pipe(
                    map(dsp => ({ dataPanes, dspHandler: dsp.handler, metadata }))
                )),
                map(({ dataPanes, dspHandler, metadata }) => ({ dataPanes, dspHandler, dataPane: metadata.has('panes') ? (metadata.get('panes') as Array<Pane>).find(p => p.name === item.bindingOption) : undefined })),
                switchMap(({ dataPanes, dspHandler, dataPane }) => dataPane ? dspHandler.fetchDynamicData(dataPane.settings, new Map<string, any>([ ...metadata, [ 'dataPanes', dataPanes ] ])) : of([])),
                map(d => ({ item, tabledata: d.results }))
            ),
            of({ item, tabledata: [] })
        )),
        tap(({ item, tabledata }) => this.renderTable({ item, tabledata }))
    ).subscribe();

    @ViewChild('tabulatorContainer', { static: true }) tabulatorContainer!: ElementRef;

    ngAfterViewInit() {
        this.afterViewInit$.next();
        this.afterViewInit$.complete();
    }

    ngOnDestroy() {
        if (this.tableInstance) {
            this.tableInstance.destroy();
        }
    }

    protected renderTable({ item, tabledata }: { item: TabulatorItem, tabledata?: Array<{}> }) {
        this.tableInstance = new Tabulator(this.tabulatorContainer.nativeElement, {
            ...(!Number.isNaN(parseInt(item.height)) ? { height: parseInt(item.height) } : {}), //500, // set height of table (in CSS or here), this enables the Virtual DOM and improves render speed dramatically (can be any valid css height value)
            data: tabledata, //assign data to table
            ...(item.layout && item.layout !== '' ? { layout:item.layout } : {}), //fit columns to width of table (optional)
            /*columns:[ //Define Table Columns
                {title:"Name", field:"name", width:150},
                {title:"Age", field:"age", hozAlign:"left", formatter:"progress"},
                {title:"Favourite Color", field:"col"},
                {title:"Date Of Birth", field:"dob", sorter:"date", hozAlign:"center"},
            ],*/
            columns: item.columns.map(col => ({
                title: col.title,
                field: col.field,
                ...(!Number.isNaN(parseInt(col.width)) ? { width: parseInt(col.width) } : {}),
                ...(col.hozAlign && col.hozAlign !== '' ? { hozAlign: col.hozAlign } : {}),
                ...(col.formatter && col.formatter !== '' ? { formatter: col.formatter } : {}),
                ...(col.sorter && col.sorter !== '' ? { sorter: col.sorter } : {})
            })),
            dependencies: {
                DateTime: DateTime,
                jspdf: jsPDF
            }
        });
    }
}