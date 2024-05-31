<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, watch, type Ref } from 'vue'
import { onClickOutside, useNow } from '@vueuse/core'
import { type CollectionReference, type DocumentData } from 'firebase/firestore'
import type { DatesType, Project } from 'env'
import { formattedTimeline, doTimesOverlap, getTasksPosition, generateColors } from '@/utils/taskTable'
import { formatDate, getDateWithoutTime, getDatesInterval, inputDefaultDate, sortTasksByTime, toTimeString } from '@/utils/dateUtils'
import AddTasksForm from '@/components/AddTasksForm.vue'
import { handleDeleteDoc } from '@/services/deleteData'
import { doc } from 'firebase/firestore/lite'
const props = defineProps<{
  projectFromParent: DocumentData | undefined | Project
  tasksFromParent: DocumentData[] | undefined 
  tasksRef?: CollectionReference<DocumentData, DocumentData>
  parentWidth:number
  screenWidth?:number
}>()

const project = ref(props.projectFromParent)
const tasks = ref(props.tasksFromParent)

//total days in project
const dates: Ref<DatesType[]> = ref([])
//loading before render



//change table rows color
const tableRowStyle = () => {
  nextTick(()=>{
    const tableRows = document.querySelectorAll('.tableRows')
  for (let i = 0; i < tableRows.length; i++) {
    const row = tableRows[i] as HTMLElement
    if (i % 2 === 0) {
      row.style.backgroundColor = 'rgb(237,237,237)'
    } else {
      row.style.backgroundColor = 'white'
    }
  }

  })
}




//table style
const myTable: Ref<HTMLElement | null> = ref(null)
const projectRef: Ref<HTMLElement[] | null> = ref([])
const tableDataWidth = ref(0)
const tableWidth = ref(1000)







//table style
const tableStyle = () => {
  nextTick(() => {
    const table: HTMLElement | null = myTable.value
    const tableData: HTMLCollectionOf<HTMLTableCellElement> = document.getElementsByTagName('td')
    if (table !== null) {
      table.style.width = `${tableWidth.value}px`
      for (let i = 0; i <= dates.value.length; i++) {
      if(tableData[i]!==undefined){
        tableData[i].style.width = `${tableWidth.value / dates.value.length}px`
      };
    };
      tableDataWidth.value = tableWidth.value / dates.value.length
    }
  })
}

//when same time slots have many tasks

const tasksStyle = () => {
  const count: any = {}
  const samedayDiv: { [key: string]: HTMLElement[] } = {}
  nextTick(() => {
    if (projectRef.value) {
      //count sameday 
      for (let i = 0; i < projectRef.value.length; i++) {
        const task: HTMLElement = projectRef.value[i]
        const taskDate = task.dataset.date ?? ''
        const startTime = task.dataset.start ?? ''
        const endTime = task.dataset.end ?? ''
        const position = getTasksPosition({
          taskDate,
          startTime,
          endTime,
          tableDataWidth: tableDataWidth.value,
          dates: dates.value
        })
        projectRef.value[i].style.top = position.top
        projectRef.value[i].style.left = position.left
        projectRef.value[i].style.height = position.height
        projectRef.value[i].style.width = `${tableDataWidth.value}px`
        if (taskDate && count[taskDate]) {
          count[taskDate]++
        } else if (taskDate) {
          count[taskDate] = 1
        }
      }
      //get sameday div
      for (let i = 0; i < projectRef.value.length; i++) {
        const task:HTMLElement = projectRef.value[i]
        const taskDate:string|undefined = task.dataset.date
        if (taskDate && count[taskDate] > 1) {
          samedayDiv[taskDate] = samedayDiv[taskDate] || []
          samedayDiv[taskDate].push(task)
      }
        }
      }

      //sameday overlaps
      const samedayArray = Object.values(samedayDiv);
      const overlaps:{[key:string]:HTMLElement[]} = {}
      for(let i=0;i<samedayArray.length;i++){
        const samedaySubArray:HTMLElement[] = samedayArray[i]
        for(let a=0;a<samedaySubArray.length;a++){
          const taskDate:string|undefined = samedaySubArray[a].dataset.date
          for(let b=a+1; b<samedaySubArray.length;b++){
            const start1: string = samedaySubArray[a].dataset.start ?? ''
            const end1: string = samedaySubArray[a].dataset.end ?? ''
            const start2: string = samedaySubArray[b].dataset.start ?? ''
            const end2: string =samedaySubArray[b].dataset.end ?? ''
            if (doTimesOverlap({ start1, end1, start2, end2 })) {
              if(taskDate){
                overlaps[taskDate]=overlaps[taskDate]||[]
                overlaps[taskDate].push(samedaySubArray[a],samedaySubArray[b])
              }
            }
          }
        }

      //overlap time get unique div  
      const overlapsArray = Object.values(overlaps);
      const colorMap = generateColors(overlapsArray.length)
      for(let i=0;i<overlapsArray.length;i++){
        const divArray:HTMLElement[]= overlapsArray[i]
        const uniqueDiv = [...new Set(divArray)]
        const newWidth = tableDataWidth.value / uniqueDiv.length
          for(let i=0;i<uniqueDiv.length;i++){
          uniqueDiv[i].style.width=`${newWidth}px`
          uniqueDiv[i].style.left=`${parseInt(uniqueDiv[0].style.left)+i*newWidth}px`
          const child: HTMLElement | null = uniqueDiv[i].querySelector('.tasksItems')
          if (child) {
            child.style.backgroundColor = colorMap[i]
          }
        }
      }

    }
  })
}

