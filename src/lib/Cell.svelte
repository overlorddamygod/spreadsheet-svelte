<script lang="ts">
  import workbook, {setCellValue} from '../state/workbook';
  import appState, {setSelectedCell} from '../state';

  export let row: number;
  export let col: number;

  $: cell =
    $workbook.worksheets[$appState.currentWorkBook].cells[`${row}-${col}`];
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div
  class="cell"
  style="background-color: {cell?.formatting?.bgColor ||
    '#242424'}; color: {cell?.formatting?.color || 'rgba(255, 255, 255, 0.87)'};
                grid-row: {row + 2} / span {cell?.rowSpan ||
    1}; grid-column: {col + 1} / span {$workbook.worksheets[
    $appState.currentWorkBook
  ].cells[`${row}-${col}`]?.colSpan || 1};font-weight: {cell?.formatting?.bold
    ? 'bold'
    : 'normal'};font-style: {cell?.formatting?.italic
    ? 'italic'
    : 'normal'};text-decoration: {cell?.formatting?.underline
    ? 'underline'
    : 'initial'}"
  data-row={row}
  data-col={col}
  data-isMaster={!!$workbook.worksheets[$appState.currentWorkBook].mergedCells[
    `${row}-${col}`
  ]}
  class:justify-start={cell?.formatting?.align === 'left'}
  class:justify-center={cell?.formatting?.align === 'center'}
  class:justify-end={cell?.formatting?.align === 'right'}
  on:click={() => {
    if ($appState.selectedColumn === col && $appState.selectedRow === row) {
      return;
    }

    setSelectedCell(row, col);
  }}
>
  {#if $appState.selectedColumn === col && $appState.selectedRow === row}
    <input
      class="w-full h-full background-black"
      id="cell-input"
      style="font-style: {cell?.formatting?.italic ? 'italic' : 'normal'}"
      value={cell?.value || ''}
      class:text-left={cell?.formatting?.align === 'left'}
      class:text-center={cell?.formatting?.align === 'center'}
      class:text-right={cell?.formatting?.align === 'right'}
      on:change={event => {
        const val = event.target.value;
        setCellValue($appState.currentWorkBook, row, col, val);
      }}
      on:blur={() => {
        setSelectedCell(null, null);
      }}
      on:keydown={e => {
        if (e.key === 'Enter') {
          setSelectedCell(null, null);
        }
      }}
    />
  {:else}
    <div class="ignore-select">
      {cell?.value || ''}
    </div>
  {/if}
</div>

<style>
  .cell {
    min-height: 50px;
    height: 100%;
    border: 1px solid black;
    display: flex;
    padding: 5px;
    align-items: center;
    overflow: hidden;
  }

  .cell input {
    /* text-align: center; */
  }
</style>
