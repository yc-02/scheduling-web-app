import { eachHourOfInterval, format } from 'date-fns'
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
  
    return startMinutes1 <= endMinutes2 && startMinutes2 <= endMinutes1
  }

 



  const getTasksPosition = ({
    taskDate,
    startTime,
    endTime,tableDataWidth,dates
  }: {
    taskDate: string
    startTime: string
    endTime: string
    tableDataWidth:number
    dates:DatesType[]
  }) => {
    const endHourAndMinutes = getHourAndMinutes(endTime)
    const startHourAndMinutes = getHourAndMinutes(startTime)
    const getStartTime = startHourAndMinutes.hours>9?`${startHourAndMinutes.hours}:00`:`0${startHourAndMinutes.hours}:00`
    const startTimeIndex = formattedTimeline.indexOf(getStartTime)
    const formattedTaskDate = format(new Date(taskDate), 'EEE, dd')
    const dateIndex = dates.findIndex((date) => date.formatDate.includes(formattedTaskDate))


    //each cell height is 30px
    //each minute is 30px/60min
   let height
    const pixelByMin = 30/60
    const pxLeft = dateIndex * tableDataWidth
    const itemHeight = (endHourAndMinutes.hours-startHourAndMinutes.hours)*30 +(endHourAndMinutes.minutes-startHourAndMinutes.minutes)*pixelByMin
    const pxTop = (startTimeIndex+1) * 30+pixelByMin*startHourAndMinutes.minutes
    if(itemHeight<=30){
     height = 30
    }else{
      height=itemHeight
    }

    return {
      top: `${pxTop}px`,
      left: `${pxLeft}px`,
      height: `${height}px`,
    }
  }
  function generateColors(numItems: number) {
    const colors = ['#768bbd', '#76bda6','#afbd76','#bda876','#bd8576']
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

