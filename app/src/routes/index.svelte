<script>
  import Stage from "@/components/Stage";
  import Inspector from "@/components/Inspector";
  import Outline from "@/components/Outline";
  import ToolBar from "@/components/ToolBar";
  import { onMount } from "svelte";
</script>

<style>
  .view.default {
    display: flex;
    flex-direction: column;
    flex-grow: 1;
  }
  .c1 {
    display: flex;
    flex-grow: 1;
  }
  .stage {
    display: flex;
    flex-grow: 1;
    border: 1px solid #333;
  }
  .inspector {
    place-self: stretch end;
    min-width: 200px;
    background-color: #aaa;
  }
  .toolbar {
    background-color: #eee;
  }
  .outline {
    background-color: #eee;
    place-self: stretch start;
    min-width: 200px;
  }
</style>

<div class="view default">
  <div class="toolbar">
    <ToolBar />
  </div>
  <div class="c1">
    <div class="outline">
      <Outline />
    </div>
    <div class="stage">
      <Stage />
    </div>
    <div class="inspector">
      <Inspector />
    </div>
  </div>
  <div class="debug">
    <input type="range" on:input={e => (camera.x = e.target.value * 1 * 10)} />
  </div>
</div>
