<svelte:options accessors />

<script lang="ts">
  import type { Stream } from '../../core';
  import { ViewContainer } from '@marcellejs/design-system';

  export let title: string;
  export let text: Stream<string>;
</script>

<ViewContainer {title}>
  <div class="grow whitespace-pre-line">
    {#if $text}
      {@html $text}
    {/if}
  </div>
</ViewContainer>
