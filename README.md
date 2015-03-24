# AMD
This module implements an aynchronous module definition system

## Examples

### Module Definition

```javascript
  amd.define('MyCalculator', [], function() {
    
      function MyCaluculator() {
        this._value = 0;
      }
      
      MyCalculator.prototoype.sum = function(a,b) {
        if (typeof b === 'undefined') {
          this._value += a;
        } else {
          return a + b;
        }
      };
      
      MyCalculator.prototoype.getValue = function() {
        return this._value;
      };
      
      return MyCalculator;
  
  });
```

### Module Requirement

```javascript
  amd.require(['MyCalculator'], function(MyCalculator) {
    
      var myCalculator = new MyCalculator();
      myCalculator.sum(14);
      
      console.log(myCalculator.getValue());
  
  });
```
