<script lang="ts">
  import appState, {setSelectedCell} from '../state';
  import {
    mergeCell,
    setCellAlign,
    setCellValue,
    toggleBold,
    toggleItalic,
    toggleUnderline,
    unMergeCell
  } from '../state/workbook';
  import workbook from '../state/workbook';

  $: selectedCell =
    $workbook.worksheets[$appState.currentWorkBook].cells[
      `${$appState.selectedRow}-${$appState.selectedColumn}`
    ];
</script>

<div class="top-bar flex flex-col">
  <div class="flex border-b">
    <div>File</div>
    <div>File</div>
    <div>File</div>
    <div>File</div>
  </div>

  <div class="flex-1 border-b">
    <button
      class="ignore-select button"
      class:selected={selectedCell?.formatting?.align === 'left'}
      on:click={() => {
        setCellAlign(
          $appState.currentWorkBook,
          $appState.selectedRow,
          $appState.selectedColumn,
          'left'
        );
      }}>Left</button
    >
    <button
      class="ignore-select button"
      class:selected={selectedCell?.formatting?.align === 'center'}
      on:click={() => {
        setCellAlign(
          $appState.currentWorkBook,
          $appState.selectedRow,
          $appState.selectedColumn,
          'center'
        );
      }}>Center</button
    >
    <button
      class="ignore-select button"
      class:selected={selectedCell?.formatting?.align === 'right'}
      on:click={() => {
        setCellAlign(
          $appState.currentWorkBook,
          $appState.selectedRow,
          $appState.selectedColumn,
          'right'
        );
      }}>Right</button
    >
    <button
      class="ignore-select button"
      class:selected={selectedCell?.formatting?.bold}
      on:click={() => {
        toggleBold(
          $appState.currentWorkBook,
          $appState.selectedRow,
          $appState.selectedColumn
        );
      }}>B</button
    >
    <button
      class="ignore-select button"
      class:selected={selectedCell?.formatting?.italic}
      on:click={() => {
        toggleItalic(
          $appState.currentWorkBook,
          $appState.selectedRow,
          $appState.selectedColumn
        );
      }}>I</button
    >
    <button
      class="ignore-select button"
      class:selected={selectedCell?.formatting?.underline}
      on:click={() => {
        toggleUnderline(
          $appState.currentWorkBook,
          $appState.selectedRow,
          $appState.selectedColumn
        );
      }}>U</button
    >

    <button
      class="button"
      on:click={() => mergeCell($appState.currentWorkBook, 2, 2, 4, 4)}
      >Merge</button
    >
    <button
      class="button"
      on:click={() => unMergeCell($appState.currentWorkBook, 2, 2)}
      >Unmerge</button
    >
  </div>
  <div class="flex">
    <div class="cube flex justify-center items-center">
      {#if $appState.selectedRow != null && $appState.selectedColumn != null}
        {$appState.selectedRow},{$appState.selectedColumn}
      {/if}
    </div>
    <input
      class="ignore-select w-full px-2"
      value={selectedCell?.formula || selectedCell?.value || ''}
      on:change={e => {
        setCellValue(
          $appState.currentWorkBook,
          $appState.selectedRow,
          $appState.selectedColumn,
          e.target.value
        );
      }}
      on:blur={() => {
        setSelectedCell(null, null);
      }}
      on:keydown={e => {
        if (e.key === 'Enter') {
          // e.target.blur();
        }
      }}
    />
  </div>
</div>

<style>
  .top-bar {
    height: 100px;
  }

  .cube {
    width: 50px;
    height: 30px;
  }
</style>
