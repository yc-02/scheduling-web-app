/// <reference types="vite/client" />
export type Lists = {
    listName:String;
    startDate:string;
    endDate:string;
    important:boolean;
    id:string;
    path:string;
}
export type Tasks = {
    id:string;
    path:string;
    taskName:string;
    taskDate:string;
    startTime:string;
    endTime:string;
    details:String;
    checked:boolean;
}
export type DatesType = {
    formatDate:string;
    date:Date
}