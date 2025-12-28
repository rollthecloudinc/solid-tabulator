import { NgModule } from '@angular/core';
import { DownloadComponent } from './download.component';
import { DownloadContentHandler } from './handlers/download-content.handler';
import { ContentPluginManager } from '@rollthecloudinc/content';
import { pluginDownloadContentPluginFactory, pluginTabulatorContentPluginFactory } from './app.factories';
import { CommonModule } from '@angular/common';
import { TabulatorContentHandler } from './handlers/tabulator-content.handler';
import { TabulatorRendererComponent } from './tabulator-renderer/tabulator-renderer.component';
import { TabulatorEditorComponent } from './tabulator-editor/tabulator-editor.component';

@NgModule({
  imports: [
    CommonModule
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
