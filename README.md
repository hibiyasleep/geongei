건게이
======

대여 정책 제발

Usage
-----

```js
const moment = require('moment')
const Geongei = require('geongei')

const FORMAT = 'M월 D일 H시'

Geongei((e, c) => {
  if(e) return console.error(e)

  c.rents.forEach(day => {
    day.forEach(_ => {
      console.log(`#${_.aid}: ${_.start.format(FORMAT)}부터 ${_.totalDuration}시간 (${_.comment})`)
      for(let k in _.devices) {
        let v = _.rents[k]
        console.log(`* ${k}: ${v.duration || '-'}시간 ${v.count || 1}대`)
      }
    })
  })
})
```

Docs
----

### Geongei (GeongeiFetcher)

`Geongei([option,] callback)`

* `option`: Object
  * `year`
  * `month`
  * `collection`: if it's `GeongeiCollection`, callback will provide merged collection.
* `callback`: function
  * `e`: error (from request)
  * `c`: collection

### GeongeiCollection

* `.rents`: Array of (Array of `Rent`). Day of Month is used to index.
* `#append(year, month, raw)`: Get `returnValue.todo`, parse, and save them.
* `#merge(collection)`: Merge `collection` onto this collection.
* `.today`: Today's `Rent`s.
* `.tomorrow`: Tomorrow's `Rent`s. `false` if tomorrow is next month, etc.

### Rent

* `.aid`: article id, naver cafe-related.
* `.sid`: schedule id, naver cafe-related.
* `.start`, `end`: `moment` object
* `.date`: date of month, of start time
* `.comment`: related comment (usually 'who rented this device')
* `.totalDuration`: `end - start`, in hour
* `.devices`: Object
  * key: `sdvx`, `iidx`, `jubeat`, `drum`
  * value:
    * `duration`: in hour, if specified
    * `count`: count of device, default 1
