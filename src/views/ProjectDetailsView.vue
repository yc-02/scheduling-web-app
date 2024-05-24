<script setup lang="ts">
import { db, listsRef } from '@/firebase';
import { eachDayOfInterval, eachHourOfInterval, format} from 'date-fns';
import { collection, doc } from 'firebase/firestore';
import { nextTick, onMounted, ref, watch, type Ref } from 'vue';
import { useRoute } from 'vue-router';
import { useCollection, useDocument } from 'vuefire';
import { onClickOutside } from '@vueuse/core'
import AddTasksForm from '@/components/AddTasksForm.vue';

const route = useRoute()
const listId = route.params.id.toString()
//get data from firebase
const listDoc = doc(listsRef,listId)
const list = useDocument(listDoc)

// sub collection tasks
const tasksRef = collection(db,'lists',listId,'tasks')
const tasks = useCollection(tasksRef)

//total days in project
type DatesType = {
    formatDate:string;
    date:Date
}
const dates:Ref<DatesType[]|undefined>= ref([])


//create dates
const totalDates=()=>{
    let dates
    if(list.value?.startDate && list.value?.endDate){
        dates = eachDayOfInterval({
        start: new Date(list.value?.startDate),
        end: new Date(list.value?.endDate)
        })
    }
    return dates
}
const getProjectDates = () =>{
    const dates = totalDates()
    let datesVaule
    if(dates!==undefined){
        datesVaule=dates.map(item=>{
            return {formatDate:format(new Date(item),'EEE, dd'),date:new Date(item)}
        })
    
    }

    return datesVaule
}


//generate a timeline from 12:00 AM to 12:00 AM
const timeline = eachHourOfInterval({
  start: new Date(2024, 10, 29, 0),
  end: new Date(2024, 10, 29, 24)
})

//formatted timeline
const formattedTimeline = timeline.map(item=>{
    return format(new Date(item),'HH:mm')
})


    
//change table rows color
const tableRowStyle = ()=>{
    const tableRows = document.querySelectorAll('.tableRows')
    for(let i=0; i<tableRows.length; i++){
        const row = tableRows[i] as HTMLElement;
        if(i%2 ===0){
            row.style.backgroundColor='rgb(217, 217, 217)'
        }else{
            row.style.backgroundColor='white'
        }
    }
}


//table style
const myTable:Ref<HTMLElement|null>=ref(null)
const projectRef:Ref<HTMLElement[]|null> = ref([])
const tableDataWidth = ref(0)
const tableDataIndexWidth = ref(50)
const tableWidth = ref(1000)

//tasks style on table
const tasksStyles=(startTime:string,taskDate:string,endTime:string)=>{
    let getEndTime
    if(parseInt(endTime.split(':')[1])>=30){
        getEndTime= `${parseInt(endTime.split(':')[0])+1}:00`
    }else{
        getEndTime = `${endTime.split(':')[0]}:00`
    }
    const getStartTime =  `${startTime.split(':')[0]}:00`

    const startTimeIndex = formattedTimeline.indexOf(getStartTime)
    const endTimeIndex = formattedTimeline.indexOf(getEndTime)
    const formattedTaskDate = format(new Date(taskDate),'EEE, dd')

    const dateIndex = dates.value?.findIndex(date=>date.formatDate.includes(formattedTaskDate)) 

    const pxLeft= dateIndex!==undefined?(dateIndex)*tableDataWidth.value+tableDataIndexWidth.value:0
    const pxTop= (startTimeIndex+1)*30
    const height=(endTimeIndex-startTimeIndex+1)*30
 
    const style = `top: ${pxTop}px; left: ${pxLeft}px; height:${height}px`

    return style

}

//table style
const tableStyle=()=>{
    const table: HTMLElement|null = myTable.value
        const dates = totalDates()
    nextTick(()=>{
    const tableData = document.getElementsByTagName('td')
        if(table!==null && dates!==undefined){
        tableDataIndexWidth.value=50
        tableData[0].style.width=`50px`
        table.style.width=`${tableWidth.value}px`
        for(let i=1;i<=dates.length;i++){
                tableData[i].style.width=`${tableWidth.value/dates.length}px`
            }
        tableDataWidth.value=(tableWidth.value-tableDataIndexWidth.value)/(dates.length)
   
    }

    })
}

