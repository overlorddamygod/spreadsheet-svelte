<script lang="ts">
  import TopBar from './lib/TopBar.svelte';
  import BottomBar from './lib/BottomBar.svelte';
  import Sheet from './lib/Sheet.svelte';
  import appState from './state';
</script>

<main>
  <TopBar />
  <Sheet workbookIndex={$appState.currentWorkBook} />
  <BottomBar />
</main>

<style>
  main {
    height: 100vh;
    display: flex;
    flex-direction: column;
    justify-content: baseline;
  }
</style>
