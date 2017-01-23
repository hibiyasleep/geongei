'use strict'

const request = require('request')
const moment = require('moment')
const iconv = require('iconv-lite')

const URL = (y, m) => `http://cafe.naver.com/CalendarViewAjax.nhn?clubid=18795031&registCalendar=true&year=${y}&month=${m}`
const REGEX = {
  delim: /[,\/]/,
  count: /(\d)대/,
  duration: /(\d)시간/
}
const MACHINE = { // sort by frequncy
  'sdvx': /사볼/,
  'iidx': /투덱/,
  'jubeat': /유(비트|빗)/,
  'drum': /드럼/
}

class Rent {

  constructor(c) { // c=calendar object
    this.aid = c.articleid
    this.cid = c.scheduleid

    this.start = new moment(c.startDate)
    this.end = new moment(c.endDate)
    this.date = this.start.date()

    this.comment = c.place
    this.totalDuration = this.end.diff(this.start, 'hours')

    this.devices = this._parseContent(c.content)
  }

  _parseContent(s) {
    let r = {}

    s.split(REGEX.delim).forEach(_ => {
      let machine, duration, count = 1

      for(let k in MACHINE) {
        if(MACHINE[k].test(_)) {
          machine = k
          continue
        }
      }
      if(!machine) return

      r[machine] = {}

      for(let k of ['duration', 'count']) {
        let o = REGEX[k].exec(_)
        if(o) {
          r[machine][k] = parseInt(o[1])
        }
      }
      r[machine].count = r[machine].count || 1
    })

    return r
  }

}

class Geongei {

  constructor(year, month) {
    const d = new Date()
    this.rents = []

    if(!month || month < 1 || 12 < month) {
      this.month = d.getMonth() + 1
    }
    if(!year || year < 2009) {
      this.year = d.getYear() + 1900
    }
  }

  fetch(callback) {
    request
      .get(URL(this.year, this.month))
      .pipe(iconv.decodeStream('euc-kr'))
      .pipe(iconv.encodeStream('utf-8'))
      .collect((e, d) => {
        if(e) {
          callback(e, null)
          return
        }

        let o = JSON.parse(d)
        o.returnValue.todo.forEach(_ => {
          let r = new Rent(_)
          if(!this.rents[r.date]) {
            this.rents[r.date] = [r]
          } else {
            this.rents[r.date].push(r)
          }
        })
        if(callback) callback(null, this)
      })
  }

  get today() {
    let today = moment()
    return this._get(today.month() + 1, today.date())
  }
  get tomorrow() {
    let tomorrow = moment().add(1, 'day')
    return this._get(tomorrow.month() + 1, tomorrow.date())
  }

  _get(m, d) {
    if(m !== this.month) {
      return false
    } else {
      return this.rents[d]
    }
  }

}

module.exports = Geongei
