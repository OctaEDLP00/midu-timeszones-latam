import { changeTimeZone, transformDateToString } from './date'
import countries from './json/countries.json'

export const $ = (selector) => document.querySelector(selector)
export const $input = $('#date')
export const $section = $('section')
export const $switch = $('#toogle-switch')

export const showUTCHours = () => {
  const date = $input.value
  const dateFormat = $switch.checked
  const mainDate = new Date(date)
  const times = {}
  countries.forEach(country => {
    const { country_code: code, emoji, timezones } = country
    const [timezone] = timezones
    const dateInTimezone = changeTimeZone(mainDate, timezone)
    const hour = dateInTimezone.getHours()
    times[hour] ??= []

    times[hour].push({
      date: dateInTimezone,
      code,
      emoji,
      timezones
    })
  })

  const sortedTimesEntries = Object
    .entries(times)
    .sort(([timeA], [timeB]) => timeB - +timeA)

  const html = sortedTimesEntries.map(([, countries]) => {
    const flags = countries.map(country => `${country.emoji}`).join(' ')
    const [country] = countries
    const { date } = country
    return `
    <article class='min-w-max w-full rounded-2xl flex border-4 border-double border-cyand-500 dark:border-cyan-700 p-2'>
      <span class='font-CascadiaCodePL'>${transformDateToString(date, dateFormat)}</span>
      <p class='ml-2 font-Emoji'>
        ${flags}
      </p>
    </article>
    `
  })

  $section.innerHTML = html.join('')
}

function roundToNextHour (date) {
  date.setHours(date.getHours() + Math.ceil(date.getMinutes() / 60) - 1)
  date.setMinutes(0)
  return date
}

/**
 * It rounds the current date to the neareast next hour,
 * converts it to ISO format in local timezone,
 * then removes seconds and milliseconds from the ISO string
 * and finally set the resulting string-date into the date input.
 */
export const setInitialDate = () => {
  const dt = roundToNextHour(new Date())
  // console.log(dt.toISOString()) // -> 2022-09-01T02:00:00.000Z
  // console.log(dt.getTimezoneOffset()) // -> 240 (GMT-4)

  const tzOffset = dt.getTimezoneOffset() * 60 * 1000
  const localTs = dt.getTime() - tzOffset
  const localDate = new Date(localTs)
  // console.log(localDate.toISOString()) // -> 2022-08-31T22:00:00.000Z

  const iso = localDate.toISOString().slice(0, 16) // keep the first 16 chars (YYYY-MM-DDTHH:mm)
  // console.log(iso) // -> '2022-08-31T22:00'

  $('#date').value = iso
}
