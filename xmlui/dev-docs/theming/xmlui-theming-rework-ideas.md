component-layout.resolver.test.ts includes responsive layout resolve tests


# theming rework

```html
 <!-- button-theme-class example -->
<style>
  .button-theme-class {
    --var-xmlui-transition-Button: all 0.3s ease;
    --var-xmlui-gap-Button: 8px;
  }
  .button-base {
    line-height: normal;
    min-width: 0;
    padding: 0;
    margin: 0;
    border-style: solid;
    transition: var(--xmlui-transition-Button);
    user-select: none;
    cursor: pointer;
    display: flex;
    gap: var(--xmlui-gap-Button);
    justify-content: center;
    align-items: center;
  }
  .button-dynamic-cks3jxf {
    width: 200px;
  }
  .button-dynamic-ckasdfa {
    width: 300px;
  }
</style>


<!-- <Button width="200px" >click me</Button>   -->
<!-- <Button width="300px" >click me 2</Button>   -->
<button class="button-theme-class button-base button-dynamic-cks3jxf">click me</button>
<button class="button-theme-class button-base button-dynamic-ckasdfa">click me 2</button>


<!-- responsive stack example -->

<!--  <Stack orientation='vertical'
             horizontalAlignment='center'
             orientation-lg='horizontal'
             reverse='true'
             reverse-md='false'
      />
 -->

<style>
  .stack{
    display: flex;
    flex-direction: column-reverse;
    justify-content: center;
  }
  @media (min-width: 792px) {
    flex-direction: column;
  }

  @media (min-width: 992px) {
    .stack{
      flex-direction: row;
      justify-content: flex-start;
      align-items: center;
    }
  }

</style>


<div class="stack"></div>


```