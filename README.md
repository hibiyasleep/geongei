건게이
======

대여 정책 제발

Usage
-----

```js
const Geongei = require('geongei')

const FORMAT = 'M월 D일 H시'

Geongei({
  year: 2017,
  month: 1
}, (e, c) => {
  if(e) return console.error(e)

  c.rents[2017][1].forEach(day => {
    day.forEach(_ => {
      console.log(`#${_.aid}: ${_.start.format(FORMAT)}부터 ${_.totalDuration}시간 (${_.comment})`)
      for(let k in _.devices) {
        let v = _.devices[k]
        console.log(`* ${k}: ${v.duration || _.totalDuration}시간 ${v.count || 1}대`)
      }
    })
  })
})
```

```
...
#57750: 1월 22일 9시부터 2시간 (**님 예약.)
* sdvx: 2시간 2대
#57757: 1월 23일 10시부터 6시간 (*****님 예약.)
* iidx: 6시간 1대
#57744: 1월 24일 9시부터 4시간 (******** 님 예약.)
* iidx: 4시간 1대
#57730: 1월 27일 10시부터 3시간 (**님 예약.)
* sdvx: 3시간 1대
#57730: 1월 28일 10시부터 3시간 (**님 예약.)
* sdvx: 3시간 1대
#57730: 1월 29일 10시부터 3시간 (**님 예약.)
* sdvx: 3시간 1대
#57753: 1월 30일 11시부터 4시간 (*님 예약.)
* sdvx: 4시간 1대
#57730: 1월 30일 11시부터 2시간 (**님 예약.)
* sdvx: 2시간 1대
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
