/// <reference types="vite/client" />
export type Project = {
    projectName:String;
    startDate:string;
    endDate:string;
    important:boolean;
    id:string;
    path:string;
}
export type Task = {
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