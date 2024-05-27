import { eachDayOfInterval, format, isBefore } from "date-fns";
import type { Project, Task } from "env";
import type { DocumentData } from "firebase/firestore";

const getUTCDate = (date:string)=>{
    const utcDate = new Date(new Date(date).getUTCFullYear(), new Date(date).getUTCMonth(), new Date(date).getUTCDate());
    return utcDate

}
const inputDefaultDate = (date:string)=>{
    return format(new Date(date),'yyyy-MM-dd')
}

const formatSubmitDate = (date:string)=>{
    return format(getUTCDate(date),'MMM dd, yyyy')
    
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

 //sort by start time
 const formatTime = (time:string)=>{
  return new Date(`May 24, 2024 ${time}`)
}
const sortTasksByTime = ({tasks}:{tasks:Task[]|DocumentData[]})=>{
  tasks.sort((a,b)=>{
      const dateA = formatTime(a.startTime).getTime();
      const dateB = formatTime(b.startTime).getTime();
      return dateA - dateB
      }); 
}

const sortProjectByStart = ({projects}:{projects:Project[]})=>{
  projects.sort((a,b)=>{
      const dateA = new Date(a.startDate);
      const dateB = new Date(b.startDate);
      if(isBefore(dateA,dateB)){
          return -1
      }else if(isBefore(dateB,dateA)){
          return 1
      }else{
          return 0
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


export {
    getUTCDate,
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
    getFormattedDatesInterval
}