<script setup lang="ts">
import { nextTick, onMounted, ref, watch, type Ref } from 'vue'
import { onClickOutside } from '@vueuse/core'
import { type CollectionReference, type DocumentData } from 'firebase/firestore'
import type { DatesType, Project } from 'env'
import { sortTasksByTime } from '@/services/fetchData'
import { formattedTimeline, doTimesOverlap, getTasksPosition, generateColors, getDatesInterval } from '@/utils/taskTable'
import { inputDefaultDate } from '@/utils/dateUtils'
import AddTasksForm from '@/components/AddTasksForm.vue'
import { handleDeleteDoc } from '@/services/deleteData'
const props = defineProps<{
  projectFromParent: DocumentData | undefined | Project
  tasksFromParent: DocumentData[] | undefined
  tasksRef: CollectionReference<DocumentData, DocumentData>
}>()

const project = ref(props.projectFromParent)
const tasks = ref(props.tasksFromParent)

//total days in project
const dates: Ref<DatesType[]> = ref([])
//loading before render
const isLoading = ref(true)


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
const tableWidth = ref(1000)

//table style
const tableStyle = () => {
  const table: HTMLElement | null = myTable.value
  if (dates.value.length > 3) {
    tableWidth.value = 2000
  } else {
    tableWidth.value = 1000
  }
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
  const samedayDiv: HTMLElement[] = []
  nextTick(() => {
    if (projectRef.value) {
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

      for (let i = 0; i < projectRef.value.length; i++) {
        const task = projectRef.value[i]
        const taskDate = task.dataset.date
        if (taskDate && count[taskDate] > 1) {
          samedayDiv.push(task)
        }
      }

      const overlaps = []
      for (let i = 0; i < samedayDiv.length; i++) {
        for (let j = i + 1; j < samedayDiv.length; j++) {
          const start1: string = samedayDiv[i].dataset.start ?? ''
          const end1: string = samedayDiv[i].dataset.end ?? ''
          const start2: string = samedayDiv[j].dataset.start ?? ''
          const end2: string = samedayDiv[j].dataset.end ?? ''
          if (doTimesOverlap({ start1, end1, start2, end2 })) {
            overlaps.push({ div: samedayDiv[i] }, { div: samedayDiv[j] })
          }
        }
      }
      const colorMap = generateColors(overlaps.length)
      for (let i = 0; i < overlaps.length; i++) {
        const newWidth = tableDataWidth.value / overlaps.length
        overlaps[i].div.style.width = `${newWidth}px`
        overlaps[i].div.style.left = `${parseInt(samedayDiv[0].style.left) + i * newWidth}px`
        const child: HTMLElement | null = samedayDiv[i].querySelector('.tasksItems')
        if (child) {
          child.style.backgroundColor = colorMap[i]
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

//onmounted change table style
onMounted(() => {
  tableRowStyle()
})

//watch data change
watch(props, (newValue) => {
  tasks.value = newValue.tasksFromParent
  project.value = newValue.projectFromParent
  tasksStyle()
  dates.value=getDatesInterval({startDate:project.value?.startDate,endDate:project.value?.endDate})
  tableStyle()
  sortTasksByTime({ tasks })
  showModal.value = tasks.value?.map(() => false)
  isLoading.value = false
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
  <div v-if="isLoading">Loading...</div>
  <div class="headerContainer">
    <p class="title">{{ project?.projectName }}</p>
    <div v-if="dates && dates.length > 1">{{ project?.startDate }} - {{ project?.endDate }}</div>
    <div v-else>
      {{ project?.startDate }}
    </div>
  </div>
  <div class="container">
    <div v-show="!isLoading" class="tableContainer">
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
              <p>{{ task.taskName }}</p>
            </div>
          </div>
          <!-- tasks modal -->
          <div
            class="tasksModal"
            ref="modalTarget"
            v-if="showModal && showModal[i] && task.id !== 'newItem'"
          >
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
          ></td>
        </tr>
      </table>
      <div v-if="showForm" ref="addForm" class="addForm">
        <AddTasksForm
          :tasksRef="tasksRef"
          :minDate="inputDefaultDate(project?.startDate)"
          :maxDate="inputDefaultDate(project?.endDate)"
          :clicked="clicked"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
table {
  border-collapse: collapse;
  border: 1px solid var(--border-color-light);
}

td,
th {
  border-right: 1px solid var(--border-color-light);
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

.tableContainer {
  display: flex;
  flex-direction: column;
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
  z-index: 3;
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
</style>
