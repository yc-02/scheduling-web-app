/// <reference types="vite/client" />
export type Lists = {
    listName:String;
    startDate:string;
    endDate:string;
    important:boolean;
    id:string;
}
export type Tasks = {
    taskName:string;
    taskDate:string;
    startTime:string;
    endTime:string;
    details:String;
}