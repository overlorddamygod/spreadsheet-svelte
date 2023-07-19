<script lang="ts">
  import {onMount} from 'svelte';
  import type {Cell, MergedCells, Sheet} from './types';

  let pageX, curCol, curColWidth;

  let selectedCol = null;
  let selectedRow = null;

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
        sheet.rows += 20;
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
        sheet.columns += 5; // Increase the number of columns
        timeout = setTimeout(() => {
          console.log('timeout done');
          clearTimeout(timeout);
          timeout = null;
        }, 120);
      }
    });

    columnsCountChanged(sheet.columns);

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
          if (cell.dataset.ismaster == "true") {
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

      selectedCol = null;
      selectedRow = null;
    });
  });
  $: columnsCountChanged(sheet.columns);

  const columnsCountChanged = columnCount => {
    console.log('changed', columnCount);
    let columnsDiv = document.querySelectorAll('.column');

    columnsDiv.forEach(column => {
      column.addEventListener('mousedown', function (e) {
        curCol = e.target.parentElement;
        pageX = e.pageX;
        curColWidth = curCol.offsetWidth;
        // if (nxtCol) nxtColWidth = nxtCol.offsetWidth;
      });
    });
  };

  const defaultCell: () => Cell = () => {
    return {
      value: '',
      formatting: {
        align: 'center',
        color: 'white',
        backgroundColor: '#242424'
      }
    };
  };

  const mergeCell = (topLeftRow, topLeftCol, bottomRightRow, bottomRightCol) => {
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
    sheet.mergedCells[master] = {
      master,
      slaves
    };

    if (!sheet.cells[master]) {
      sheet.cells[master] = defaultCell();
    }

    sheet.cells[master].rowSpan = bottomRightRow - topLeftRow + 1;
    sheet.cells[master].colSpan = bottomRightCol - topLeftCol + 1;

    slaves.forEach(slave => {
      if (!sheet.cells[slave]) {
        sheet.cells[slave] = defaultCell();
      }
      sheet.cells[slave].isMerged = true;
    });
  }

  const unMergeCell = (row, col) => {
    console.log(sheet)
    const master = `${row}-${col}`;
    const slaves = sheet.mergedCells[master].slaves;

    if (!sheet.cells[master]) {
      sheet.cells[master] = defaultCell();
    }

    const updatedSheet = {...sheet};

    delete updatedSheet.cells[master].rowSpan
    delete updatedSheet.cells[master].colSpan;

    slaves.forEach(slave => {
      if (!sheet.cells[slave]) {
        updatedSheet.cells[slave] = defaultCell();
      }
      delete updatedSheet.cells[slave].isMerged;
    });

    delete updatedSheet.mergedCells[master];
    sheet = updatedSheet;
  }


  let sheet: Sheet = {
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
      },
      
    },
    mergedCells: {
      
    }
  };

  const setCellAlign = (i, j, align) => {
    if (!sheet.cells[`${i}-${j}`]) {
      sheet.cells[`${i}-${j}`] = defaultCell();
    }
    sheet.cells[`${i}-${j}`].formatting.align = align;
  };

  $: selectedCell = sheet.cells[`${selectedRow}-${selectedCol}`];

  const getCellWidth = (i,j) => {
    if (!sheet.mergedCells[`${i}-${j}`]) {
      return (sheet.columnsWidth[j] || 150)+"px";
    }
    return '100%';
  }
</script>