const showModal = ref()

const toggleModal = (index: number) => {
  showModal.value[index] = true
  for (const key in showModal.value) {
    if (parseInt(key) !== index) {
      showModal.value[key] = false
    }
  }
}

const modalTarget = ref(null)
const closeModal = () => {
  for (const key in showModal.value) {
    showModal.value[parseInt(key)] = false
  }
}
onClickOutside(modalTarget, closeModal)

//get timeline indicator
const now = useNow()
const nowTime = now.value.getHours()
const nowMinutes=computed(() => now.value.getMinutes());
const marginTop = computed(()=>{
  return 0.5*nowMinutes.value
})



const timelineStyle = ()=>{
  nextTick(()=>{
    const myDiv:HTMLDivElement|null = document.querySelector('.timeline')
    if (myDiv) {
    myDiv.style.marginTop = `${marginTop.value}px`;
  }
})
}

onMounted(()=>{
  tableRowStyle()
  watch(nowMinutes,()=>{
    timelineStyle()

  })
  //watch data change
watch(props, () => {
  if(props.screenWidth && props.screenWidth<1000){
    tableWidth.value = (props.parentWidth-50)*dates.value.length
  }else {
    tableWidth.value = props.parentWidth-50
  }
  tasks.value = props.tasksFromParent
  project.value = props.projectFromParent
  dates.value=getDatesInterval({startDate:project.value?.startDate,endDate:project.value?.endDate})
  tableStyle()
  tasksStyle()
  sortTasksByTime(tasks.value??[])
  showModal.value = tasks.value?.map(() => false)
})

})





//emit date and time to parents
const emit=defineEmits(['clickedDateTime','showForm'])

// const showForm = ref(false)
const handleClickDateTime = (date: string, time: string) => {
  const dateAndTime = {date:inputDefaultDate(date),time:time}
  emit('clickedDateTime',dateAndTime)
  emit('showForm',true)
  console.log(date,time)
}






</script>

