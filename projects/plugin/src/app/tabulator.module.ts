import { NgModule } from '@angular/core';
import { ContentPluginManager } from '@rollthecloudinc/content';
import { pluginTabulatorContentPluginFactory } from './app.factories';
import { CommonModule } from '@angular/common';
import { TabulatorContentHandler } from './handlers/tabulator-content.handler';
import { TabulatorRendererComponent } from './tabulator-renderer/tabulator-renderer.component';
import { TabulatorEditorComponent } from './tabulator-editor/tabulator-editor.component';
import { MaterialModule } from '@rollthecloudinc/material';
import { ReactiveFormsModule } from '@angular/forms';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MaterialModule
  ],
  declarations: [
    TabulatorRendererComponent,
    TabulatorEditorComponent
  ],
  providers: [
    TabulatorContentHandler
  ],
  exports: [
    TabulatorRendererComponent,
    TabulatorEditorComponent
  ]
})
export class TabulatorModule { 
  constructor(
    cpm: ContentPluginManager,
    tabulatorHandler: TabulatorContentHandler
  ) {
    console.log('register plugin tabulator content plugin');
    cpm.register(pluginTabulatorContentPluginFactory({ handler: tabulatorHandler }));
  }
}
