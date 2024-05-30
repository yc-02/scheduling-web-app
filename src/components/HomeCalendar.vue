<script setup lang="ts">
import { isAfter, isBefore, isEqual } from 'date-fns'
import CalendarByMonth from './CalendarByMonth.vue'
import { computed, nextTick, ref, watch, type ComputedRef, type Ref } from 'vue'
import { type DocumentData } from 'firebase/firestore'
import { fetchAllTasksByDate, fetchTasks } from '@/services/fetchData'
import type { Project, Task } from 'env'
import {
  formatDate,
  getDateWithoutTime,
  getDatesInterval,
  sortTasksByTime,
  toTimeString
} from '@/utils/dateUtils'
import { onClickOutside } from '@vueuse/core'
import MyCheckbox from './MyCheckbox.vue'
import AddTasksForm from './AddTasksForm.vue'
import CalendarLeft from './CalendarLeft.vue'

const props = defineProps<{
  projects: Project[]
  screenWidth:number
}>()

const todayTasks: Ref<Task[]> = ref([])
//get data from firebase
const today = formatDate(new Date())
fetchAllTasksByDate({ tasks: todayTasks, date: today })

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

const monthIndex = ref(new Date().getMonth())
watch(
  () => monthIndex.value,
  () => {
    showMoreProjects()
  }
)

// today's tasks checked
const checked: Ref<boolean[]> = ref(todayTasks.value.map((task) => task.checked))

watch(todayTasks, () => {
  sortTasksByTime(todayTasks.value)
  checked.value = todayTasks.value.map((task) => task.checked)
})

watch(
  () => props.projects,
  () => {
    showMoreProjects()
  }
)
const clickedIndex = ref()
const showAllProjects = ref(null)
const closeModal = () => {
  clickedIndex.value = ''
}
onClickOutside(showAllProjects, closeModal)

const todayEventsProject = (taskPath: string | undefined) => {
  const getProject = props.projects.filter((p) => taskPath?.includes(p.path))
  return getProject[0].projectName
}
const eventExist = ref()
const clicked: Ref<{ date: string; id: string; time: string; isEvent: boolean }> = ref({
  date: '',
  id: '',
  time: '',
  isEvent: false
})
const showAddForm = ref(false)
const addForm = ref(null)
onClickOutside(addForm, () => {
  showAddForm.value = false
  clicked.value = { date: '', id: '', time: '', isEvent: false }
})

watch(clicked, () => {
  const exist = props.projects.filter((a) => a.id === clicked.value.id)
  exist.length > 0 ? (eventExist.value = true) : (eventExist.value = false)
})

// toggle details modal
const detailsModal = ref(null)
const detailsModalInAll = ref(null)

const eventsModal = ref(null)
const eventsModalInAll = ref(null)

const showDetails = ref(false)
const showDetailsInAll = ref(false)

const showEvents = ref(false)
const showEventsInAll = ref(false)

const showDetailsIndex = ref(0)
const showDetailsId = ref('')
const eventIndex = ref(0)

onClickOutside(detailsModal, () => {
  showDetails.value = false
})
onClickOutside(eventsModal, () => {
  showEvents.value = false
})
onClickOutside(detailsModalInAll, () => {
  showDetailsInAll.value = false
})

