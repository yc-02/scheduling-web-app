<script setup lang="ts">
import { db } from '@/firebase'
import { collection } from 'firebase/firestore'
import { useRoute } from 'vue-router'
import TasksTable from '@/components/TasksTable.vue'
import { fetchProjectById, fetchTasksByProjectId } from '@/services/fetchData'
import { computed, onMounted, onUnmounted, ref, watch, type Ref } from 'vue'
import type { Project, Task } from 'env'
import AddTasksForm from '@/components/AddTasksForm.vue'
import { inputDefaultDate } from '@/utils/dateUtils'
import { OnClickOutside } from '@vueuse/components'
import { onClickOutside } from '@vueuse/core'

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




onMounted(() => {
  if(parentRef.value){
    parentWidth.value=parentRef.value?.offsetWidth
  }
  window.addEventListener('resize', updateScreenWidth)
})
onUnmounted(() => {
  window.removeEventListener('resize', updateScreenWidth)
})

const clickedDandT:Ref<{date: string, time: string}>= ref({date: '', time: ''})
const clickedToForm=computed(()=>{
  return {date:clickedDandT.value.date,time:clickedDandT.value.time,id:projectId,isEvent:false}
})
const formRef = ref(null)
const showForm=ref(false)
onClickOutside(formRef,()=>{
  showForm.value=false
})
</script>

<template>
  <div ref="parentRef" class="container">
    <div v-if="isLoading">Loading...</div>
    <div v-show="!isLoading" style="width: 100%;">
    <TasksTable @clickedDateTime="(data)=>clickedDandT=data" @showForm="(form)=>showForm=form"
    :projectFromParent="project" :tasksFromParent="tasks" :parentWidth="parentWidth" :screenWidth="screenWidth"/>
    </div>
    <div class="formContainer" v-if="showForm" ref="formRef">
      <p class="title">Add Task</p>
      <AddTasksForm :clicked="clickedToForm" :minDate="minDate" :maxDate="maxDate"/>
    </div>
  </div>
</template>

<style scoped>
.container{
  width: 100%;
  position: relative;
}



</style>
