<script lang="ts">
  import {onMount} from 'svelte';
  import {incrementRow, incrementColumn} from '../state/workbook';
  import appState, {setSelectedCell} from '../state';
  import Cell from '../lib/Cell.svelte';
  import workbook from '../state/workbook';

  let pageX, curCol, curColWidth;

  let timeout = null;

  onMount(() => {
    const worksheet = document.querySelector('.worksheet');

    worksheet.addEventListener('scroll', function () {
      const scrollHeight = worksheet.scrollHeight;
      const scrollTop = worksheet.scrollTop;
      const clientHeight = worksheet.clientHeight;

      if (scrollHeight - scrollTop === clientHeight) {
        if (timeout) {
          console.log('timeout already set', 'wait');
          return;
        }
        incrementRow($appState.currentWorkBook, 10); // Increase the number of rows
        timeout = setTimeout(() => {
          console.log('timeout done');
          clearTimeout(timeout);
          timeout = null;
        }, 130);
      }
    });

    worksheet.addEventListener('scroll', function () {
      const scrollWidth = worksheet.scrollWidth;
      const scrollLeft = worksheet.scrollLeft;
      const clientWidth = worksheet.clientWidth;

      if (scrollWidth - scrollLeft === clientWidth) {
        if (timeout) {
          console.log('timeout already set', 'wait');
          return;
        }
        incrementColumn($appState.currentWorkBook, 5); // Increase the number of columns
        timeout = setTimeout(() => {
          console.log('timeout done');
          clearTimeout(timeout);
          timeout = null;
        }, 120);
      }
    });

    document.addEventListener('mousemove', function (e) {
      if (curCol) {
        var diffX = e.pageX - pageX;
        const cells = document.querySelectorAll(
          `.cell[data-col="${curCol.dataset.column}"]`
        );
        const newWidth = curColWidth + diffX;

        if (newWidth < 50) {
          return;
        }

        cells.forEach(cell => {
          if (cell.dataset.ismaster == 'true') {
            return;
          }
          sheet.columnsWidth[curCol.dataset.column] = newWidth;
          cell.style.width = newWidth + 'px';
        });

        curCol.style.width = newWidth + 'px';
      }
    });

    document.addEventListener('mouseup', function (e) {
      curCol = undefined;
      pageX = undefined;
      curColWidth = undefined;
    });

    // remove selected cell on click outside
    document.addEventListener('click', function (e) {
      if (e.target.classList.contains('cell')) {
        return;
      }

      if (e.target.classList.contains('ignore-select')) {
        return;
      }

      if (e.target.parentElement.classList.contains('cell')) {
        return;
      }

      setSelectedCell(null, null);
    });
    const sheetRow = document.getElementById('sheet-row');
    const sheetDiv = document.getElementById('sheet');

    sheetRow.addEventListener('scroll', function () {
      sheetDiv.scrollTop = sheetRow.scrollTop;
    });

    sheetDiv.addEventListener('scroll', function () {
      sheetRow.scrollTop = sheetDiv.scrollTop;
    });
  });

  const mouseDownEvent = function (e) {
    curCol = e.target.parentElement;
    pageX = e.pageX;
    curColWidth = curCol.offsetWidth;
  };

  export let workbookIndex;

  $: sheet = $workbook.worksheets[workbookIndex];
</script>

<section class="flex-1 overflow-auto flex flex-row lol border border-gray-500">
  <div class="overflow-scroll h-full" id="sheet-row">
    <div class="row-index" />
    {#each {length: sheet.rows} as _, i}
      <!-- <div class="row"> -->
      <div
        class="row-index"
        style="grid-row: {i + 2} / span 1; grid-column: 1 / span 1;"
      >
        {i + 1}
      </div>
    {/each}
  </div>

  <div
    class="worksheet grid flex-1 w-full"
    id="sheet"
    style="grid-template-rows: repeat({sheet.rows +
      1},auto);grid-template-columns: repeat({sheet.columns + 1},auto)"
  >
    {#each {length: sheet.columns} as _, j}
      <div
        class="cell relative column header"
        data-column={j}
        style="width: {sheet.columnsWidth[j] ||
          150}px; grid-row: 1 / span 1; grid-column: {j + 1} / span 1;"
      >
        {j}
        <!-- svelte-ignore a11y-no-static-element-interactions -->
        <div class="cell-resizer" on:mousedown={mouseDownEvent} />
      </div>
    {/each}
    {#each {length: sheet.rows} as _, i}
      {#each {length: sheet.columns} as _, j}
        {#if !(sheet.cells[`${i}-${j}`]?.isMerged && sheet.cells[`${i}-${j}`]?.isMerged)}
          <Cell row={i} col={j} />
        {/if}
      {/each}
      <!-- </div> -->
    {/each}
  </div>
</section>

<style>
  .header {
    position: sticky;
    top: 0;
    min-height: 50px;
    height: 100%;
    /* width: 100%; */
    border: 1px solid black;
    display: flex;
    padding: 5px;
    justify-content: center;
    align-items: center;
    /* z-index: 1; */
  }

  .worksheet {
    overflow: scroll;
  }

  .row-index {
    width: 50px;
    height: 50px;
    border: 1px solid black;
    display: flex;
    justify-content: center;
    align-items: center;
    position: sticky;
    left: 0;
  }

  .cell {
    /* min-width: 150px; */
    min-height: 50px;
    height: 100%;
    /* width: 100%; */
    border: 1px solid black;
    display: flex;
    padding: 5px;
    /* justify-content: center; */
    /* align-items: center; */
  }

  .cell div {
    display: flex;
    /* justify-content: center; */
    align-items: center;
  }

  .cell-resizer {
    position: absolute;
    top: 0;
    right: 0;
    width: 2px;
    cursor: col-resize;
    /* remove backGroundColor later */
    /* background-color: gray; */
    user-select: none;
    /* table height */
    height: 50px;
  }

  #sheet-row::-webkit-scrollbar {
    width: 0;
  }
</style>
