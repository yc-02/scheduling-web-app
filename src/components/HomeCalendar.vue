<script setup lang="ts">
import { isAfter, isBefore, isEqual } from 'date-fns';
import CalendarByMonth from './CalendarByMonth.vue';
import { nextTick, ref, watch, type Ref } from 'vue';
import { doc, updateDoc, type DocumentData } from 'firebase/firestore';
import { db } from '@/firebase';
import { fetchAllTasksByDate } from '@/services/fetchData';
import type { Project, Task } from 'env';
import { formatSubmitDate, sortProjectByStart, sortTasksByTime } from '@/utils/dateUtils';
import { onClickOutside } from '@vueuse/core';
import MyCheckbox from './MyCheckbox.vue';

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

const handleCheckChange = async (index: number) => {
  const path = todayTasks.value[index].path
  const isChecked = !checked.value[index]
  checked.value[index] = !checked.value[index]
  if (path) {
    const taskRef = doc(db, path)
    await updateDoc(taskRef, {
      checked: isChecked
    })
      .then(() => {
        console.log('checked')
      })
      .catch((error) => {
        console.log(error)
      })
  }
}

watch(todayTasks, () => {
  sortTasksByTime({ tasks: todayTasks.value })
  checked.value=todayTasks.value.map((task) => task.checked)
})

watch(()=>props.projects, () => {
  sortProjectByStart({ projects: props.projects })
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
            v-if="showProjects(slotProps, project)"
          >
            <RouterLink :to="{ name: 'project', params: { id: project.id } }">
              <div 
              :class="{ important: project.important}" class="projects">
                <p class="projectTitle">{{ project.projectName }}</p>
              </div>
            </RouterLink>
          </div>
        </div>
        <div class="moreProjectsContainer" ref="showAllProjects" v-if="parseInt(clickedIndex)===slotProps.datesAndIndex.index">
          <div v-for="project in projects" :key="project.id">
          <RouterLink :to="{ name: 'project', params: { id: project.id } }">
            <div  v-if="showProjects(slotProps, project)" class="projects" :class="{ important: project.important}" style="width: 150px">
              <p class="projectTitle">{{ project.projectName }}</p>
            </div>
          </RouterLink>
          </div>
        </div>
        </div>
      </template>
      <template #todayTasks>
        <div v-for="(task, index) in todayTasks" :key="index">
          <div class="tasksContainer">
            <RouterLink :to="{name:'project',params:{id:task.path?.split('/')[1]}}">
              <p class="subTitle">{{ todayEventsProject(task.path) }}</p>
            </RouterLink>
            <div class="tasksItems">
              <MyCheckbox :checked="checked[index]" :handle-check="()=>handleCheckChange(index)"/>
              <p :class="{ checkedItem: checked[index]}">{{ task.taskName }}</p>
            </div>
          </div>
        </div>
      </template>
    </CalendarByMonth>
  </div>
</template>
<style scoped>
.projects {
  background-color: var(--primary-color-extra-light);
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
  background-color: var(--important-color-dark);
}
.tasksContainer {
  display: flex;
  flex-direction: column;
  padding-left: 19px;
}
.tasksItems{
  display: flex;
  gap: 9px; 
  align-items: center;
  margin-left: 13px;
}

.checkedItem {
  text-decoration: line-through;
}
.moreProjectsContainer{
  position: absolute;
  background-color:whitesmoke;
  top: -10px;
  left: 120px;
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

</style>
