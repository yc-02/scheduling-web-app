<script setup lang="ts">
import { formatSubmitDate, getDatesInterval, inputDefaultDate, toTimeString } from '@/utils/dateUtils';
import type { Project, Task } from 'env'
import { ref, watch, type Ref } from 'vue';
import MyCheckbox from './MyCheckbox.vue';
import { RouterLink } from 'vue-router';
import { format, isAfter, isBefore, isEqual } from 'date-fns';
import AddTasksForm from './AddTasksForm.vue';



//daily tasks
const props = defineProps<{
  projects:Project[];
  tasks:Task[]
}>()


// tasks checked
const checked:Ref<boolean[]>=ref([])

watch(props,()=>{
  const checkedValue = props.tasks.map((task)=>task.checked)
  checked.value= checkedValue
})

const showPast=ref(false)
const isCurrentOrPast = (project:Project)=>{
  if(showPast.value===true){
    return isBefore(new Date(project.endDate),formatSubmitDate(new Date().toString()))
  }else{
    return isAfter(new Date(project.endDate),formatSubmitDate(new Date().toString()))||isEqual(formatSubmitDate(new Date().toString()),new Date(project.endDate))
  }
}


const clicked:Ref<{date:string,time:string,id:string,eventOrTask:string}>= ref({date:'',time:'',id:'',eventOrTask:''})
const showForm=ref()
const handleClick = (date:Date,projectId:string)=>{
  let event:string=''
  if(projectId.includes('-')){
    event='event'
  }else{
    event='task'
  }
  clicked.value={date:inputDefaultDate(date.toString()),time:'',id:projectId,eventOrTask:event}
  showForm.value=true
}
const showTask = (task:Task,projectId:string,date:Date)=>{
  return task.path?.includes(projectId) && new Date(task.taskDate).toString() === date.toString()
}


const countTasks = (date:Date,projectId:string)=>{
  const filtered= props.tasks.filter(t=>{
   return  new Date(t.taskDate).toString()===date.toString() && t.path?.includes(projectId)
  })

return filtered.length
}



</script>

<template>
  <div style="position: relative;">
  <div class="buttonContainer"> 
    <button @click="showPast=false" :class="{currentProjects:!showPast}">Current</button>
    <button @click="showPast=true" :class="{currentProjects:showPast}">Past</button>
  </div>
  <!-- <div v-if="showForm" class="addTaskForm">
          <AddTasksForm :minDate="clicked.date" :maxDate="clicked.date" :clicked="clicked" />
  </div> -->
  <div class="projectsContainer">
    <div v-for="project in projects" :key="project.id">
      <div v-if="isCurrentOrPast(project)" class="projects">
        <div class="subTitle">
         <RouterLink :to="{name:'project',params:{id:project.id}}">
          <p class="projectTitle">{{ project.projectName }}</p>
         </RouterLink>
        <p class="projectTitle" v-if="!project.events">{{ project.startDate }} - {{ project.endDate }}</p>
        </div>
        <div v-for="date in getDatesInterval({startDate:project.startDate,endDate:project.endDate})" :key="date.formatDate" class="tasksContainer">
        <div class="dateTitle">
          <div style="display: flex; justify-content: space-between;">
            <p style="width: 70px;">{{ date.formatDate }}</p>
            <em> ({{countTasks(date.date,project.id)}})</em>
          </div>
          <div @click="handleClick(date.date,project.id)" style="cursor: pointer;">
            <font-awesome-icon icon="fa-solid fa-plus"/>
          </div>
        </div>
        <div v-for="task,index in tasks" :key="task.id">
        <div v-if="showTask(task,project.id,date.date)">
          <div class="itemContainer" :class="{checkedItem:checked[index]}">
            <div style="width: 50%;">
              <MyCheckbox :path="task.path" :index="index" :checked="checked" :title="task.taskName" @is-checked="(isChecked)=>checked[index]=isChecked"/>
            </div>
              <p style="width: 50%; text-align: end;">{{ toTimeString(task.startTime)}}-{{ toTimeString(task.endTime) }}</p>
          </div>
        </div>
        </div>
        </div>
      </div>
    </div>
  </div>
  </div>
</template>

<style scoped>

.projectsContainer{
  display: flex;
  flex-wrap: wrap;  
  align-items: start;
  font-size: 14px;

}
.projects{
  display: flex;
  flex-direction: column;
  background-color: whitesmoke;
  border-radius: 10px;
  padding:30px;
  width: 390px;
  height: auto;
  margin-right:19px;
  margin-bottom: 36px;
  
}
.subTitle{
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 9px;
}
.projectTitle{
  font-size: 16px;
  font-weight: 700;
  text-transform: capitalize;
  background-color: var(--primary-color-dark);
  color: whitesmoke;
  padding: 6px;
  border-radius: 10px;
  text-align: center;
}
.tasksContainer{
  display: flex;
  flex-direction: column;
  margin-bottom: 6px;
}
.dateTitle{
  background-color: var(--primary-color-light);
  padding: 6px 13px;
  border-radius: 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;

}
.dateTitle p{
  font-weight: 500;
}
.itemContainer{
  display: flex;
  align-items: center;
  margin: 6px;
}
.checkedItem {
  text-decoration: line-through;
  color: var(--text-color-light);
}
.currentProjects{
  text-decoration: underline;
  color: inherit;
}

button{
  padding: 10px;
  border-radius: 10px;
  font-size: 15px;
  font-weight: 500;
  color: var(--border-color-soft);
}
.buttonContainer{
  display: flex;
  gap: 9px;
  margin-bottom: 20px;
}
.addTaskForm{
  position: absolute;
  top: 20%;
  z-index: 3;
  left: 45%;
}

</style>