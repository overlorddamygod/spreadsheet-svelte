<script lang="ts">
  import appState from '../state';
  import workbook, {addWorkSheet} from '../state/workbook';
</script>

<div class="bottom-bar flex items-center p-2 gap-1">
  {#each $workbook.worksheets as worksheet, i}
    <button
      class="button worksheet border px-2"
      class:border-zinc-700={i != $appState.currentWorkBook}
      on:click={() => {
        appState.update(a => {
          a.currentWorkBook = i;
          return a;
        });
      }}
    >
      {worksheet.name}
    </button>
  {/each}
  <button
    class="button flex items-center justify-center"
    on:click={() => addWorkSheet()}>+</button
  >
</div>

<style>
  .bottom-bar {
    height: 30px;
    overflow: scroll;
  }
</style>
