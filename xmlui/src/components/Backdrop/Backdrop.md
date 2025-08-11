%-DESC-START 

```xmlui-pg copy display name="Example: using Backdrop"
<App>
  <Backdrop opacity="0.6">
    <Image 
      src="/resources/images/components/image/breakfast.jpg" 
      fit="cover" width="400px" />
    <property name="overlayTemplate">
      <VStack verticalAlignment="center" height="100px">
        <H1 color="white" textAlign="center">Great breakfast!</H1>
      </VStack>
    </property>
  </Backdrop>
</App>
```

%-DESC-END
