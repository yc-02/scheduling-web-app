<script setup lang="ts">
import { eachDayOfInterval, eachHourOfInterval, format} from 'date-fns';
import { nextTick, onMounted, ref, watch, type Ref } from 'vue';
import { onClickOutside } from '@vueuse/core'
import { deleteDoc, doc, type CollectionReference, type DocumentData } from 'firebase/firestore';
import type { DatesType, Lists } from 'env';
import { sortTasksByTime } from '@/stores/projects';
import { db } from '@/firebase';
import { useRouter } from 'vue-router';

const props = defineProps<{
  listFromParent: DocumentData|undefined|Lists
  tasksFromParent:DocumentData[]|undefined
  tasksRef?: CollectionReference<DocumentData, DocumentData>
}>()


const list = ref(props.listFromParent)
const tasks= ref(props.tasksFromParent)


//total days in project
const dates:Ref<DatesType[]|undefined>= ref([])


//create dates
const totalDates=()=>{
    let dates
    if(list.value?.startDate && list.value?.endDate){
        dates = eachDayOfInterval({
        start: new Date(list.value.startDate),
        end: new Date(list.value.endDate)
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
            row.style.backgroundColor='rgb(237,237,237)'
        }else{
            row.style.backgroundColor='white'
        }
    }
}


//loading before render
const isLoading=ref(true)

//table style
const myTable:Ref<HTMLElement|null>=ref(null)
const projectRef:Ref<HTMLElement[]|null> = ref([])
const tableDataWidth = ref(0)
const tableDataIndexWidth = ref(50)
const tableWidth = ref(1000)


//table style
const tableStyle=()=>{
    const table: HTMLElement|null = myTable.value
        const dates = totalDates()
    nextTick(()=>{
    const tableData = document.getElementsByTagName('td')
        if(table!==null && dates!==undefined){
        tableDataIndexWidth.value=60
        tableData[0].style.width=`60px`
        table.style.width=`${tableWidth.value}px`
        for(let i=1;i<=dates.length;i++){
                tableData[i].style.width=`${tableWidth.value/dates.length}px`
            }
        tableDataWidth.value=(tableWidth.value-tableDataIndexWidth.value)/(dates.length)
   
    }

    })
}

//origin tasks style on table
const showTasks=(startTime:string,taskDate:string,endTime:string)=>{
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

function generateColors(numItems:number) {
  const colors = ['#ff8166', '#99ffab', '#ab99ff']; // Predefined colors
  const numColors = colors.length;
  const colorMap = [];

  for (let i = 0; i < numItems; i++) {
    colorMap[i] = colors[i % numColors];
  }

  return colorMap;
}
//when same time slots have many tasks
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
            const colorMap = generateColors(samedayDiv.length);
            for(let i=0; i<samedayDiv.length; i++){
                const newWidth=tableDataWidth.value/samedayDiv.length
                samedayDiv[i].style.width=`${newWidth}px`
                samedayDiv[i].style.left=`${parseInt(samedayDiv[i].style.left)+i*newWidth}px`
                const child:HTMLElement|null= samedayDiv[i].querySelector('.tasksItems')
                if(child){
                    child.style.backgroundColor=colorMap[i]
                }
                
            }
            for(let i=0; i<notSameDay.length; i++){
                const width = tableDataWidth.value
                notSameDay[i].style.width=`${width}px`
            }
        }
    })

}


const showModal = ref()

const handleClick = (index:number)=>{
    console.log('clicked',index)
    showModal.value[index]=true
    for (const key in showModal.value){
        if(parseInt(key)!==index){
            showModal.value[key]=false
        }
    }
     
}
const target = ref(null)
const closeModal=()=>{
    for (const key in showModal.value){
        showModal.value[parseInt(key)]=false
    }
}
onClickOutside(target,closeModal)



//onmounted change table style
onMounted(()=>{
    tableRowStyle()
})

