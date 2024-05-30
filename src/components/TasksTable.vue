<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, watch, type Ref } from 'vue'
import { onClickOutside, useNow } from '@vueuse/core'
import { type CollectionReference, type DocumentData } from 'firebase/firestore'
import type { DatesType, Project } from 'env'
import { formattedTimeline, doTimesOverlap, getTasksPosition, generateColors } from '@/utils/taskTable'
import { formatDate, getDateWithoutTime, getDatesInterval, inputDefaultDate, sortTasksByTime } from '@/utils/dateUtils'
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
  const tableRows = document.querySelectorAll('.tableRows')
  for (let i = 0; i < tableRows.length; i++) {
    const row = tableRows[i] as HTMLElement
    if (i % 2 === 0) {
      row.style.backgroundColor = 'rgb(237,237,237)'
    } else {
      row.style.backgroundColor = 'white'
    }
  }
}




//table style
const myTable: Ref<HTMLElement | null> = ref(null)
const projectRef: Ref<HTMLElement[] | null> = ref([])
const tableDataWidth = ref(0)
const tableDataIndexWidth = ref(60)
const tableWidth = ref(1400)






//table style
const tableStyle = () => {
  const table: HTMLElement | null = myTable.value
  nextTick(() => {
    const tableData = document.getElementsByTagName('td')
    if (table !== null) {
      tableDataIndexWidth.value = 60
      tableData[0].style.width = `60px`
      table.style.width = `${tableWidth.value}px`
      for (let i = 1; i <= dates.value.length; i++) {
        tableData[i].style.width = `${tableWidth.value / dates.value.length}px`
      }
      tableDataWidth.value = (tableWidth.value - tableDataIndexWidth.value) / dates.value.length
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
          tableDataIndexWidth: tableDataIndexWidth.value,
          dates: dates.value
        })
        projectRef.value[i].style.top = position.top
        projectRef.value[i].style.left = position.left
        projectRef.value[i].style.height = position.height
        projectRef.value[i].style.width = position.width
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
  console.log('clicked', index)
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
timelineStyle()
//change timeline indicator
watch(nowMinutes,()=>{
  timelineStyle()

})
//watch data change
watch(props, () => {
  if(props.screenWidth && props.screenWidth<1000){
    tableWidth.value = props.parentWidth*dates.value.length
  }else {
    tableWidth.value = props.parentWidth
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









type DateAndTime = {
  date: string
  time: string
}
const showForm = ref(false)
const clicked: Ref<DateAndTime> = ref({ date: '', time: '' })
const handleDateTime = (date: string, time: string) => {
  showForm.value = true
  clicked.value = { date: inputDefaultDate(date), time: time }
}

const addForm = ref(null)
const handleClickOutside = () => {
  showForm.value = false
}

onClickOutside(addForm, handleClickOutside)



</script>

<template>
  <div class="container">
    <div class="headerContainer">
      <p class="title">{{ project?.projectName }}</p>
      <div v-if="dates && dates.length > 1">{{ project?.startDate }} - {{ project?.endDate }}</div>
      <div v-else>
        {{ project?.startDate }}
      </div>
    </div>
    <div class="tableContainer">
      <div class="tableIndex" style="margin-top: 30px;">
        <div v-for="(time, timeIndex) in formattedTimeline" :key="timeIndex" class="tableRows" style="display: flex; justify-content: center;" >
            <p class="indexItem" style="height: 30px; align-items: center; display: flex;">{{ time }}</p>
        </div>
        <div class="tableRows"></div>
      </div>
      <table style="position: relative" ref="myTable">
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
              <p>{{ task.path.split('/')[1] }}</p>
              <p>{{ task.taskName }}</p>
            </div>
          </div>
          <!-- tasks modal -->
          <div
            class="tasksModal"
            ref="modalTarget"
            v-if="showModal && showModal[i] && task.id !== 'newItem'"
          >
          {{ task.taskDate }}
            <p>{{ task.taskName }}</p>
            <p>{{ task.startTime }}-{{ task.endTime }}</p>
            <p>{{ task.details }}</p>
            <p>{{ task.checked }}</p>
            <button @click="handleDeleteDoc({ path: task.path })">Delete</button>
          </div>
        </div>
        <tr>
          <th></th>
          <th v-for="date in dates" :key="date.formatDate" class="tableHeader">
            {{ date.formatDate }}
          </th>
        </tr>
        <tr v-for="(time, timeIndex) in formattedTimeline" :key="timeIndex" class="tableRows">
          <td>
            <p style="text-align: center">{{ time }}</p>
          </td>
          <td
            v-for="date in dates"
            :key="date.formatDate"
            @dblclick="handleDateTime(date.date.toString(), time)"
          >
          <div style="height: 100%;">
          <div v-if="nowTime === parseInt(time.split(':')[0]) && date.date.toString()===getDateWithoutTime(new Date()).toString()" class="timeline"></div>
          </div>
        </td>
        </tr>
      </table>
      <!-- <div v-if="showForm" ref="addForm" class="addForm">
        <AddTasksForm
          :tasksRef="tasksRef"
          :minDate="inputDefaultDate(project?.startDate)"
          :maxDate="inputDefaultDate(project?.endDate)"
          :clicked="clicked"
        />
      </div> -->
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
  align-items: center;
  gap: 9px;
  position: relative;
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
  border-radius: 10px;
  height: 100%;
  width: 90%;
  box-sizing: content-box;
  background-color: #88b2cc;
}
.tasks {
  padding: 6px;
  overflow: hidden;
}

.tableIndex {
  display: flex;
  flex-direction: column;
}

.tableContainer {
  display: flex;
  justify-content: center;
  overflow-x: auto;
  overflow-y: hidden;
}

.tasksModal {
  position: absolute;
  background-color: white;
  width: 200px;
  padding: 20px;
  border-radius: 20px;
  box-shadow: 1px 1px rgb(9, 9, 9, 0.1);
  z-index: 2;
  top: 0;
  cursor: auto;
}
.completed {
  background-color: rgb(187, 187, 187) !important;
}
.completed::before {
  content: 'completed';
}
.addForm {
  position: absolute;
  left: 45%;
}
.timeline{
  background-color: rgb(170, 57, 76); 
  width: 100%; 
  height: 2px;

}
</style>
