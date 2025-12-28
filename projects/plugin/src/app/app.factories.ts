import { ContentPlugin } from '@rollthecloudinc/content';
import { DownloadComponent } from './download.component';
import { DownloadContentHandler } from './handlers/download-content.handler';
import { TabulatorRendererComponent } from './tabulator-renderer/tabulator-renderer.component';
import { TabulatorEditorComponent } from './tabulator-editor/tabulator-editor.component';
import { TabulatorContentHandler } from './handlers/tabulator-content.handler';

export const pluginDownloadContentPluginFactory  = ({ handler }: { handler: DownloadContentHandler }) => {
  return new ContentPlugin<string>({
    id: 'plugin_download',
    title: 'Plugin Download',
    selectionComponent: undefined,
    editorComponent: undefined,
    renderComponent: DownloadComponent,
    handler
  } as any);
};

export const pluginTabulatorContentPluginFactory  = ({ handler }: { handler: TabulatorContentHandler }) => {
  return new ContentPlugin<string>({
    id: 'plugin_tabulator',
    title: 'Tabulator Table',
    selectionComponent: undefined,
    editorComponent: undefined, //TabulatorEditorComponent,
    renderComponent: TabulatorRendererComponent,
    handler
  } as any);
};