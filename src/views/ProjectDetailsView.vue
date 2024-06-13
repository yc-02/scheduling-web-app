<script setup lang="ts">
import { useRoute } from 'vue-router'
import TasksTable from '@/components/TasksTable.vue'
import { fetchProjectById, fetchTasksByProjectId } from '@/services/fetchData'
import { computed, onMounted, onUnmounted, ref, watch, type Ref } from 'vue'
import type { Project, Task } from 'env'
import AddTasksForm from '@/components/AddTasksForm.vue'
import { inputDefaultDate } from '@/utils/dateUtils'
import { onClickOutside } from '@vueuse/core'
import { handleDeleteProject } from '@/services/deleteData'
import CreateProjectForm from '@/components/CreateProjectForm.vue'


const route = useRoute()
const projectId = route.params.id.toString()
//get data from firebase
const project:Ref<Project|undefined> = ref()
fetchProjectById({ project: project, id: projectId })

const isLoading=ref(true)
// tasks by project id

const tasks: Ref<Task[]> = ref([])
fetchTasksByProjectId({ projectId: projectId, tasksById: tasks,isLoading:isLoading })
const parentWidth:Ref<number>=ref(0)
const parentRef:Ref<HTMLDivElement|null>=ref(null)
const screenWidth = ref(window.innerWidth)


const updateScreenWidth = () => {
  screenWidth.value = window.innerWidth
  if(parentRef.value){
    parentWidth.value=parentRef.value?.offsetWidth
  }
  
}


const minDate= ref()
const maxDate = ref()
watch(project,()=>{
  if(project.value){
    minDate.value= inputDefaultDate(project.value.startDate)
    maxDate.value=inputDefaultDate(project.value.endDate)
  }

})

//based on screen width change table width
onMounted(() => {
  if(parentRef.value){
    parentWidth.value=parentRef.value?.offsetWidth
  }
  window.addEventListener('resize', updateScreenWidth)
})
onUnmounted(() => {
  window.removeEventListener('resize', updateScreenWidth)
})

//double click to get date and time from child
const clickedDandT:Ref<{date: string, time: string}>= ref({date: '', time: ''})
const clickedToForm=computed(()=>{
  return {date:clickedDandT.value.date,time:clickedDandT.value.time,projectId:projectId,projectName:project.value?.projectName}
})

//add tasks toggle form
const formRef = ref(null)
const showForm=ref(false)
onClickOutside(formRef,()=>{
  showForm.value=false
})

const deleteProject = ()=>{
  if(project.value){
    handleDeleteProject({projectPath:project.value.path,tasks:tasks.value})
  }
}

//edit project toggle form
const projectFormRef=ref(null)
const showEditProject=ref(false)
const dataToProjectForm = ref(project)
const handleEditProject=()=>{
  showEditProject.value=true
  dataToProjectForm.value=project.value
}
onClickOutside(projectFormRef,()=>{
  showEditProject.value=false
})

//when task added without refreshing get task data
const taskUpdated = ref(false)
watch(taskUpdated,()=>{
  showForm.value=false
  fetchTasksByProjectId({ projectId: projectId, tasksById: tasks,isLoading:isLoading })
  taskUpdated.value=false
})

const projectUpdated = ref(false)
watch(projectUpdated,()=>{
  showEditProject.value=false
  fetchProjectById({ project: project, id: projectId })
  projectUpdated.value=false
})

</script>

<template>
  <div ref="parentRef" class="container">
    <div v-if="isLoading">Loading...</div>
    <div v-show="!isLoading" style="width: 100%;">
      <div class="headerContainer">
      <div class="headerLeft">
        <div class="titleContainer">
        <p class="title">{{ project?.projectName }}</p>
        <button @click="deleteProject"><font-awesome-icon icon="fa-solid fa-trash" style="color: brown;"/></button>
        <button @click="handleEditProject">Edit</button>
      </div>
          <em class="subTitle">{{ project?.startDate }} - {{ project?.endDate }}</em>
      </div>
          <button class="addButton" @click="showForm=true">
          <font-awesome-icon icon="fa-solid fa-plus" size="lg" /> 
          <p>Add Task</p>
        </button>
      </div>
    <TasksTable 
      @clickedDateTime="(data)=>clickedDandT=data" 
      @showForm="(form)=>showForm=form"
      @task-deleted="(deleted)=>taskUpdated=deleted"
      :projectFromParent="project" 
      :tasksFromParent="tasks" 
      :parentWidth="parentWidth" 
      :screenWidth="screenWidth"/>
    </div>
    <!-- add task form -->
    <div class="formContainer" v-if="showForm">
      <div class="formItem" ref="formRef">
        <p class="title">{{ project?.projectName }}</p>
        <AddTasksForm :clicked="clickedToForm" :minDate="minDate" :maxDate="maxDate" @data-update="(updated)=>taskUpdated = updated"/>
      </div>
    </div>
    <!-- project edit form -->
    <div class="formContainer" v-if="showEditProject">
      <div class="formItem" ref="projectFormRef">
        <CreateProjectForm :project="dataToProjectForm" :tasks="tasks" @project-updated="(updated)=>projectUpdated = updated"/>
      </div>
    </div>
  </div>

</template>

<style scoped>
.container{
  width: 100%;
  position: relative;
}

.title{
  text-transform: capitalize;
} 
.titleContainer{
  display: flex;
  gap: 3px;
}
.headerContainer{
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.addButton{
  display: flex;
  gap: 3px;
  align-items: center;
  font-size: 15px;
}

</style>
