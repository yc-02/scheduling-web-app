<script setup lang="ts">
import { isAfter, isBefore, isEqual } from 'date-fns';
import CalendarByMonth from './CalendarByMonth.vue';
import { computed, nextTick, ref, watch, type Ref } from 'vue';
import { doc, updateDoc, type DocumentData } from 'firebase/firestore';
import { db } from '@/firebase';
import {
  fetchAllProjects,
  fetchAllTasksByDate,
  sortProjectByStart,
  sortTasksByTime
} from '@/services/fetchData';

import type { Project, Task } from 'env';
import { formatSubmitDate } from '@/utils/dateUtils';
import { onClickOutside } from '@vueuse/core';

const todayTasks: Ref<Task[]> = ref([])
const projects: Ref<Project[]> = ref([])
const isLoading = ref(true)
//get data from firebase
fetchAllProjects({ projects: projects })
const today = formatSubmitDate(new Date().toDateString())
fetchAllTasksByDate({ tasks: todayTasks, date: today, isLoading: isLoading })

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

          divArray[2].insertAdjacentElement('afterend', newNode)
        
        const divLength = divArray.length
        for (let i = 3; i < divLength; i++) {
          divArray[i].style.display = 'none'
        }
      }
    }
  })
}



// today's tasks checked
const checked: Ref<boolean[]> = ref([])

const checkedInitialValue = computed(() => {
  return todayTasks.value.map((task) => task.checked)
})

checked.value = checkedInitialValue.value

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

watch(todayTasks, () => {
  sortTasksByTime({ tasks: todayTasks })
})

watch(projects, () => {
  sortProjectByStart({ projects: projects.value })
  showMoreProjects()
})
const clickedIndex = ref()
const showAllProjects = ref(null)
const closeModal = ()=>{
  clickedIndex.value=''
}
onClickOutside(showAllProjects,closeModal)

</script>

<template>
  <div v-show="!isLoading">
    <CalendarByMonth>
      <template #project="slotProps">
        <div style="position: relative;">
          <div v-for="project in projects" :key="project.id">
          <div
            :class="{ important: project.important }"
            class="projects"
            ref="projectRef"
            :data-dateindex="slotProps.datesAndIndex.index"
            v-if="showProjects(slotProps, project)"
          >
            <RouterLink :to="{ name: 'project', params: { id: project.id } }">
              {{ project.projectName }}
            </RouterLink>
          </div>
        </div>
        <div class="showMoreProjects" ref="showAllProjects">
          <div v-for="project in projects" :key="project.id">
          <div  v-if="showProjects(slotProps, project)&&parseInt(clickedIndex)===slotProps.datesAndIndex.index ">
            <RouterLink :to="{ name: 'project', params: { id: project.id } }">
              {{ project.projectName }}
            </RouterLink>
          </div>
          </div>
        </div>
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
  background-color: pink;
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
.showMoreProjects{
  position: absolute;
  background-color: rgb(147, 147, 171);
  top: 0;
  width: 130px;
  padding-left: 10px;
}
</style>
