import {writable} from 'svelte/store';

type AppState = {
  currentWorkBook: number;
  selectedRow: number | null;
  selectedColumn: number | null;
};

const appState = writable<AppState>({
  currentWorkBook: 0,
  selectedRow: null,
  selectedColumn: null
});

const setSelectedCell = (row: number, col: number) => {
  appState.update(s => {
    s.selectedRow = row;
    s.selectedColumn = col;
    return s;
  });
};
export default appState;
export {setSelectedCell};
