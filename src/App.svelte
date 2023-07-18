<script lang="ts">
  import {onMount} from 'svelte';

  let pageX, curCol, curColWidth;

  let selectedCol = null;
  let selectedRow = null;

  let timeout = null;

  onMount(() => {
    const worksheet = document.querySelector('.worksheet');
    console.log(worksheet);
    worksheet.addEventListener('scroll', function () {
      console.log('SAD');
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

        sheet.columnsWidth[curCol.dataset.column] = newWidth;

        // cells.forEach(cell => {
        //   cell.style.width = newWidth + 'px';
        // });

        // curCol.style.width = newWidth + 'px';
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

  const defaultCell = () => {
    return {
      value: '',
      align: 'center',
      color: 'white',
      backgroundColor: '#242424'
    };
  };

  const sheet = {
    rows: 20,
    columns: 15,
    columnsWidth: {
      0: 300
    },
    cells: {
      '0-0': {
        value: 'Hello',
        align: 'center',
        // color: 'rgba(255, 255, 255, 0.87)',
        backgroundColor: '#242424'
      }
    }
  };

  const setCellAlign = (i, j, align) => {
    if (!sheet.cells[`${i}-${j}`]) {
      sheet.cells[`${i}-${j}`] = defaultCell();
    }
    sheet.cells[`${i}-${j}`].align = align;
  };

  $: selectedCell = sheet.cells[`${selectedRow}-${selectedCol}`];
</script>

<main>
  <div class="top-bar">
    <div>
      <button on:click={() => (sheet.columns += 1)}>Add column</button>
      <button on:click={() => (sheet.columns -= 1)}>Remove column</button>
      <button on:click={() => (sheet.rows += 1)}>Add row</button>
      <button on:click={() => (sheet.rows -= 1)}>Remove row</button>
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
    class="flex-1 overflow-auto flex flex-col lol border border-yellow-500"
  >
    <div
      class="worksheet grid flex-1 w-full"
      style="grid-template-rows: repeat({sheet.rows +
        1},auto);grid-template-columns: repeat({sheet.columns + 1},auto)"
    >
      <div class="row-index sticky left-0" />
      {#each {length: sheet.columns} as _, j}
        <div
          class="cell relative column"
          data-column={j}
          style="width: {sheet.columnsWidth[j] || 150}px"
        >
          {j}
          <div class="cell-resizer" />
        </div>
      {/each}
      {#each {length: sheet.rows} as _, i}
        <!-- <div class="row"> -->
        <div class="row-index">{i + 1}</div>
        {#each {length: sheet.columns} as _, j}
          <!-- svelte-ignore a11y-click-events-have-key-events -->
          <!-- svelte-ignore a11y-no-static-element-interactions -->
          <div
            class="cell"
            style="width: {sheet.columnsWidth[j] ||
              150}px; background-color: {sheet.cells[`${i}-${j}`]?.background ||
              '#242424'}; color: {sheet.cells[`${i}-${j}`]?.color ||
              'rgba(255, 255, 255, 0.87)'}"
            data-row={i}
            data-col={j}
            class:justify-start={sheet.cells[`${i}-${j}`]?.align === 'left'}
            class:justify-center={sheet.cells[`${i}-${j}`]?.align === 'center'}
            class:justify-end={sheet.cells[`${i}-${j}`]?.align === 'right'}
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
    z-index: 1;
  }

  .horizontal-scroll-container {
    display: flex;
    overflow-x: auto;
    scroll-behavior: smooth;
  }

  .worksheet {
    overflow: scroll;
  }
  .back {
    z-index: -1;
  }
  .row {
    display: grid;
    grid-template-columns: repeat(16, auto);
    /* grid-template-rows: repeat(20, auto); */
    /* width: 100%; */
    /* height: 100%; */
  }

  .row-index {
    width: 50px;
    height: 50px;
    border: 1px solid black;
    display: flex;
    justify-content: center;
    align-items: center;
    /* position: sticky; */
    /* left: 0; */
  }
  .header .column {
    width: 150px;
    height: 50px;
    border: 1px solid black;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .cell {
    width: 150px;
    height: 50px;
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
</style>
