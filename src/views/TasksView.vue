<script setup lang="ts">
import TasksTable from '@/components/TasksTable.vue'
import { formatSubmitDate } from '@/stores/formatDates'
import { fetchAllTasksByDate } from '@/stores/fetchData'
import { type DocumentData } from 'firebase/firestore'
import { onMounted, ref, type Ref } from 'vue'
import { useRoute } from 'vue-router'
const route = useRoute()
const slug = route.params.slug
const tasksDate = formatSubmitDate(slug.toString())

//daily task not project tasks
// const dailyTasksRef = collection(db,'projects',tasksDate,'tasks')
// const dailyTasks = useCollection(dailyTasksRef)

const projectByDate = {
  projectName: 'Tasks',
  startDate: tasksDate,
  endDate: tasksDate,
  important: false
}

const project = ref()
const tasks: Ref<DocumentData[]> = ref([])

fetchAllTasksByDate({ tasks: tasks, date: tasksDate })
onMounted(() => {
  project.value = projectByDate
})
</script>
<template>
  <div>
    <TasksTable :projectFromParent="project" :tasksFromParent="tasks" />
  </div>
</template>
