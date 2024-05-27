<script setup lang="ts">
import { isAfter, isBefore, isEqual } from 'date-fns'
import CalendarByMonth from './CalendarByMonth.vue'
import { computed, nextTick, onMounted, ref, watch, type Ref } from 'vue'
import { doc, updateDoc, type DocumentData } from 'firebase/firestore'
import { db } from '@/firebase'
import { fetchAllProjects, fetchAllTasksByDate, sortProjectByStart, sortTasksByTime } from '@/stores/fetchData'
import { formatSubmitDate } from '@/stores/formatDates'
import type { Project, Task } from 'env'

const todayTasks: Ref<Task[]> = ref([])
const projects: Ref<Project[]> = ref([])
const isLoading = ref(true)
//get data from firebase
fetchAllProjects({ projects: projects })
const today = formatSubmitDate(new Date().toDateString())
fetchAllTasksByDate({ tasks: todayTasks, date: today, isLoading: isLoading })



const limitedProjects = computed(()=>{
  let slicedProject
  if(projects.value.length>3){
    slicedProject= projects.value.slice(0,3)
  }else{
    slicedProject=projects.value
  }
  return slicedProject
})

const showProjects = (slotProps: { datesAndIndex: {
    dates: Date;
    index: number;
} }, 
project: DocumentData) => {
  return (
    (isBefore(slotProps.datesAndIndex.dates, new Date(project.endDate)) &&
      isAfter(slotProps.datesAndIndex.dates, new Date(project.startDate))) ||
    isEqual(slotProps.datesAndIndex.dates, new Date(project.endDate)) ||
    isEqual(slotProps.datesAndIndex.dates, new Date(project.startDate))
  )
}

const checked: Ref<boolean[]> = ref([])
const checkedInitialValue = computed(()=>{
  return todayTasks.value.map((task) => task.checked)
})
checked.value=checkedInitialValue.value


watch(todayTasks, () => {
  sortTasksByTime({ tasks: todayTasks })
})

watch(projects,()=>{
  sortProjectByStart({projects:projects.value})
  showPlus()
})

const handleCheckChange = async (index: number) => {
  const path = todayTasks.value[index].path
  const isChecked = checked.value[index]
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

const projectRef:Ref<HTMLElement[]> = ref([])
const showPlus = ()=>{
  const count:any={}
  const countPosition:any[] = []
  nextTick(()=>{
    for(let i=0;i<projectRef.value?.length;i++){
      const project = projectRef.value[i]
     const positionIndex = project.dataset.dateindex
     if(positionIndex && count[positionIndex]){
      count[positionIndex]++
     }else if(positionIndex){
      count[positionIndex] =1
     }

    }
    for(let i=0; i<projectRef.value.length;i++){
      const project = projectRef.value[i]
      const positionIndex = project.dataset.dateindex
      if(positionIndex && count[positionIndex]>3){
        const index = parseInt(positionIndex)
        countPosition[index] = countPosition[index] || []
        countPosition[index].push(project)
      }
    }

    for (let i = 0; i < countPosition.length; i++) {
        const divArray = countPosition[i] as HTMLElement[]
        if (Array.isArray(divArray)) {
          const newPTag = `<button class="showMore">+${divArray.length-3} more</button>`
          divArray[2].insertAdjacentHTML('afterend',newPTag)
          const divLength =divArray.length
          for(let i=3;i<divLength;i++){
            divArray[i].style.display='none'
          }

          }
    }

    
  })
}


</script>
<template>
  <div v-show="!isLoading">
    <CalendarByMonth>
      <template #project="slotProps">
          <div v-for="project in projects" :key="project.id">
          <RouterLink :to="{ name: 'project', params: { id: project.id } }">
            <div
              :class="{ important: project.important }"
              class="projects"
              ref="projectRef"
              :data-dateindex="slotProps.datesAndIndex.index"
              v-if="showProjects(slotProps, project)"
            >
              {{ project.projectName }}
            </div>
          </RouterLink>
        </div>
      </template>
      <template #todayTasks>
        <div v-for="(task, index) in todayTasks" :key="index">
          <div class="tasksContainer">
            <input type="checkbox" v-model="checked[index]" @change="handleCheckChange(index)" />
            <p :class="{ checkedItem: checked[index] }">{{ task.taskName }}</p>
          </div>
        </div>
      </template>
    </CalendarByMonth>
  </div>
</template>
<style scoped>
.projects {
  background-color: var(--primary-color-light);
  padding-left: 3px;
  margin-bottom: 3px;
}
.important {
  background-color:pink;
  color: white;
}
.tasksContainer {
  display: flex;
  gap: 9px;
  padding-left: 19px;
}

.buttonContainer {
  display: flex;
  align-items: center;
  gap: 19px;
}
button {
  width: 160px;
}
.checkedItem {
  text-decoration: line-through;
}
</style>