<main>
  <div class="top-bar">
    <div>
      <button on:click={() => (sheet.columns += 1)}>Add column</button>
      <button on:click={() => (sheet.columns -= 1)}>Remove column</button>
      <button on:click={() => (sheet.rows += 1)}>Add row</button>
      <button on:click={() => (sheet.rows -= 1)}>Remove row</button>
      <button on:click={() => mergeCell(2,2, 4,4)}>Merge</button>
      <button on:click={() => unMergeCell(2,2)}>Unmerge</button>
      <button
        on:click={() => {
          setCellAlign(selectedRow, selectedCol, 'left');
        }}>Left</button
      >
      <button
        on:click={() => {
          setCellAlign(selectedRow, selectedCol, 'center');
        }}>Center</button
      >
      <button
        on:click={() => {
          setCellAlign(selectedRow, selectedCol, 'right');
        }}>Right</button
      >
    </div>
    <div class="bg-red-300">
      <input
        class="ignore-select"
        value={selectedCell?.value || ''}
        on:input={e => {
          if (!sheet.cells[`${selectedRow}-${selectedCol}`]) {
            sheet.cells[`${selectedRow}-${selectedCol}`] = defaultCell();
          }
          selectedCell.value = e.target.value;
        }}
        on:blur={() => {
          selectedCol = null;
          selectedRow = null;
        }}
        on:keydown={e => {
          if (e.key === 'Enter') {
            e.target.blur();
          }
        }}
      />
    </div>
  </div>
  <section
    class="flex-1 overflow-auto flex flex-row lol border border-yellow-500"
  >
    <div class="">
      <div
          class="row-index"
      >
        
      </div>
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
          <div class="cell-resizer" />
        </div>
      {/each}
      {#each {length: sheet.rows} as _, i}

        {#each {length: sheet.columns} as _, j}
          <!-- svelte-ignore a11y-click-events-have-key-events -->
          <!-- svelte-ignore a11y-no-static-element-interactions -->
          {#if !(sheet.cells[`${i}-${j}`]?.isMerged && sheet.cells[`${i}-${j}`]?.isMerged)}
          <!-- Merged -->
            <div
              class="cell"
              style="background-color: {sheet.cells[`${i}-${j}`]
                ?.formatting?.bgColor || '#242424'}; color: {sheet.cells[
                `${i}-${j}`
              ]?.formatting?.color || 'rgba(255, 255, 255, 0.87)'};
                grid-row: {i + 2} / span {sheet.cells[`${i}-${j}`]?.rowSpan ||
                1}; grid-column: {j + 1} / span {sheet.cells[`${i}-${j}`]
                ?.colSpan || 1};"
              data-row={i}
              data-col={j}
              data-isMaster={!!sheet.mergedCells[`${i}-${j}`]}
              class:justify-start={sheet.cells[`${i}-${j}`]?.formatting
                ?.align === 'left'}
              class:justify-center={sheet.cells[`${i}-${j}`]?.formatting
                ?.align === 'center'}
              class:justify-end={sheet.cells[`${i}-${j}`]?.formatting?.align ===
                'right'}
              on:click={() => {
                if (selectedCol === j && selectedRow === i) {
                  return;
                }
                selectedRow = i;
                selectedCol = j;
              }}
            >
              {#if selectedCol === j && selectedRow === i}
                <input
                  class="w-full h-full background-black"
                  id="cell-input"
                  value={sheet.cells[`${i}-${j}`]?.value || ''}
                  on:change={e => {
                    if (!sheet.cells[`${i}-${j}`]) {
                      sheet.cells[`${i}-${j}`] = defaultCell();
                    }
                    sheet.cells[`${i}-${j}`].value = e.target.value;
                  }}
                  on:blur={() => {
                    selectedCol = null;
                    selectedRow = null;
                  }}
                  on:keydown={e => {
                    if (e.key === 'Enter') {
                      selectedCol = null;
                      selectedRow = null;
                    }
                  }}
                />
              {:else}
                <div class="ignore-select">
                  {sheet.cells[`${i}-${j}`]?.value || ''}
                </div>
              {/if}
            </div>
          {/if}
        {/each}
        <!-- </div> -->
      {/each}
    </div>
  </section>
  <div class="bottom-bar">Bottom</div>
</main>

<style>
  main {
    height: 100vh;
    display: flex;
    flex-direction: column;
    justify-content: baseline;
  }
  .bottom-bar {
    background-color: red;
    height: 30px;
  }

  .top-bar {
    height: 100px;
  }

  .header {
    position: sticky;
    top: 0;
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
    justify-content: center;
    align-items: center;
  }

  .cell input {
    text-align: center;
  }

  .cell div {
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .cell-resizer {
    position: absolute;
    top: 0;
    right: 0;
    width: 2px;
    cursor: col-resize;
    /* remove backGroundColor later */
    background-color: gray;
    user-select: none;
    /* table height */
    height: 50px;
  }

  /* [data-ismaster="true"] {
    background-color: red !important;
    width: 100% !important;
    border: 2px solid red;
  } */
</style>
