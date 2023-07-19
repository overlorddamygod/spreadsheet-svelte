import {writable, type Updater} from 'svelte/store';
import type {Align, Sheet, WorkBook} from '../types';
import {defaultCell} from './sheets.util';
import appState from '.';

const workbook = writable<WorkBook>({
  worksheets: [
    {
      name: 'My Sheet 1',
      rows: 20,
      columns: 15,
      columnsWidth: {
        0: 300
      },
      cells: {
        '0-0': {
          value: 'Hello',
          formatting: {
            align: 'center',
            bgColor: '#242424'
          }
          // color: 'rgba(255, 255, 255, 0.87)',
        }
      },
      mergedCells: {}
    }
  ]
});

const sheetUpdate = (index: number, updater: Updater<any>) => {
  workbook.update(w => {
    w.worksheets[index] = updater(w.worksheets[index]);
    return w;
  });
};

// const sheet = writable<Sheet>({
//   rows: 20,
//   columns: 15,
//   columnsWidth: {
//     0: 300
//   },
//   cells: {
//     '0-0': {
//       value: 'Hello',
//       formatting: {
//         align: 'center',
//         bgColor: '#242424'
//       }
//       // color: 'rgba(255, 255, 255, 0.87)',
//     }
//   },
//   mergedCells: {}
// });

const incrementRow = (sheetNo: number, rows: number) => {
  sheetUpdate(sheetNo, s => {
    s.rows += rows;
    return s;
  });
};

const incrementColumn = (sheetNo: number, columns: number) => {
  sheetUpdate(sheetNo, s => {
    s.columns += columns;
    return s;
  });
};


// const calculate = (expression: string) => {
//   const result = evaluateExpression(expression)
//   return result
// }

const setCellValue = (
  sheetNo: number,
  row: number,
  col: number,
  value: string
) => {
  sheetUpdate(sheetNo, s => {
    if (!s.cells[`${row}-${col}`]) {
      s.cells[`${row}-${col}`] = defaultCell();
    }
    if (value.startsWith('=')) {
      s.cells[`${row}-${col}`].formula = value;
      const variables = getVariables(value.slice(1));
      console.log("variables", variables)
      const variableVals = variables.reduce((acc,v) => {
        const [r, c] = v.slice(1).split('_');
        acc[v] = s.cells[`${r}-${c}`]?.value || "";
        return acc;
      },{});
      console.log("variableVals", variableVals)

      s.cells[`${row}-${col}`].value = evaluateExpression(value.slice(1), variableVals);

      variables.forEach(v => {
        const [r, c] = v.slice(1).split('_');
        if (!s.cells[`${r}-${c}`]) {
          s.cells[`${r}-${c}`] = defaultCell();
        }
        if (!s.cells[`${r}-${c}`].dependents) {
          s.cells[`${r}-${c}`].dependents = [];
        }
        s.cells[`${r}-${c}`].dependents.push(`${row}-${col}`);
      })      
    } else {
      s.cells[`${row}-${col}`].value = value;
    }
    s.cells[`${row}-${col}`].dependents?.forEach(dependants => {
      setCellValue(sheetNo, +dependants.split('-')[0], +dependants.split('-')[1], s.cells[`${row}-${col}`].value)
    });

    return s;
  });
};

const setCellAlign = (sheetNo: number, i: number, j: number, align: Align) => {
  sheetUpdate(sheetNo, s => {
    if (!s.cells[`${i}-${j}`]) {
      s.cells[`${i}-${j}`] = defaultCell();
    }
    s.cells[`${i}-${j}`].formatting.align = align;
    console.log(s);
    return s;
  });
};
const toggleProperty = (
  property: string,
  sheetNo: number,
  i: number,
  j: number
) => {
  console.log(property, sheetNo, i, j);
  sheetUpdate(sheetNo, s => {
    if (!s.cells[`${i}-${j}`]) {
      s.cells[`${i}-${j}`] = defaultCell();
    }
    s.cells[`${i}-${j}`].formatting[property] =
      !s.cells[`${i}-${j}`].formatting[property];
    return s;
  });
};

const toggleBold = (sheetNo: number, row: number, col: number) => {
  toggleProperty('bold', sheetNo, row, col);
};
const toggleItalic = (sheetNo: number, row: number, col: number) => {
  toggleProperty('italic', sheetNo, row, col);
};
const toggleUnderline = (sheetNo: number, row: number, col: number) => {
  toggleProperty('underline', sheetNo, row, col);
};

export default workbook;
export {
  toggleBold,
  toggleItalic,
  toggleUnderline,
  incrementRow,
  incrementColumn,
  setCellValue,
  setCellAlign,
  mergeCell,
  unMergeCell,
  addWorkSheet
};

const mergeCell = (
  sheetNo: number,
  topLeftRow: number,
  topLeftCol: number,
  bottomRightRow: number,
  bottomRightCol: number
) => {
  const master = `${topLeftRow}-${topLeftCol}`;
  const slaves = [];
  for (let i = topLeftRow; i <= bottomRightRow; i++) {
    for (let j = topLeftCol; j <= bottomRightCol; j++) {
      if (i === topLeftRow && j === topLeftCol) {
        continue;
      }
      slaves.push(`${i}-${j}`);
    }
  }

  sheetUpdate(sheetNo, s => {
    s.mergedCells[master] = {
      master,
      slaves
    };

    if (!s.cells[master]) {
      s.cells[master] = defaultCell();
    }

    s.cells[master].rowSpan = bottomRightRow - topLeftRow + 1;
    s.cells[master].colSpan = bottomRightCol - topLeftCol + 1;

    slaves.forEach(slave => {
      if (!s.cells[slave]) {
        s.cells[slave] = defaultCell();
      }
      s.cells[slave].isMerged = true;
    });
    return s;
  });
};

const unMergeCell = (sheetNo: number, row: number, col: number) => {
  const master = `${row}-${col}`;

  sheetUpdate(sheetNo, s => {
    console.log('UNMeRGING 1');
    if (!(master in s.mergedCells)) return;
    console.log('UNMeRGING 12');
    const slaves = s.mergedCells[master].slaves;

    if (!s.cells[master]) {
      s.cells[master] = defaultCell();
    }

    delete s.cells[master].rowSpan;
    delete s.cells[master].colSpan;

    slaves.forEach(slave => {
      if (!s.cells[slave]) {
        s.cells[slave] = defaultCell();
      }
      delete s.cells[slave].isMerged;
    });

    return s;
  });
};

const addWorkSheet = () => {
  workbook.update(w => {
    w.worksheets = [
      ...w.worksheets,
      {
        name: 'My Sheet ' + (+w.worksheets.length + 1),
        rows: 20,
        columns: 15,
        columnsWidth: {
          0: 300
        },
        cells: {
          '0-0': {
            value: 'New',
            formatting: {
              align: 'center',
              bgColor: '#242424'
            }
            // color: 'rgba(255, 255, 255, 0.87)',
          }
        },
        mergedCells: {}
      }
    ];
    return w;
  });
};
