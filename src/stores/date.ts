import { format } from "date-fns";

const getUTCDate = (date:string)=>{
    const utcDate = new Date(new Date(date).getUTCFullYear(), new Date(date).getUTCMonth(), new Date(date).getUTCDate());
    return utcDate

}
const inputDefaultToday = format(new Date(),'yyyy-MM-dd')
const formatSubmitDate = (date:string)=>{
    return format(getUTCDate(date),'MMM dd, yyyy')
    
}

export {
    getUTCDate,
    inputDefaultToday,
    formatSubmitDate}