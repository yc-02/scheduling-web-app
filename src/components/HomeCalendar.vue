<script setup lang="ts">
import { isAfter, isBefore, isEqual } from 'date-fns';
import CalendarByMonth from './CalendarByMonth.vue';
import { computed, nextTick, ref, watch, type Ref } from 'vue';
import { type DocumentData } from 'firebase/firestore';
import { fetchTasks } from '@/services/fetchData';
import type { Project, Task } from 'env';
import {
  formatDate,
  getDateWithoutTime,
  getDatesInterval,
  getNonFormatDateInterval,
} from '@/utils/dateUtils';
import { onClickOutside } from '@vueuse/core';

//get all projects and screenwidth from parents
const props = defineProps<{
  projects: Project[]
  screenWidth:number
}>()


//show projects on calendar
const showProjects = (
  slotProps: {
    datesAndIndex: {
      dates: Date
      index: number
    }
  },
  project: DocumentData
) => {
  return (
    (isBefore(slotProps.datesAndIndex.dates, new Date(project.endDate)) &&
      isAfter(slotProps.datesAndIndex.dates, new Date(project.startDate))) ||
    isEqual(slotProps.datesAndIndex.dates, new Date(project.endDate)) ||
    isEqual(slotProps.datesAndIndex.dates, new Date(project.startDate))
  )
}

// project div ref
const projectRef: Ref<HTMLElement[]> = ref([])

//when more than 3 projects in one day
const showMoreProjects = () => {
  const count: any = {}
  const countPosition: any[] = []
  nextTick(() => {
    for (let i = 0; i < projectRef.value?.length; i++) {
      const project = projectRef.value[i]
      const positionIndex = project.dataset.dateindex
      if (positionIndex && count[positionIndex]) {
        count[positionIndex]++
      } else if (positionIndex) {
        count[positionIndex] = 1
      }
    }
    for (let i = 0; i < projectRef.value.length; i++) {
      const project = projectRef.value[i]
      const positionIndex = project.dataset.dateindex
      if (positionIndex && count[positionIndex] > 3) {
        const index = parseInt(positionIndex)
        countPosition[index] = countPosition[index] || []
        countPosition[index].push(project)
      }
    }

    for (let i = 0; i < countPosition.length; i++) {
      const divArray = countPosition[i] as HTMLElement[]
      if (Array.isArray(divArray)) {
        const newNode = document.createElement('button')
        newNode.innerText = `+${divArray.length - 3} More`
        newNode.className = 'showMore'
        newNode.onclick = () => {
          clickedIndex.value = divArray[2].dataset.dateindex
        }
        divArray[2].insertAdjacentElement('beforeend', newNode)
        const divLength = divArray.length
        for (let i = 3; i < divLength; i++) {
          divArray[i].style.display = 'none'
        }
      }
    }
  })
}

//watch month or projects change 
const monthIndex = ref(new Date().getMonth())
watch(
  () => monthIndex.value,
  () => {
    showMoreProjects()
  }
)


watch(
  () => props.projects,
  () => {
    showMoreProjects()
  }
)

//click to show modal
const clickedIndex = ref()
const showAllProjects = ref(null)
const closeModal = () => {
  clickedIndex.value = ''
}
//click outside to close
onClickOutside(showAllProjects, closeModal)



// toggle details modal
const detailsModal = ref(null)
const detailsModalInAll = ref(null)


const showDetails = ref(false)
const showDetailsInAll = ref(false)


const showDetailsIndex = ref(0)
const showDetailsId = ref('')

onClickOutside(detailsModal, () => {
  showDetails.value = false
})

onClickOutside(detailsModalInAll, () => {
  showDetailsInAll.value = false
})



const handleShowDetails = (index: number, id: string) => {
  showDetails.value = true
  showDetailsIndex.value = index
  showDetailsId.value = id
}

const handleShowDetailsInAll = (index: number, id: string) => {
  showDetailsInAll.value = true
  showDetailsIndex.value = index
  showDetailsId.value = id
}



const tasks: Ref<Task[]> = ref([])
fetchTasks({ tasks })

