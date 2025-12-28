import { Component, inject, OnInit } from "@angular/core";
import { FormArray, FormControl, FormGroup, UntypedFormArray, UntypedFormControl, UntypedFormGroup } from "@angular/forms";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { TabulatorContentHandler } from "../handlers/tabulator-content.handler";
import { AttributeSerializerService } from "@rollthecloudinc/attributes";
import { TabulatorItem } from "../models/tabulator.models";
import { Pane } from '@rollthecloudinc/panels';

@Component({
  selector: 'solid-tabulator-editor',
  templateUrl: './tabulator-editor.component.html',
  styleUrls: ['./tabulator-editor.component.scss'],
  standalone: false,
  providers: [
    TabulatorContentHandler
  ]
})
export class TabulatorEditorComponent implements OnInit { 

    private dialogRef = inject(MatDialogRef<TabulatorEditorComponent>);
    private dialogData: { panelFormGroup: UntypedFormGroup; paneIndex: number; pane: Pane } = inject(MAT_DIALOG_DATA);
    private handler = inject(TabulatorContentHandler);
    private attributeSerializer = inject(AttributeSerializerService);    
    
    bindableOptions: Array<string> = [];
    tabulatorItem: TabulatorItem;
    
    readonly contentForm = new FormGroup({
        bindingOption: new FormControl<string>(''),
        query: new FormControl<string>(''),
        height: new FormControl<string>(''),
        layout: new FormControl<string>(''),
        columns: new FormArray<FormGroup>([]),
    });

    get columns(): FormArray<FormGroup> {
        return this.contentForm.get('columns') as FormArray<FormGroup>;
    }

    ngOnInit() { 
        this.bindableOptions = (this.dialogData.panelFormGroup.get('panes') as UntypedFormArray).controls.reduce<Array<string>>((p, c) => (c.get('name').value ? [ ...p, c.get('name').value ] : [ ...p ]), []);
        if(this.dialogData.pane !== undefined) {
            this.handler.toObject(this.dialogData.pane.settings).subscribe((tabulatorItem: TabulatorItem) => {
                this.tabulatorItem = tabulatorItem;
                this.contentForm.get('bindingOption').patchValue(this.tabulatorItem.bindingOption);
                this.contentForm.get('query').patchValue(this.tabulatorItem.query);
                this.contentForm.get('height').patchValue(this.tabulatorItem.height);
                this.contentForm.get('layout').patchValue(this.tabulatorItem.layout);
                this.contentForm.get('columns').patchValue(this.tabulatorItem.columns);
                this.tabulatorItem.columns.forEach(column => this.columns.push(new FormGroup({
                    title: new FormControl<string>(column.title),
                    field: new FormControl<string>(column.field),
                    formatter: new FormControl<string>(column.formatter),
                    sorter: new FormControl<string>(column.sorter),
                    hozAlign: new FormControl<string>(column.hozAlign),
                    width: new FormControl<string>(column.width),
                })));
            });
        }
    }

    submit() {
        let paneIndex: number;
        if(this.dialogData.paneIndex === undefined) {
            (this.dialogData.panelFormGroup.get('panes') as UntypedFormArray).push(new FormGroup({
                contentPlugin: new UntypedFormControl('plugin_tabulator'),
                name: new UntypedFormControl(''),
                label: new UntypedFormControl(''),
                rule: new UntypedFormControl(''),
                settings: new UntypedFormArray([]),
                width: new UntypedFormControl(''),
            }));
            paneIndex = (this.dialogData.panelFormGroup.get('panes') as UntypedFormArray).length - 1;
        } else {
            paneIndex = this.dialogData.paneIndex;
        }
        const paneForm = (this.dialogData.panelFormGroup.get('panes') as UntypedFormArray).at(paneIndex);
        const bindingOption = this.contentForm.get('bindingOption').value;
        const query = this.contentForm.get('query').value;
        const height = this.contentForm.get('height').value;
        const layout = this.contentForm.get('layout').value;
        const columns = this.columns.value;

        const tabulatorItem = new TabulatorItem({ query, bindingOption, height, layout, columns });

        (paneForm.get('settings') as UntypedFormArray).clear();
        const controls = this.handler.buildSettings(tabulatorItem).map(s => this.attributeSerializer.convertToGroup(s));
        controls.forEach(c => (paneForm.get('settings') as UntypedFormArray).push(c));

        this.dialogRef.close(); 
    }

    cancel() {
        this.dialogRef.close();
    }

    addColumn() {
        this.columns.push(new FormGroup({
            title: new FormControl<string>(''),
            field: new FormControl<string>(''),
            formatter: new FormControl<string>(''),
            sorter: new FormControl<string>(''),
            hozAlign: new FormControl<string>(''),
            width: new FormControl<string>('')
        }));
    }

    removeColumn(index: number) {
        this.columns.removeAt(index);
    }

}