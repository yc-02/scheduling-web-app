<script setup lang="ts">
import { dateSlug,daysInWeek,renderMonth } from '@/utils/dateUtils';
import { ref,computed} from 'vue'
import { RouterLink } from 'vue-router';

const today = new Date()
const todayDate = today.getDate()
const thisYear = today.getFullYear()
const thisMonth = today.getMonth()
const year = ref(thisYear)
const month = ref(thisMonth)
//send month to parents
const emit = defineEmits(['changeMonth'])
//get next month calendar
const nextMonth = () => {
  month.value++
  if(month.value> 11){
    month.value = 0
    year.value++
  }
  emit('changeMonth',month.value)
}
// get last month
const prevMonth = () =>{
  month.value--
  if(month.value< 0){
    month.value=11
    year.value--
  }
  emit('changeMonth',month.value)
}

//get today calendar
const getToday = () =>{
  year.value = thisYear
  month.value = thisMonth
  emit('changeMonth',month.value)
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
    <div>
      <div class="titleContainer">
      <p class="calendarDate">{{ renderMonth(month) }} {{ year }}</p>
      <button @click="prevMonth" class="calendarButton"><font-awesome-icon icon="fa-solid fa-chevron-left" /></button>
      <button @click="getToday" class="calendarButton">Today</button>
      <button @click="nextMonth" class="calendarButton"><font-awesome-icon icon="fa-solid fa-chevron-right" /></button>
      <!-- <button @click="year--">Last Year</button>
      <button @click="year++">Next Year</button> -->
    </div>
    <div class="calendarContainer">
      <div class="calendarLeft">
        <RouterLink :to="{name:'activities',params:{slug:`${dateSlug(today)}`}}">
          <p class="title">Today</p>
        </RouterLink>
        <slot name="todayTasks"></slot>
      </div>
      <div class="calendar">
        <p v-for="day in daysInWeek" :key="day" class="grid-days">
          {{ day }}
        </p>
          <div v-for="({dates,special},index) in calendarDates" class="grid-dates"
          :key="index" 
          :class="{pastDates:index< getFirstDay,nextMonthDates:nextMonthDatesStype(index)}"
          >
          <div>
            <RouterLink :to="{name:'activities',params:{slug:`${dateSlug(dates)}`}}">
            <p class="dateItems" :class="{today:todayStyle(index)}">{{special}}</p>
            </RouterLink>
            <slot name="project" :datesAndIndex={dates,index,month}></slot>
          </div>
        </div>
      </div>
    </div>
    </div>
</template>
<style scoped>

.titleContainer{
  display: flex;
  justify-content:flex-end;
  align-items: center;
  padding: 10px;
  gap: 10px;
}
.dateItems:hover,.title:hover,.calendarButton:hover{
  color: var(--primary-color);
}
.calendarButton,.calendarDate{
  font-size: 16px;
  font-weight: 600;
}
.dateItems{
  display: inline-flex;
  padding-right: 6px;
}

.calendarContainer{
  display: grid;
  grid-template-columns: 20% 80%;
}

.calendarLeft{
  background-color: var(--primary-color-extra-light);
  border-radius: 5px;
}
.title{
  text-align: center;
  margin: 6px;
}
.calendar{
  display: grid;
  grid-template-columns: repeat(7,1fr);
  gap: 3px;

  
}
.grid-dates{
  min-height: 130px;
  background-color: whitesmoke;
  border-radius: 5px;
}


.grid-days{
  padding: 10px;
  min-height: 30px;
  background-color: whitesmoke;
  border-radius: 5px;
}

.pastDates, .nextMonthDates{
  color: var(--text-color-light);

}
.dateItems{
  padding-left: 10px;
  padding-top: 6px;
}
.today{
  color: var(--secondary-color-dark)
}


</style>