onClickOutside(eventsModalInAll, () => {
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

const handleShowEvents = (index: number, id: string, eIndex: number) => {
  showEvents.value = true
  showDetailsIndex.value = index
  showDetailsId.value = id
  eventIndex.value = eIndex
}

const handleShowEventsInAll = (index: number, id: string, eIndex: number) => {
  showEventsInAll.value = true
  showDetailsIndex.value = index
  showDetailsId.value = id
  eventIndex.value = eIndex
}

const tasks: Ref<Task[]> = ref([])
fetchTasks({ tasks })

const pDates: Ref<{ formatDate: string; date: Date }[]> = ref([])
const eDates: Ref<{ formatDate: string; date: Date }[]> = ref([])

watch(
  props,
  () => {
    const  result=[]
    for (let i = 0; i < props.projects.length; i++) {
      result.push(getDatesInterval({
        startDate: props.projects[i].startDate,
        endDate: props.projects[i].endDate
      }))
    }
    pDates.value=result.flat()
  }
)
watch(tasks, () => {
  const result=[]
  for (let i = 0; i < tasks.value.length; i++) {
    result.push(getDatesInterval({
      startDate: tasks.value[i].taskDate,
      endDate: tasks.value[i].taskDate
    }))
  }
  eDates.value=result.flat()
})
const combinedDates: ComputedRef<string[]> = computed(() => {
  const newArray = pDates.value.concat(eDates.value)
  const uniqueArray: Set<string> = new Set()
  newArray.forEach((a) => {
    uniqueArray.add(a.date.toString())
  })
  return Array.from(uniqueArray)
})

const clickedDate: Ref<Date> = ref(getDateWithoutTime(new Date()))
const showSmScreenProjects = (project: Project, clicked: Date) => {
  return getDatesInterval({ startDate: project.startDate, endDate: project.endDate }).map(
    (a) => a.date.toString() == clicked.toString()
  )
}
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

const slice=computed(()=>{
  if(props.screenWidth<1200){
    return 10
  }else if(props.screenWidth<1300){
    return 13
  }else if(props.screenWidth>1500){
    return 18
  }else{
    return 15
  }
  
})

</script>

<template>
  <div>
    <!-- <CalendarLeft>
      <template #todayTasks>
        <div v-for="(task, index) in todayTasks" :key="index" class="tasksContainer">
            <RouterLink :to="{name:'project',params:{id:task.path?.split('/')[1]}}">
              <p class="subTitle">{{ todayEventsProject(task.path) }}</p>
            </RouterLink>
            <MyCheckbox :path="task.path" :index="index" :checked="checked" :title="task.taskName" @is-checked="(isChecked)=>checked[index]=isChecked"/>
        </div>
      </template>
    </CalendarLeft> -->
    <CalendarByMonth
      @change-month="(month) => (monthIndex = month)"
      @clicked-date="(date) => (clickedDate = date)"
    >
      <template #project="slotProps">
        <div class="container">
          <!-- show on small screen -->
          <div v-for="date in combinedDates" :key="date" class="smContainer">
            <div v-if="slotProps.datesAndIndex.dates.toString() === date" class="dotContainer">
              <font-awesome-icon icon="fa-solid fa-circle" size="xs" style="color: lightgray" />
            </div>
          </div>
          <!-- show project and events total under 3 -->
          <div v-for="project in projects" :key="project.id" class="projectsContainer">
            <div
              ref="projectRef"
              :data-dateindex="slotProps.datesAndIndex.index"
              :data-monthindex="slotProps.datesAndIndex.month"
              v-if="showProjects(slotProps, project) && !project.events"
            >
              <!-- tasks on calendar click to show modal -->
              <div
                @click="handleShowDetails(slotProps.datesAndIndex.index, project.id)"
                :class="{ important: project.important, projects: !project.events }"
                class="clickDiv"
              >
                <p class="projectTitle">
                  P: {{ project.projectName.slice(0, slice)
                  }}{{ project.projectName.length > slice ? '..' : '' }}
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
            <!-- show events on calendar -->
            <div v-for="(event, index) in project.events" :key="index">
              <div
                ref="projectRef"
                :data-dateindex="slotProps.datesAndIndex.index"
                :data-monthindex="slotProps.datesAndIndex.month"
                v-if="showProjects(slotProps, project)"
              >
                <div
                  class="events"
                  @click="handleShowEvents(slotProps.datesAndIndex.index, project.id, index)"
                >
                  <p>E: {{ event.slice(0, slice) }}{{ event.length > slice ? '..' : '' }}</p>
                </div>
                <!-- modal for events -->
                <div
                  ref="eventsModal"
                  class="eventsModal"
                  v-if="
                    showEvents &&
                    slotProps.datesAndIndex.index === showDetailsIndex &&
                    project.id === showDetailsId &&
                    eventIndex === index
                  "
                  :class="{
                    modalOpenLeft: modalOpenLeft(slotProps.datesAndIndex.index),
                    modalOpenUp: modalOpenUp(slotProps.datesAndIndex.index),
                    modalCorner: modalCorner(slotProps.datesAndIndex.index)
                  }"
                >
                  <div>
                    <RouterLink :to="{ name: 'project', params: { id: project.id } }">
                      <p class="eLinkTitle">{{ event }}</p>
                    </RouterLink>
                    <div
                      v-for="task in tasks.filter(
                        (t) => t.path?.includes(project.id) && event === t.taskName
                      )"
                      :key="task.id"
                    >
                      <p>{{ toTimeString(task.startTime) }} - {{ toTimeString(task.endTime) }}</p>
                      <p>{{ task.details }}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <!-- show all projects and events -->
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
                v-if="showProjects(slotProps, project) && !project.events"
                class="clickDiv"
                :class="{ important: project.important, projects: !project.events }"
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
              <!-- all events  -->
              <div v-for="(event, index) in project.events" :key="index">
                <div
                  @click="handleShowEventsInAll(slotProps.datesAndIndex.index, project.id, index)"
                  v-if="showProjects(slotProps, project)"
                  class="events"
                >
                  E: {{ event }}
                </div>
                <!-- modal for events -->
                <div
                  ref="eventsModalInAll"
                  class="eventsModalInAll"
                  :class="{
                    modalOpenLeft: modalOpenLeft(slotProps.datesAndIndex.index),
                    modalOpenUp: modalOpenUp(slotProps.datesAndIndex.index),
                    modalCorner: modalCorner(slotProps.datesAndIndex.index)
                  }"
                  v-if="
                    showEventsInAll &&
                    slotProps.datesAndIndex.index === showDetailsIndex &&
                    project.id === showDetailsId &&
                    eventIndex === index
                  "
                >
                  <RouterLink :to="{ name: 'project', params: { id: project.id } }">
                    <p class="eLinkTitle">{{ event }}</p>
                  </RouterLink>
                  <div
                    v-for="task in tasks.filter(
                      (t) => t.path?.includes(project.id) && event === t.taskName
                    )"
                    :key="task.id"
                  >
                    <p>{{ toTimeString(task.startTime) }} - {{ toTimeString(task.endTime) }}</p>
                    <p>{{ task.details }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>
    </CalendarByMonth>
    <!-- projects and tasks view on small screen -->
    <div v-for="project in projects" :key="project.id" class="smItems">
      <div
        v-if="!project.events && showSmScreenProjects(project, clickedDate).includes(true)"
        class="sProjectsContainer"
      >
        <p class="projectTitle">{{ project.projectName }}</p>
        <div>
          <p class="sDate">{{ project.startDate }}</p>
          <p class="sDate">{{ project.endDate }}</p>
        </div>
      </div>
      <div v-for="(event, index) in project.events" :key="index">
        <div
          v-for="task in tasks.filter((t) => t.path?.includes(project.id) && event === t.taskName)"
          :key="task.id"
        >
          <div
            v-if="new Date(task.taskDate).toString() === clickedDate.toString()"
            class="sEventsContainer"
          >
            <div class="sEvents">
              <p class="eventTitle">{{ event }}</p>
              <em>{{ task.details }}</em>
            </div>
            <div class="sEvents">
              <p class="sTime">{{ toTimeString(task.startTime) }}</p>
              <p class="sTime">{{ toTimeString(task.endTime) }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- <div class="addForm" v-if="showAddForm" ref="addForm">
      <p>Add Event</p>
      <AddTasksForm :clicked="clicked" :projects="projects"/>
    </div> -->
  </div>
</template>
<style scoped>
.container {
  position: relative;
  font-size: 14px;
}
.projects {
  background-color: var(--primary-color-extra-light);
  padding-left: 3px;
  margin-bottom: 3px;
}
.projects:hover,.pLinkTitle:hover {
  background-color: var(--primary-color);
}
.events {
  background-color: var(--secondary-color);
  padding-left: 3px;
  margin-bottom: 3px;
  cursor: pointer;
}
.eLinkTitle:hover,.events:hover{
  background-color: var(--secondary-color-light);
}
.clickDiv{
  cursor: pointer;
}
.startEndDate{
  font-size: 13px;
}
.projectTitle,.eLinkTitle, .pLinkTitle .events, .eventTitle{
  text-transform: capitalize;
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
.eventsModal,
.modalOpenLeft,
.modalOpenUp,
.detailsModalInAll,
.eventsModalInAll,
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

.detailsModalInAll,
.eventsModalInAll {
  left: 230px;
}
.modalCorner {
  top: -100px;
  left: -100px;
}

/* .tasksContainer {
  display: flex;
  flex-direction: column;
  margin-left: 19px;
}


.checkedItem {
  text-decoration: line-through;
} */

/* .subTitle{
  font-size: 16px;
  font-weight: 500;
  text-transform: capitalize;
}
.subTitle:hover{
  color: var(--primary-color);
} */
.smContainer,
.smItems {
  display: none;
}

@media screen and (max-width: 1000px) {
  .smContainer,
  .smItems {
    display: block;
  }
  .projectsContainer,
  .moreProjectsContainer {
    display: none;
  }
  .dotContainer {
    display: flex;
    justify-content: center;
  }
  .sProjectsContainer,
  .sEventsContainer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid lightgray;
  }
  em {
    font-size: 14px;
    color: var(--text-color-soft);
  }
  .sDate,
  .sTime {
    text-align: end;
    color: var(--text-color-soft);
  }
  .smItems {
    margin-top: 10px;
    font-size: 14px;
  }
}
</style>
