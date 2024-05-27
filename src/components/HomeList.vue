<script setup lang="ts">
import { getDatesInterval, toTimeString } from '@/utils/dateUtils';
import type { Project, Task } from 'env'
//daily tasks

const {projects,tasks} = defineProps<{
  tasks:Task[],
  projects:Project[]
}>()


</script>

<template>
  <div class="container">
    <div v-for="project in projects" :key="project.id" class="projectContainer">
      <div class="subTitle">
      {{ project.projectName }}
      {{ project.startDate }} - {{ project.endDate }}
      <div v-for="date in getDatesInterval({startDate:project.startDate,endDate:project.endDate})" :key="date.formatDate">
        {{ date.formatDate }} 
          <div v-for="task in tasks" :key="task.id">
          <div v-if="task.path?.includes(project.id) && new Date(task.taskDate).toString() === date.date.toString()">
            <div>
              {{ task.taskName}}
              {{ toTimeString(task.startTime)}} - {{ toTimeString(task.endTime) }}
            </div>
          </div>
        </div>
      </div>
      </div>
  </div>
  </div>
</template>

<style scoped>
.container{
  display: grid;
  grid-template-columns:repeat(3,1fr);
  gap: 20px;

}
.projectContainer{
  display: flex;
  flex-direction: column;
  background-color: var(--primary-color);
  height: 30vh;
  border-radius: 10px;
  
}

@media screen and (max-width:1100px) {
  .container{
  display: grid;
  grid-template-columns:repeat(2,1fr);
  gap: 20px;

}

}
@media screen and (max-width:600px) {
  .container{
  display: grid;
  grid-template-columns:repeat(1,1fr);
  gap: 20px;

}

}
</style>