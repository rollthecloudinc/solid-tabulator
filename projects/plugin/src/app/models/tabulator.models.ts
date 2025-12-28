export class TabulatorItem {
    bindingOption: string;
    height?: string;
    query?: string;
    layout?: string;
    columns: Array<TabulatorColumn> = [];
    constructor(data?: TabulatorItem) {
        if (data) {
            this.bindingOption = data.bindingOption;
            this.query = data.query;
            this.height = data.height;
            this.layout = data.layout;
            if(data.columns) {
                this.columns = data.columns.map(c => new TabulatorColumn(c));
            }
        }
    }
}

export class TabulatorColumn {
    title?: string;
    field?: string;
    formatter?: string;
    sorter?: string;
    hozAlign?: string;
    width?: string;
    constructor(data?: TabulatorColumn) {
        if (data) {
            this.title = data.title;
            this.field = data.field;
            this.formatter = data.formatter;
            this.sorter = data.sorter;
            this.hozAlign = data.hozAlign;
            this.width = data.width;
        }
    }
}