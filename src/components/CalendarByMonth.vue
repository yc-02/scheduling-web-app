<script setup lang="ts">
import { dateSlug, daysInWeek, getDateWithoutTime, renderMonth } from '@/utils/dateUtils'
import { ref, computed } from 'vue'
import { RouterLink } from 'vue-router'

const props = defineProps<{
  datesWithItems:string[]
}>()

const today = new Date()
const todayDate = today.getDate()
const thisYear = today.getFullYear()
const thisMonth = today.getMonth()
const year = ref(thisYear)
const month = ref(thisMonth)
//send month to parents
const emit = defineEmits(['changeMonth', 'clickedDate'])
//get next month calendar
const nextMonth = () => {
  month.value++
  if (month.value > 11) {
    month.value = 0
    year.value++
  }
  emit('changeMonth', month.value)
  emit('clickedDate',new Date(`${thisYear}-${month.value+1}-1`))
}
// get last month
const prevMonth = () => {
  month.value--
  if (month.value < 0) {
    month.value = 11
    year.value--
  }
  emit('changeMonth', month.value)
  emit('clickedDate',new Date(`${thisYear}-${month.value+1}-1`))
}

//get today calendar
const getToday = () => {
  year.value = thisYear
  month.value = thisMonth
  emit('changeMonth', month.value)
  emit('clickedDate',getDateWithoutTime(today))
}

//get first Day of the month
const getFirstDay = computed(() => {
  return new Date(year.value, month.value, 1).getDay()
})

// get last date of the month
const getLastDate = computed(() => {
  return new Date(year.value, month.value + 1, 0).getDate()
})

//calendar dates by month, each month render total 42 days(include last month some days and next month some days)
const calendarDates = computed(() => {
  const lastDate = getLastDate.value
  const firstDay = getFirstDay.value
  const dates: { datesNumber: number; dates: Date; special: string | null | number }[] = []
  for (let date = 1 - firstDay; date <= 42 - firstDay; date++) {
    dates.push({
      datesNumber: new Date(year.value, month.value, date).getDate(),
      dates: new Date(year.value, month.value, date),
      special: new Date(year.value, month.value, date).getDate()
    })
  }
  dates[firstDay].special = `${renderMonth(month.value)} 1`
  dates[lastDate + firstDay].special = `${renderMonth(month.value + 1)} 1`
  if (month.value === thisMonth && year.value === thisYear) {
    dates[firstDay + todayDate - 1].special = `${todayDate} Today`
  }

  return dates
})

//css style for today cell
function todayStyle(index: number) {
  if (
    index === getFirstDay.value + todayDate - 1 &&
    month.value === thisMonth &&
    year.value === thisYear
  ) {
    return true
  } else {
    return false
  }
}

//css style for next month dates in this month
function nextMonthDatesStype(index: number) {
  if (index >= getFirstDay.value + getLastDate.value) {
    return true
  } else {
    return false
  }
}

const handleClickDate = (date: Date) => {
  emit('clickedDate', date)
}
</script>

<template>
  <div class="container">
    <div class="titleContainer">
      <p class="calendarDate">{{ renderMonth(month) }} {{ year }}</p>
      <button @click="prevMonth" class="calendarButton">
        <font-awesome-icon icon="fa-solid fa-chevron-left" />
      </button>
      <button @click="getToday" class="calendarButton">Today</button>
      <button @click="nextMonth" class="calendarButton">
        <font-awesome-icon icon="fa-solid fa-chevron-right" />
      </button>
      <!-- <button @click="year--">Last Year</button>
      <button @click="year++">Next Year</button> -->
    </div>
    <div class="calendar">
      <p v-for="day in daysInWeek" :key="day" class="grid-days">
        {{ day }}
      </p>
      <div
        v-for="({ dates, special }, index) in calendarDates"
        class="grid-dates"
        @click="handleClickDate(dates)"
        :key="index"
        :class="{ pastDates: index < getFirstDay, nextMonthDates: nextMonthDatesStype(index) }"
      >
        <RouterLink
          :to="{ name: 'activities', params: { slug: `${dateSlug(dates)}` } }"
          class="projectLink"
        >
          <p class="dateItems" :class="{ today: todayStyle(index)}">{{ special }}</p>
        </RouterLink>
        <!-- show on small screen -->
        <div class="smScreenItems">
          <p :class="{ today: todayStyle(index),datesWithItems:datesWithItems.includes(dates.toString())}">
            {{ special?.toString().includes('Today')?special?.toString().trim().split(' ')[0]:special }}
          </p>
        </div>
        <slot name="project" :datesAndIndex="{ dates, index, month }"></slot>
      </div>
    </div>
  </div>
</template>
<style scoped>
.container {
  min-height: 73vh;
  background-color: whitesmoke;
  border-radius: 10px;
  padding: 20px;
  overflow: auto;
}
.calendar {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 3px;
}
.titleContainer {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  padding: 10px;
  gap: 10px;
}
.dateItems:hover,
.calendarButton:hover {
  color: var(--primary-color);
}
.calendarButton,
.calendarDate {
  font-size: 16px;
  font-weight: 600;
}
.dateItems {
  padding-left: 10px;
  padding-top: 6px;
}

.grid-dates {
  min-height: 10vh;
  background-color: white;
  border-radius: 5px;
}
.grid-days {
  padding: 10px;
  min-height: 30px;
  background-color: white;
  border-radius: 5px;
}

.pastDates,
.nextMonthDates {
  color: var(--text-color-light);
}

.today {
  color: var(--secondary-color-dark);
}

.smScreenItems {
  display: none;
}

@media screen and (max-width: 1000px) {
  .container {
    min-height: 35vh;
    background-color: inherit;
    padding: 0;
    overflow-x: hidden;
  }
  .titleContainer{
    min-height: 5vw;
  }
  .calendar {
    gap: 0;
    min-height: 30vw;
    height: 30vh;


  }
  .grid-dates {
    border-bottom:1px solid rgb(223, 223, 223);
    border-radius: 0;
    min-height: 1em;
    font-size: 14px;
  }
  .grid-days {
    border-bottom:1px solid rgb(223, 223, 223);
    border-radius: 0;
    min-height: 1em;
    font-size: 14px;
    display:flex;
    align-items: center;
    justify-content: center;
  }
  .calendarButton,
  .calendarDate {
    font-size: 14px;
  }

  .projectLink {
    display: none;
  }
  .smScreenItems {
    display: flex;
    height: 100%;
    justify-content: center;
    align-items: center;
  }
  .grid-dates{
    cursor: pointer;
  }

  .datesWithItems{
    border-radius: 10px;
    color: rgb(7, 117, 100);
  }
  .today{
    color: brown;
  }
}
@media screen and (max-width:800px){

.grid-dates,.grid-days {
  font-size: 12px;

}
.calendarButton,
.calendarDate {
  font-size: 13px;
}




}
</style>
