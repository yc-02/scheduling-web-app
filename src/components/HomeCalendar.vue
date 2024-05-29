<script setup lang="ts">
import { isAfter, isBefore, isEqual } from 'date-fns';
import CalendarByMonth from './CalendarByMonth.vue';
import { nextTick, ref, watch, type Ref } from 'vue';
import { type DocumentData } from 'firebase/firestore';
import { fetchAllTasksByDate } from '@/services/fetchData';
import type { Project, Task } from 'env';
import { formatSubmitDate, sortTasksByTime } from '@/utils/dateUtils';
import { onClickOutside } from '@vueuse/core';
import MyCheckbox from './MyCheckbox.vue';
import AddTasksForm from './AddTasksForm.vue';

const props = defineProps<{
  projects:Project[]
}>()



const todayTasks: Ref<Task[]> = ref([])
//get data from firebase
const today = formatSubmitDate(new Date().toDateString())
fetchAllTasksByDate({ tasks: todayTasks, date: today})

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
        const newNode = document.createElement('button');
          newNode.innerText=`+${divArray.length - 3} More`
          newNode.className='showMore'
          newNode.onclick = () => {
          clickedIndex.value=divArray[2].dataset.dateindex
        };
        divArray[2].insertAdjacentElement("beforeend", newNode)
        const divLength = divArray.length
        for (let i = 3; i < divLength; i++) {
          divArray[i].style.display = 'none'
        }
      }
    }
  })
}

const monthIndex = ref(new Date().getMonth())
watch(()=>monthIndex.value,()=>{
  showMoreProjects()
})

// today's tasks checked
const checked: Ref<boolean[]> = ref(todayTasks.value.map((task) => task.checked))


watch(todayTasks, () => {
  sortTasksByTime({ tasks: todayTasks.value })
  checked.value=todayTasks.value.map((task) => task.checked)
})

watch(()=>props.projects, () => {
  showMoreProjects()
})
const clickedIndex = ref()
const showAllProjects = ref(null)
const closeModal = ()=>{
  clickedIndex.value=''
}
onClickOutside(showAllProjects,closeModal)



const todayEventsProject = (taskPath:string|undefined)=>{
  const getProject = props.projects.filter(p=>
    taskPath?.includes(p.path)
  )
  return getProject[0].projectName
}
const existEvents=ref()
const clicked:Ref<{date:string,id:string,time:string}> = ref({date:'',id:'',time:''})
const showAddForm = ref(false)
const addForm =ref(null)
onClickOutside(addForm,()=>{
  showAddForm.value=false
  clicked.value={date:'',id:'',time:''}
})


watch(clicked,()=>{
  const exist = props.projects.filter(a=>a.id===clicked.value.id)
  exist.length>0? existEvents.value = true: existEvents.value = false
})




</script>

<template>
  <div>
    <CalendarByMonth @change-month="(month)=>monthIndex=month">
      <template #project="slotProps">
        <div style="position: relative;">
          <div v-for="project in projects" :key="project.id">
          <div
            ref="projectRef"
            :data-dateindex="slotProps.datesAndIndex.index"
            :data-monthindex="slotProps.datesAndIndex.month"
            v-if="showProjects(slotProps, project)&&!project.events"
          >
            <RouterLink :to="{ name: 'project', params: { id: project.id } }">
              <div 
              :class="{ important: project.important, projects:!project.events}">
                <p class="projectTitle">P:{{ project.projectName }}</p>
              </div>
            </RouterLink>
          </div>
          <div v-for="event,index in project.events" :key="index">
            <div 
            ref="projectRef" 
            :data-dateindex="slotProps.datesAndIndex.index"
            :data-monthindex="slotProps.datesAndIndex.month" 
            v-if="showProjects(slotProps, project)">
            <RouterLink :to="{name:'events',params:{id:project.id}}">
              <div class="events">
                <p ref="calendarItems"> {{ event }}</p>
              </div>
            </RouterLink>
            </div>
          </div>
        </div>
        <div class="moreProjectsContainer" ref="showAllProjects" v-if="parseInt(clickedIndex)===slotProps.datesAndIndex.index">
          <div v-for="project in projects" :key="project.id">
            <div  v-if="showProjects(slotProps, project)" :class="{ important: project.important, projects:!project.events}" style="width: 150px">
              <RouterLink :to="{ name: 'project', params: { id: project.id } }">
              <p class="projectTitle" v-if="!project.events">{{ project.projectName }}</p>
             </RouterLink>
              <div v-for="event,index in project.events" :key="index">
                  <div ref="projectRef">E:{{ event }}</div>
              </div>
            </div>
          </div>
        </div>
        </div>
      </template>
      <template #todayTasks>
        <div v-for="(task, index) in todayTasks" :key="index" class="tasksContainer">
            <RouterLink :to="{name:'project',params:{id:task.path?.split('/')[1]}}">
              <p class="subTitle">{{ todayEventsProject(task.path) }}</p>
            </RouterLink>
            <MyCheckbox :path="task.path" :index="index" :checked="checked" :title="task.taskName" @is-checked="(isChecked)=>checked[index]=isChecked"/>
        </div>
      </template>
    </CalendarByMonth>
    <div class="addForm" v-if="showAddForm" ref="addForm">
      <p>Add Event</p>
      <AddTasksForm :clicked="clicked" :projects="projects" :exist="existEvents"/>
    </div>
  </div>
</template>
<style scoped>
.projects {
  background-color: var(--primary-color-extra-light);
  padding-left: 3px;
  margin-bottom: 3px;
}
.events{
  background-color: var(--secondary-color);
  padding-left: 3px;
  margin-bottom: 3px;
}
.projects:hover{
  background-color: var(--primary-color);
}
.important {
  background-color: var(--important-color);
  color: white;
}
.important:hover{
  background-color: var(--important-color-light);
}
.tasksContainer {
  display: flex;
  flex-direction: column;
  margin-left: 19px;
}


.checkedItem {
  text-decoration: line-through;
}
.moreProjectsContainer{
  position: absolute;
  background-color:whitesmoke;
  top: 0;
  width: 170px;
  box-shadow: 2px 2px 3px rgba(53, 53, 53, 0.2);
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  border-radius: 3px;
  padding: 10px;
}

.moreProjects:hover{
  background-color: var(--primary-color-extra-light);
  color: black;
}
.subTitle{
  font-size: 16px;
  font-weight: 500;
  text-transform: capitalize;
}
.projectTitle{
  text-transform: capitalize;
}
.subTitle:hover{
  color: var(--primary-color);
}
.addForm{
  background-color: var(--primary-color-extra-light);
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  position: absolute;
  top: 20%;
  left: 45%;
  padding: 10px;
  border-radius: 10px;
  box-shadow: 3px 3px 6px 1px rgb(217,228,236,0.5);
}
.eventsContainer{

}

</style>
