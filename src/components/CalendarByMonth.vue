<script setup lang="ts">
import { ref,computed } from 'vue'

const today = new Date()
const todayDate = today.getDate()
const thisYear = today.getFullYear()
const thisMonth = today.getMonth()
const year = ref(thisYear)
const month = ref(thisMonth)

//get next month calendar
const nextMonth = () => {
  month.value++
  if(month.value> 11){
    month.value = 0
    year.value++
  }
}
// get last month
const prevMonth = () =>{
  month.value--
  if(month.value< 0){
    month.value=11
    year.value--
  }
}

//get today calendar
const getToday = () =>{
  year.value = thisYear
  month.value = thisMonth
}


//get first Day of the month
const getFirstDay = computed(()=>{
  return new Date(year.value,month.value,1).getDay()
})

// get last date of the month
const getLastDate = computed(() =>{
  return new Date(year.value,month.value+1,0).getDate()
})

//calendar dates by month, each month render total 42 days(include last month some days and next month some days)
const calendarDates = computed(()=>{
  const lastDate = getLastDate.value
  const firstDay = getFirstDay.value
  const dates:{datesNumber:number,dates:Date,special:string|null|number}[] = []
  for (let date = 1-firstDay; date<= 42-firstDay; date++){
    dates.push({
      datesNumber: new Date(year.value, month.value, date).getDate(), dates: new Date(year.value, month.value, date),
      special: new Date(year.value, month.value, date).getDate()
    })
  }
  dates[firstDay].special = `${renderMonth(month.value)} 1`
  dates[lastDate+firstDay].special=`${renderMonth(month.value+1)} 1`
  if(month.value===thisMonth && year.value === thisYear){
    dates[firstDay+todayDate-1].special=`${todayDate} Today`
  }
  

  return dates
})

//days in week
const daysInWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

//render month
function renderMonth(month:number){
  switch (month) {
    case 0:
      return 'January'
    case 1:
      return 'February'
    case 2:
      return 'March'
    case 3:
      return 'April'
    case 4:
      return 'May'
    case 5:
      return 'June'
    case 6:
      return'July'
    case 7:
      return 'August'
    case 8:
      return 'September'
    case 9:
      return 'October'
    case 10:
      return 'November'
    case 11:
      return 'December'
  }
}

//css style for today cell
function todayStyle(index:number){
  if(index===getFirstDay.value+todayDate-1 && month.value === thisMonth && year.value === thisYear){
    return true
  }else{
    return false
  }
}

//css style for next month dates in this month
function nextMonthDatesStype(index:number){
  if(index >=getFirstDay.value+getLastDate.value){
    return true
  }else{
    return false
  }
}


</script>

<template>
  <main>
    <div class="titleContainer">
        <p>{{ renderMonth(month) }} {{ year }}</p>
      <button @click="prevMonth">Last Month</button>
      <button @click="getToday">Today</button>
      <button @click="nextMonth">Next Month</button>
      <!-- <button @click="year--">Last Year</button>
      <button @click="year++">Next Year</button> -->
    </div>
    <div class="calendarContainer">
      <div class="calendarLeft">
        <p>Today</p>
        <slot name="todayTasks"></slot>
        <!-- <div v-for="task,index in tasks" :key="index">
          <ul v-if="new Date(task.taskDate).toDateString() === today.toDateString()">
            <li>{{ task.taskName }} {{ task.startTime }} -  {{ task.endTime }}</li>
          </ul>
        </div> -->
      </div>
      <div class="calendar">
        <p v-for="day in daysInWeek" :key="day" class="days">
          {{ day }}
        </p>
        <div v-for="({dates,special},index) in calendarDates" class="dates" 
        :key="index" 
        :class="{pastDates:index< getFirstDay,nextMonthDates:nextMonthDatesStype(index),today:todayStyle(index)}"
        >
         <p class="dateItems">{{special}}</p>
          <slot name="list" :dates=dates></slot>
        </div>
      </div>
    </div>
  </main>
</template>
<style scoped>
main{
  width: 100%;
}
.titleContainer{
  display: flex;
  justify-content:flex-end;
  align-items: center;
  padding: 10px;
  gap: 10px;
}

.calendar{
  display: grid;
  grid-template-columns: repeat(7,1fr);
  border-left: solid 1px dimgray;
  border-top: solid 1px dimgray;
}
.pastDates, .nextMonthDates{
  color: rgb(174, 174, 174);

}
.dates{
  border-right: solid 1px dimgray;
  border-bottom: solid 1px dimgray;
  height: 130px;
  width: 160px;
  cursor: pointer;
}
.dateItems{
  padding-left: 10px;
  padding-top: 6px;
}

.days{
  border-bottom: solid 1px dimgray;
  border-right: solid 1px dimgray;
  padding: 10px;
}
.today{
  background-color: rgb(218, 218, 246);
}
.calendarContainer{
  display: flex;
}
.calendarLeft{
  background-color: rgb(198, 198, 216);
  display: flex;
  flex-direction: column;
  width: 200px;
}
.calendarLeft p{
  text-align: center;
  margin: 6px;
}
</style>