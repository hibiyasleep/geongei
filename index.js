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

class GeongeiCollection {

  constructor() {
    this.rents = {}
  }

  append(year, month, raw) {
    if(!(year in this.rents)) this.rents[year] = {}
    if(!(month in this.rents[year])) this.rents[year][month] = {}

    raw.forEach(_ => {
      let r = new Rent(_)
      if(!this.rents[year][month][r.date]) {
        this.rents[year][month][r.date] = [r]
      } else {
        this.rents[year][month][r.date].push(r)
      }
    })
  }

  merge(collection) {
    collection.rents.forEach((y, yk) => {
      y.forEach((m, mk) => {
        this.rents[yk][mk] = m
      })
    })
  }

  get today() {
    let today = moment()
    return this._get(today.year(), today.month() + 1, today.date())
  }
  get tomorrow() {
    let tomorrow = moment().add(1, 'day')
    return this._get(tomorrow.year(), tomorrow.month() + 1, tomorrow.date())
  }

  _get(y, m, d) {
    if(!(y in this.rents) || !(m in this.rents[y])) {
      return false
    } else {
      return this.rents[y][m][d]
    }
  }
}

const Geonget = function GeongeiFetcher(option, callback) {
  const d = new Date()

  if(arguments.length === 1) {
    callback = option
    option = undefined
  }
  if(!('month' in option) || option.month < 1 || 12 < option.month) {
    option.month = d.getMonth() + 1
  }
  if(!('year' in option) || option.year < 2009) {
    option.year = d.getYear() + 1900
  }

  request
    .get(URL(option.year, option.month))
    .pipe(iconv.decodeStream('euc-kr'))
    .pipe(iconv.encodeStream('utf-8'))
    .collect((e, d) => {
      if(e) {
        callback(e, null)
        return
      }

      let o = JSON.parse(d)
      let c

      if(option.collection instanceof GeongeiCollection)
        c = option.collection
      else
        c = new GeongeiCollection()

      c.append(year, month, o.returnValue.todo)
      if(callback) callback(null, c)
    })
}

module.exports = Geonget
