import { eachDayOfInterval, format, isAfter, isBefore } from "date-fns";
import type { Project, Task } from "env";
import type { DocumentData } from "firebase/firestore";


const inputDefaultDate = (date:string)=>{
  return format(date,'yyyy-MM-dd')
}

const formatSubmitDate = (date:string)=>{
    return format(date,'MMM dd, yyyy')
    
}
const dateSlug = (date:Date)=>{
    return date.toJSON().split('T')[0]
  }

const getHourAndMinutes = (time:string)=>{
  const hours = time.split(':').map(Number)[0]
  const minutes =time.split(':').map(Number)[1]

  return {hours,minutes}
}  

const toTimeString = (time:string)=>{
  getHourAndMinutes(time).hours
  const timeString =  new Date(2024,5,27,getHourAndMinutes(time).hours,getHourAndMinutes(time).minutes)
  
  return format(timeString,'h:mm aaa')
}
//days in week
const daysInWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

//render month
function renderMonth(month: number) {
  switch (month) {
    case 0:
      return 'Jan';
    case 1:
      return 'Feb';
    case 2:
      return 'Mar';
    case 3:
      return 'Apr';
    case 4:
      return 'May';
    case 5:
      return 'Jun';
    case 6:
      return 'Jul';
    case 7:
      return 'Aug';
    case 8:
      return 'Sep';
    case 9:
      return 'Oct';
    case 10:
      return 'Nov';
    case 11:
      return 'Dec';
    default:
      return '';
  }
}





const sortProjectByStart = ({projects}:{projects:Project[]})=>{
  projects.sort((a,b)=>{
      const startA = new Date(a.startDate);
      const startB = new Date(b.startDate);
      const endA = new Date(a.endDate);
      const endB = new Date(b.endDate);

      if(isBefore(startA,startB)){
          return -1
      }else if(isAfter(startA,startB)){
          return 1
      }else{
          if(isBefore(endA,endB)){
            return -1
          }else if(isAfter(endA,endB)){
            return 1
          }else{
            return 0
          }
      }
      
      
  })
}

const timeToMinutes=(time: string)=>{
  const [hours, minutes] = time.split(':').map(Number)
  return hours * 60 + minutes
}

const getDatesInterval = ({startDate,endDate}:{startDate:string,endDate:string}) => {
  const dates = eachDayOfInterval({
    start: new Date(startDate),
    end: new Date(endDate)
  })
  const datesVaule = dates.map((item) => {
    return { formatDate: format(new Date(item), 'EEE, dd'), date: new Date(item) }
  })

  return datesVaule
}
const getFormattedDatesInterval = ({project}:{project:Project}) => {
  const dates = eachDayOfInterval({
    start: new Date(project.startDate),
    end: new Date(project.endDate)
  })
  const datesVaule = dates.map((item) => {
    return format(new Date(item), 'EEE, dd')
  })

  return datesVaule
}


//sort tasks by time

const sortTasksByTime = (tasks:Task[]|DocumentData[])=>{
  tasks.sort((a,b)=>{
    const startComparison = a.startTime.localeCompare(b.startTime)
    if(startComparison!==0){
      return startComparison
    }
    return a.endTime.localeCompare(b.endTime)
  })

}

const compareTime = (startTime:string,endTime:string)=>{
  return startTime.localeCompare(endTime)
}
export {
    inputDefaultDate,
    dateSlug,
    formatSubmitDate,
    daysInWeek,
    renderMonth,
    sortProjectByStart,
    sortTasksByTime,
    getHourAndMinutes,
    timeToMinutes,
    toTimeString,
    getDatesInterval,
    getFormattedDatesInterval,
    compareTime
}