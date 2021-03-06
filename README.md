# AMD
This module implements an aynchronous module definition API

## Examples

### Module Definition

```javascript
  amd.define('MyCalculator', [], function() {
    
      function MyCalculator() {
        this._value = 0;
      }
      
      MyCalculator.prototype.sum = function(a,b) {
        if (typeof b === 'undefined') {
          this._value += a;
        } else {
          return a + b;
        }
      };
      
      MyCalculator.prototype.getValue = function() {
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