//dates have projects
const pDates: Ref<string[]> = ref([])
watch(
  props,
  () => {
    const  result=[]
    for (let i = 0; i < props.projects.length; i++) {
      result.push(getNonFormatDateInterval({
        startDate: props.projects[i].startDate,
        endDate: props.projects[i].endDate
      }))
    }
    pDates.value=result.flat()
  }
)



//click date to show projects on sm screen
const clickedDate: Ref<Date> = ref(getDateWithoutTime(new Date()))
const showSmScreenProjects = (project: Project, clicked: Date) => {
  return getDatesInterval({ startDate: project.startDate, endDate: project.endDate }).map(
    (a) => a.date.toString() == clicked.toString()
  )
}


//open modal directions based on index
const modalOpenleftIndex = [6, 13, 20, 27, 34, 5, 12, 19, 26, 33]
const modalOpenUpIndex = [35, 36, 37, 38, 39]

const modalOpenLeft = (index: number) => {
  if (modalOpenleftIndex.includes(index)) {
    return true
  } else {
    return false
  }
}
const modalOpenUp = (index: number) => {
  if (modalOpenUpIndex.includes(index)) {
    return true
  } else {
    return false
  }
}
const modalCorner = (index: number) => {
  if (index === 41 || index === 40) {
    return true
  } else {
    return false
  }
}



</script>

<template>
  <div style="width: 100%;">
    <CalendarByMonth :dates-with-projects="pDates"
      @change-month="(month) => (monthIndex = month)"
      @clicked-date="(date) => (clickedDate = date)"
    >
    <template #addProject>
      <slot name="addProject"></slot>
    </template>
      <template #project="slotProps">
        <div class="container">
          <!-- show project total under 3 -->
          <div v-for="project in projects" :key="project.id" class="projectsContainer">
            <div
              ref="projectRef"
              :data-dateindex="slotProps.datesAndIndex.index"
              :data-monthindex="slotProps.datesAndIndex.month"
              v-if="showProjects(slotProps, project)"
            >
              <!-- tasks on calendar click to show modal -->
              <div
                @click="handleShowDetails(slotProps.datesAndIndex.index, project.id)"
                :class="{ important: project.important}"
                class="clickDiv"
              >
                <p class="projectTitle">
                  {{ project.projectName }}
                </p>
              </div>
              <!-- modal for details -->
              <div
                class="detailsModal"
                ref="detailsModal"
                :class="{
                  modalOpenLeft: modalOpenLeft(slotProps.datesAndIndex.index),
                  modalOpenUp: modalOpenUp(slotProps.datesAndIndex.index),
                  modalCorner: modalCorner(slotProps.datesAndIndex.index)
                }"
                v-if="
                  showDetails &&
                  slotProps.datesAndIndex.index === showDetailsIndex &&
                  project.id === showDetailsId
                "
              >
                <div>
                  <RouterLink :to="{ name: 'project', params: { id: project.id } }">
                    <p class="pLinkTitle">
                      <span v-if="project.important">
                        <font-awesome-icon icon="fa-solid fa-star" style="color: rgb(186,115,121)" />
                      </span>
                      {{ project.projectName }}
                    </p>
                  </RouterLink>
                  <p class="startEndDate">{{ project.startDate }} - {{ project.endDate }}</p>
                </div>
              </div>
            </div>
          </div>
          <!-- show all projects -->
          <div
            ref="showAllProjects"
            class="moreProjectsModal"
            :class="{
              modalOpenLeft: modalOpenLeft(slotProps.datesAndIndex.index),
              modalOpenUp: modalOpenUp(slotProps.datesAndIndex.index),
              modalCorner: modalCorner(slotProps.datesAndIndex.index)
            }"
            v-if="parseInt(clickedIndex) === slotProps.datesAndIndex.index"
          >
            <div v-for="project in projects" :key="project.id">
              <div
                v-if="showProjects(slotProps, project)"
                class="clickDiv"
                :class="{ important: project.important}"
                @click="handleShowDetailsInAll(slotProps.datesAndIndex.index, project.id)"
              >
                <p class="projectTitle">P: {{ project.projectName }}</p>
                <!-- modal for details -->
                <div
                  ref="detailsModalInAll"
                  class="detailsModalInAll"
                  :class="{
                    modalOpenLeft: modalOpenLeft(slotProps.datesAndIndex.index),
                    modalOpenUp: modalOpenUp(slotProps.datesAndIndex.index),
                    modalCorner: modalCorner(slotProps.datesAndIndex.index)
                  }"
                  v-if="
                    showDetailsInAll &&
                    slotProps.datesAndIndex.index === showDetailsIndex &&
                    project.id === showDetailsId
                  "
                >
                  <div>
                    <RouterLink :to="{ name: 'project', params: { id: project.id } }">
                      <p class="pLinkTitle">
                        <span v-if="project.important">
                          <font-awesome-icon icon="fa-solid fa-star" style="color: rgb(186,115,121)" />
                        </span>
                        {{ project.projectName }}
                      </p>
                    </RouterLink>
                    <p class="startEndDate">{{ project.startDate }} - {{ project.endDate }}</p>
                  </div>
                </div>
              </div>
          </div>
        </div>
        </div>
      </template>
    </CalendarByMonth>
    <!-- projects and tasks on small screen -->
    <div class="smItems">
      <p class="dateTitle" style="display: inline-flex;">{{ formatDate(clickedDate) }}</p>
      <div v-for="project in projects" :key="project.id">
      <div
        v-if="showSmScreenProjects(project, clickedDate).includes(true)"
        style="border-bottom: 2px solid;"
      >
      <!-- projects -->
       <div class="sProjectsContainer">
        <RouterLink :to="{name:'project',params:{id:project.id}}">
          <p class="projectTitle">P: {{ project.projectName }}</p>
        </RouterLink>
        <div>
          <p class="sDate">{{ project.startDate }}</p>
          <p class="sDate">{{ project.endDate }}</p>
        </div>
      </div>
        <!-- tasks by date -->
      <div v-for="task in tasks" :key="task.id">
        <div v-if="task.taskDate === formatDate(clickedDate) && task.path.includes(project.path)" class="sTasksContainer">
          <p>{{ task.taskName }}</p>
          <div>
            <P>{{ task.startTime }}</P>
            <p>{{ task.endTime }}</p>
          </div>
        </div>
      </div>
      </div>
    </div>
    </div>
  </div>
