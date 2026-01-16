# Currency Formatting

**Complexity:** Easy

Let's use custom components with input fields we already have and provide new global functions for formatting and validating.

```xml
<script>
  // Format for display
  // ex. 1234.56, "USD" -> "$1234.56" 
  currencyFormat(value, currency, options)
  
  // Validate
  currencyValidate(value, currency, options)

  // Formatted currency string to stripped down number
  // ex. "€1.234,56" -> 1234.56
  currencyToNumber(string, currency, locale)
</script>
```

```xml
<variable name="val1" value="currencyFormat(100, { currency: 'USD', locale: 'en-US' })" />
<TextBox id="field1" initialValue="{val1}" />
<TextBox id="field2" initialValue="{val1}" pattern="currency" />
<!-- pattern="currency" uses a currencyValidate function that can also be accessed via global functions -->
<script>
  var val2 = currencyValidate("$123.456", "USD", { locale: "en-US" });
  console.log(currencyToNumber(val2));
</script>
<!-- hypothetical autoformatting of initial value -->
<TextBox initialValue="100" pattern="currency" />
```

## Different Display Formats

```xml
<!-- Different display formats -->
<Text>{currencyFormat(1234.56, 'USD', { style: 'symbol' })}</Text>
<!-- $1,234.56 -->

<Text>{currencyFormat(1234.56, 'USD', { style: 'code' })}</Text>
<!-- USD 1,234.56 -->

<Text>{currencyFormat(1234.56, 'USD', { style: 'name' })}</Text>
<!-- 1,234.56 US dollars -->

<Text>{currencyFormat(1234.56, 'USD', { style: 'accounting' })}</Text>
<!-- ($1,234.56) for negative -->
```

## Precision and Grouping

If we use the current `"pattern"` property, we would need to provide some options. 

```xml
<TextBox initialValue="100" pattern="currency" patternOptions="{{ decimals: 2, useGrouping: true }}" />
```

## Input Behavior: Currency

We could create a `behavior` using this solution, where a select group of properties all fall under the same behavior:

```xml
<!-- format="currency" enables behavior, currency and decimals properties modify behavior -->
<TextBox 
  value="{amount}" 
  format="currency"
  currency="USD"
  decimals="2"
/>
```

## Potential Subsequent Features to Consider

- Support currency operations
- CurrencyInput (if necessary): built-in dropdown to select currency
- Use browser agent location for locale and currency as default
- Multi-currency support: currency conversion
