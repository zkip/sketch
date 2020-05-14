<script>
  let tools = ["移动", "钢笔", "修改器"];
</script>

<style>
  .ToolBar {
    display: flex;
  }
  .ToolBar > * {
    margin: 0.2rem 0.5rem;
  }
</style>

<div class="ToolBar">
  {#each tools as t}
    <div>{t}</div>
  {/each}
</div>
