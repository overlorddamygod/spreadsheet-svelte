type Align = 'left' | 'center' | 'right';

type Cell = {
  value: string;
  formatting: {
    bold?: boolean;
    italic?: boolean;
    underline?: boolean;
    color?: string;
    bgColor?: string;
    align?: Align;
  };
  rowSpan?: number;
  colSpan?: number;
  isMerged?: boolean;
};

type Cells = {
  [key: string]: Cell;
};

type MergedCells = {
  master: string;
  slaves: string[];
};

type ColumnsWidth = {
  [key: number]: number;
};

type Sheet = {
  name: string;
  rows: number;
  columns: number;
  cells: Cells;
  columnsWidth: ColumnsWidth;
  mergedCells: {
    [key: string]: MergedCells;
  };
};

type WorkBook = {
  worksheets: Sheet[];
};

export {Cell, MergedCells, ColumnsWidth, Sheet, Align, WorkBook};
