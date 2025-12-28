import { Component, inject, OnInit } from "@angular/core";
import { FormArray, FormControl, FormGroup, UntypedFormArray, UntypedFormGroup } from "@angular/forms";
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
        columns: new FormArray<FormControl<string>>([]),
    });

    ngOnInit() { 
        this.bindableOptions = (this.dialogData.panelFormGroup.get('panes') as UntypedFormArray).controls.reduce<Array<string>>((p, c) => (c.get('name').value ? [ ...p, c.get('name').value ] : [ ...p ]), []);
    }

    submit() {
        this.dialogRef.close();
    }

}