const tasksStyle=()=>{
    const count:any ={}
    const samedayDiv:HTMLElement[]=[]
    const notSameDay:HTMLElement[]=[]
    nextTick(()=>{
        if(projectRef.value){
            for(let i=0; i<projectRef.value.length; i++){
            const task = projectRef.value[i]
                if(count[task.style.left]){
                    count[task.style.left]++
                }else{
                    count[task.style.left]=1
                }
            }
            for(let i=0; i<projectRef.value.length; i++){
                const task = projectRef.value[i]
                if(count[task.style.left]>1){
                    samedayDiv.push(task)
                }else{
                    notSameDay.push(task)
                }
            }
            console.log(notSameDay)
            for(let i=0; i<samedayDiv.length; i++){
                const newWidth=tableDataWidth.value/samedayDiv.length
                samedayDiv[i].style.width=`${newWidth}px`
                samedayDiv[i].style.left=`${parseInt(samedayDiv[i].style.left)+i*newWidth}px`
                if(i%2 ===0){
                    samedayDiv[i].style.backgroundColor='pink'
                }else{
                    samedayDiv[i].style.backgroundColor='blue'
                }
            }
            for(let i=0; i<notSameDay.length; i++){
                const width = tableDataWidth.value
                notSameDay[i].style.width=`${width}px`
            }
        }
    })

}



const isLoading=ref(true)

//onmounted watch list data invoke functions

onMounted(()=>{
    tableRowStyle()
    watch(list.data,()=>{
    dates.value = getProjectDates()
    tableStyle()
    })

    watch(tasks.data,()=>{
        tasksStyle()
        isLoading.value=false
        modal.value = tasks.value.map(()=>false)

    })



})


const modal = ref(tasks.value.map(()=>false))

// const handleClick = (index:number)=>{
//     modal.value[index]=true
//     for (let key in modal.value){
//         if(parseInt(key)!==index){
//             modal.value[key]=false
//         }
//     }
    
// }
// const target = ref()
// console.log(target.value)
// const closeModal=()=>{
//     for (let key in modal.value){
//         modal.value[key]=false
//     }
// }
// onClickOutside(target,closeModal)

</script>

<template>
    <main>
    <div v-if="isLoading">loading...</div>
    <div v-show="!isLoading">
    <div>
        {{ list?.listName }}
        {{ (list?.startDate) }} to {{ list?.endDate }}
    </div>
    <div style="display: flex; justify-content: center;" v-if="false">
        <AddTasksForm :tasksRef="tasksRef"/>
    </div>
    <table style="position: relative;" ref="myTable">
            <div v-for="task,i in tasks" :key="i" class="projectTask" :style="tasksStyles(task.startTime,task.taskDate,task.endTime)" ref="projectRef">
                {{ task.taskDate }}-{{ task.endTime }}
            </div>
        <tr>
            <th></th>
            <th  v-for="date in dates" :key="date.formatDate" class="tableHeader">
                {{ date.formatDate }}
            </th>
        </tr>
        <tr v-for="time,timeIndex in formattedTimeline" :key="timeIndex" class="tableRows">
            <td>{{ time }}</td>
            <td v-for="date in dates" :key="date.formatDate">
            </td>
        </tr>
    </table>
    </div>
    </main>
</template>



<style scoped>
table{
    border-collapse: collapse;
    border:1px solid rgb(166, 166, 166);
}

td,th{
  border-right: 1px solid rgb(166, 166, 166);
  height: 30px;
}

.projectTask{
    position: absolute;
    display: flex;
    flex-wrap: wrap;
    background-color: pink;
}

.modal{
    position: absolute;
    background-color: white;
    top: 0;
    height: 200px;
    width: 200px;
    border-radius: 10px;
    box-shadow: 2px 2px rgb(27, 27, 27,0.1);
}


</style>