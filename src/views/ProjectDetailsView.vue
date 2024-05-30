<script setup lang="ts">
import { db } from '@/firebase'
import { collection } from 'firebase/firestore'
import { useRoute } from 'vue-router'
import TasksTable from '@/components/TasksTable.vue'
import { fetchProjectById, fetchTasksByProjectId } from '@/services/fetchData'
import { onMounted, onUnmounted, ref, type Ref } from 'vue'
import type { Task } from 'env'

const route = useRoute()
const projectId = route.params.id.toString()
//get data from firebase
const project = ref()
fetchProjectById({ project: project, id: projectId })

// tasks by project id
const projectTasksRef = collection(db, 'projects', projectId, 'tasks')
const tasks: Ref<Task[]> = ref([])
fetchTasksByProjectId({ projectId: projectId, tasksById: tasks })
const parentWidth=ref()
const parentRef:Ref<HTMLDivElement|null>=ref(null)
const screenWidth = ref(window.innerWidth)


const updateScreenWidth = () => {
  screenWidth.value = window.innerWidth
  parentWidth.value=parentRef.value?.offsetWidth
  
}

onMounted(() => {
  parentWidth.value = parentRef.value?.offsetWidth
  window.addEventListener('resize', updateScreenWidth)
})
onUnmounted(() => {
  window.removeEventListener('resize', updateScreenWidth)
})
</script>

<template>
  <div ref="parentRef" class="container">
    <TasksTable :projectFromParent="project" :tasksFromParent="tasks" :tasksRef="projectTasksRef" :parentWidth="parentWidth" :screenWidth="screenWidth"/>
  </div>
</template>

<style scoped>
.container{
  width: 100%;
}

</style>