<template>
    <div class="headerContainer">
      <div class="titleContainer">
        <p class="title">{{ project?.projectName }}</p>
        <button class="addButton" @click="emit('showForm',true)">
          <font-awesome-icon icon="fa-solid fa-plus" size="lg" /> 
          <p>Add</p>
        </button>
      </div>
      <em v-if="dates && dates.length > 1" class="subTitle">{{ project?.startDate }} - {{ project?.endDate }}</em>
      <em v-else class="subTitle">
        {{ project?.startDate }}   {{ props.parentWidth }}
      </em>
    </div>
    <div style="display: flex;">
      <div class="tableIndex" style="margin-top: 30px;">
          <div v-for="(time, timeIndex) in formattedTimeline" :key="timeIndex"
          class="tableRows" 
          style="display: flex; justify-content: center;" >
              <p class="indexItem">{{ time }}</p>
          </div>
          <div class="tableRows indexItem"></div>
      </div>
      <div class="tableContainer">
      <div>
        <table style="position: relative;" ref="myTable">
        <!-- abosolute position tasks -->
        <div
          v-for="(task, i) in tasks"
          :key="task.id"
          class="projectTask"
          :data-date="task.taskDate"
          :data-start="task.startTime"
          :data-end="task.endTime"
          ref="projectRef"
          @click="toggleModal(i)"
        >
          <div class="tasksItems" :class="{ completed: task.checked }">
            <div class="tasks">
              <div v-if="task.checked"><font-awesome-icon icon="fa-solid fa-check" /></div>
              <p>{{ task.taskName }}</p>
              <em>{{ toTimeString(task.startTime) }}-{{ toTimeString(task.endTime) }}</em>
            </div>
          </div>
          <!-- tasks modal -->
          <div
            class="tasksModal"
            ref="modalTarget"
            v-if="showModal && showModal[i] && task.id !== 'newItem'"
          >
            <div class="buttonContainer">
              <button class="editButton"><font-awesome-icon icon="fa-solid fa-pen-to-square" /></button>
              <button @click="handleDeleteDoc({ path: task.path })" class="deleteButton"><font-awesome-icon icon="fa-solid fa-trash"/></button>
            </div>
            <p>{{ task.taskDate }}</p>
            <p>{{ task.taskName }}</p>
            <em>{{ task.startTime }}-{{ task.endTime }}</em>
            <p>{{ task.details }}</p>
          </div>
        </div>
        <tr>
          <th v-for="date in dates" :key="date.formatDate" class="tableHeader">
            {{ date.formatDate }}
          </th>
        </tr>
        <tr v-for="(time, timeIndex) in formattedTimeline" :key="timeIndex" class="tableRows">
          <td
            v-for="date in dates"
            :key="date.formatDate"
            @dblclick="handleClickDateTime(date.date.toString(), time)"
          >
          <div style="height: 100%;">
          <div v-if="nowTime === parseInt(time.split(':')[0]) && date.date.toString()===getDateWithoutTime(new Date()).toString()" class="timeline"></div>
          </div>
        </td>
        </tr>
      </table>
      </div>
    </div>

    </div>
</template>

<style scoped>

table {
  border-collapse: collapse;
}

td,
th {
  height: 30px;
}
.headerContainer {
  display: flex;
  flex-direction: column;
  margin-bottom: 9px;
}
.titleContainer{
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.addButton{
  display: flex;
  gap: 3px;
  align-items: center;
  color: var(--text-color-soft);
}
.projectTask {
  position: absolute;
  display: flex;
  justify-content: center;
  cursor: pointer;
}
.tasksItems {
  display: flex;
  flex-direction: column;
  border-radius: 5px;
  width: 95%;
  box-sizing: content-box;
  background-color: #88b2cc;
}
.tasks {
  padding: 3px;
  overflow: hidden;
}



.tableIndex {
  display: flex;
  flex-direction: column;
}

.tableContainer {
  display: flex;
  width: 100%;
  overflow-x: auto;
}

.tasksModal {
  position: absolute;
  background-color: rgb(245, 245, 245);
  padding: 20px;
  width: 100%;
  border-radius: 20px;
  box-shadow: 1px 1px rgb(9, 9, 9, 0.1);
  z-index: 2;
  top: 0;
  cursor: auto;
}
.deleteButton,.editButton{
  color: rgb(187, 39, 94);
  font-size: inherit;
}
.editButton{
  color: rgb(20, 157, 102);
}
.buttonContainer{
  display: flex;
  justify-content: flex-end;
  gap: 9px;
}
@media screen and (max-width:800px) {
.tasks{
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.tasks p{
  font-size: 13px;

}
.tasks em{
  font-size: 10px;
}
.tasksModal{
  font-size: 14px;
}
button{
  padding: 0;
  margin: 0;
}

}

.completed {
  background-color: rgb(187, 187, 187) !important;
}

.addForm {
  position: absolute;
  left: 45%;
}
.timeline{
  background-color: rgb(170, 57, 76); 
  height: 2px;
}
.indexItem{
  height: 30px; 
  width: 50px;
  display: flex;
  justify-content: center;
  align-items: center;
  color: rgb(93, 93, 93);
}
.title{
  text-transform: capitalize;
}

.tableHeader{
  font-weight: 600;
}
</style>
