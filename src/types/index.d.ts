type Cell = {
    value: string;
    formatting: {
        bold?: boolean;
        italic?: boolean;
        underline?: boolean;
        color?: string;
        bgColor?: string;
        align?: 'left' | 'center' | 'right';
    };
    rowSpan?: number;
    colSpan?: number;
    isMerged?: boolean;
}

type Cells = {
    [key:string]: Cell;
}

type MergedCells = {
    master: string;
    slaves: string[];
}

type ColumnsWidth = {
    [key: number]: number;
}


type Sheet = {
    rows: number;
    columns: number;
    cells: Cells;
    columnsWidth: ColumnsWidth;
    mergedCells: {
        [key: string]: MergedCells;
    };
}

export {Cell, MergedCells,ColumnsWidth, Sheet}