</template>
<style scoped>
.container {
  position: relative;
  font-size: 14px;
}
.projects:hover,.pLinkTitle:hover {
  background-color: var(--primary-color);
}

.clickDiv{
  cursor: pointer;
  background-color: var(--primary-color-extra-light);
  padding-left: 3px;
  margin-bottom: 3px;
}
.startEndDate{
  font-size: 13px;
}
.projectTitle, .pLinkTitle{
  text-transform: capitalize;
}
.projectTitle{
  text-wrap: nowrap;
}
.important {
  background-color: var(--important-color);
  color: white;
}
.important:hover{
  background-color: var(--important-color-light);
}



.moreProjectsModal,
.detailsModal,
.modalOpenLeft,
.modalOpenUp,
.detailsModalInAll,
.modalCorner {
  position: absolute;
  background-color: whitesmoke;
  padding: 10px;
  top: 0;
  left: 100px;
  min-width: 200px;
  min-height: 100px;
  z-index: 3;
  border-radius: 5px;
  box-shadow: 3px 3px 10px 1px rgb(0, 0, 0, 0.1);
  color: black;
}
.moreProjectsModal {
  top: 0;
  right: 0;
  left: 0;
  min-width: 230px;
  height: auto;
  z-index: 1;
  display: flex;
  flex-direction: column;
  border-radius: 3px;
}
.modalOpenLeft {
  left: -200px;
}
.modalOpenUp {
  top: -100px;
  left: 100px;
}

.detailsModalInAll {
  left: 230px;
}
.modalCorner {
  top: -100px;
  left: -100px;
}
.smItems {
  display: none;
}

@media screen and (max-width: 1000px) {
  .smItems {
    display: block;
  }
  .projectsContainer,.moreProjectsModal{
    display: none;
  }

  .sProjectsContainer,
  .sTasksContainer {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .sTasksContainer{
    border-top: 1px solid lightgray;
  }
 
  em {
    font-size: 14px;
    color: var(--text-color-soft);
  }
  .sDate {
    text-align: end;
    color: var(--text-color-soft);
  }
  .smItems {
    padding: 10px;
    font-size: 14px;
  }
  .projectTitle:hover{
    background-color: var(--primary-color-extra-light);
  }
}
</style>
