import { format } from "date-fns";

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

export {
    getUTCDate,
    inputDefaultDate,
    dateSlug,
    formatSubmitDate,
    daysInWeek,
    renderMonth
}