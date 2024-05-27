import { eachDayOfInterval, eachHourOfInterval, format } from 'date-fns'
import type { DatesType } from 'env'
import { getHourAndMinutes, timeToMinutes } from './dateUtils'
//generate a timeline from 12:00 AM to 12:00 AM
const timeline = eachHourOfInterval({
    start: new Date(2024, 10, 29, 0),
    end: new Date(2024, 10, 29, 24)
  })
  
  //formatted timeline
const formattedTimeline = timeline.map((item) => {
    return format(new Date(item), 'HH:mm')
  })





const  doTimesOverlap = ({
    start1,
    end1,
    start2,
    end2
  }: {
    start1: string
    end1: string
    start2: string
    end2: string
  })=>{
    const startMinutes1 = timeToMinutes(start1)
    const endMinutes1 = timeToMinutes(end1)
    const startMinutes2 = timeToMinutes(start2)
    const endMinutes2 = timeToMinutes(end2)
  
    return startMinutes1 < endMinutes2 && startMinutes2 < endMinutes1
  }

 



  const getTasksPosition = ({
    taskDate,
    startTime,
    endTime,tableDataWidth,tableDataIndexWidth,dates
  }: {
    taskDate: string
    startTime: string
    endTime: string
    tableDataWidth:number
    tableDataIndexWidth:number
    dates:DatesType[]
  }) => {
    const endHourAndMinutes = getHourAndMinutes(endTime)
    const startHourAndMinutes = getHourAndMinutes(startTime)


    const getStartTime = startHourAndMinutes.hours>9?`${startHourAndMinutes.hours}:00`:`0${startHourAndMinutes.hours}:00`
    const getEndTime = endHourAndMinutes.hours>9?`${endHourAndMinutes.hours}:00`:`0${endHourAndMinutes.hours}:00`
    const startTimeIndex = formattedTimeline.indexOf(getStartTime)
    const endTimeIndex = formattedTimeline.indexOf(getEndTime)
    const formattedTaskDate = format(new Date(taskDate), 'EEE, dd')
    const dateIndex = dates.findIndex((date) => date.formatDate.includes(formattedTaskDate))
    
    //each cell height is 30px
    //each minute is 30px/60min
    const pixelByMin = 30/60
    const pxLeft = dateIndex * tableDataWidth + tableDataIndexWidth
    const height = (endTimeIndex - startTimeIndex+1) * 30 +endHourAndMinutes.minutes*pixelByMin
    const pxTop = (startTimeIndex+1) * 30+pixelByMin*startHourAndMinutes.minutes
 

    return {
      top: `${pxTop}px`,
      left: `${pxLeft}px`,
      height: `${height}px`,
      width: `${tableDataWidth}px`
    }
  }
  function generateColors(numItems: number) {
    const colors = ['#F4B9B8', '#549BAD', '#96AD90'] // Predefined colors
    const numColors = colors.length
    const colorMap = []
  
    for (let i = 0; i < numItems; i++) {
      colorMap[i] = colors[i % numColors]
    }
  
    return colorMap
  }




  export{
    formattedTimeline,
    timeToMinutes,
    doTimesOverlap,
    getTasksPosition,
    generateColors,
  }