//watch data change
watch(() => props.listFromParent, (newValue) => {
    list.value=newValue
    dates.value = getProjectDates()
    tableStyle()

});

watch(()=>props.tasksFromParent,(newValue)=>{
    tasks.value=newValue
    showModal.value=tasks.value?.map(()=>false)
    tasksStyle()
    sortTasksByTime(tasks)
    isLoading.value=false
})

const router = useRouter()

const handleDelete=async(path:string)=>{
    await deleteDoc(doc(db,path)).then(()=>{
        console.log('deleted')
    }).then(()=>{
        router.push('/')
    }).catch(err=>console.log(err))
}
const currentRouterPath = router.currentRoute.value.fullPath
const showDeleteProject = currentRouterPath.includes('/projects')
</script>


<template>
    <div v-if="isLoading">
        Loading...
    </div>
    <!-- <div style="display: inline-flex; justify-content: center;">
        <AddTasksForm :tasksRef="tasksRef"/>
    </div> -->
    <div v-if="showDeleteProject">
        <button class="btn-secondary" @click="handleDelete(list?.path)">Delete Project</button>
    </div>
    <div v-show="!isLoading" class="tableContainer">
        <div class="headerContainer">
            <p class="title">{{ list?.listName }}</p>
            <div v-if="dates && dates.length>1">
            {{ list?.startDate }} to {{ list?.endDate }}
            </div>
            <div v-else>
            {{ list?.startDate }}
            </div>
        </div>
        <table style="position: relative;" ref="myTable">
            <div v-for="task,i in tasks" :key="i" class="projectTask" :style="showTasks(task.startTime,task.taskDate,task.endTime)" ref="projectRef"  @click="handleClick(i)">
                <div class="tasksItems" :class="{completed:task.checked}">
                    <div class="tasks">
                    <p>{{ task.taskName }}</p>
                    <p>{{ task.startTime }}-{{ task.endTime }}</p>
                    </div>
                </div>
                <div class="tasksModal" ref="target" v-if="showModal && showModal[i]">
                        <p>{{ task.taskName }}</p>
                        <p>{{ task.startTime }}-{{ task.endTime }}</p>
                        <p>{{ task.details }}</p>
                        <p>{{ task.checked }}</p>
                </div>
            </div>
        <tr>
            <th></th>
            <th  v-for="date in dates" :key="date.formatDate" class="tableHeader">
                {{ date.formatDate }}
            </th>
        </tr>
        <tr v-for="time,timeIndex in formattedTimeline" :key="timeIndex" class="tableRows">
            <td>
               <p style="text-align: center;">{{ time }}</p>
            </td>
            <td v-for="date in dates" :key="date.formatDate">
            </td>
        </tr>
    </table>
    </div>

</template>



<style scoped>
table{
    border-collapse: collapse;
    border:1px solid var(--border-color-light);
}

td,th{
  border-right: 1px solid var(--border-color-light);
  height: 30px;
}
.headerContainer{
    display: flex;
    align-items: center;
    gap: 9px;
}
.projectTask{
    position: absolute;
    display: flex;
    justify-content: center;
    cursor: pointer;
}
.tasksItems{
    display: flex;
    flex-direction: column;
    border-radius: 10px;
    height: 100%;
    width: 90%;
    box-sizing: content-box;
    background-color: rgb(213, 213, 234);
    overflow: hidden;
}
.tasks{
    padding: 6px;
}
.tableContainer{
    display: flex;
    min-height: 80vh;
    flex-direction: column;
    justify-content: center;
}
.tasksModal{
    position: absolute;
    background-color: white;
    height: 200px;
    width: 200px;
    padding: 20px;
    border-radius: 20px;
    box-shadow: 1px 1px rgb(9, 9, 9,0.1);
    z-index: 3;
}
.completed{
background-color: rgb(187, 187, 187) !important;
}
.completed::before{
    content: 'completed';
}
</style>