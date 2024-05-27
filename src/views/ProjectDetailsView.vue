<script setup lang="ts">
import { db } from '@/firebase'
import { collection } from 'firebase/firestore'
import { useRoute } from 'vue-router'
import { useCollection } from 'vuefire'
import TasksTable from '@/components/TasksTable.vue'
import { fetchProjectById, fetchTasksByProjectId } from '@/stores/fetchData'
import { ref, type Ref } from 'vue'
import AddTasksForm from '@/components/AddTasksForm.vue'
import { inputDefaultDate } from '@/stores/formatDates'
import type { Task } from 'env'

const route = useRoute()
const projectId = route.params.id.toString()
//get data from firebase
const project = ref()
fetchProjectById({ project: project, id: projectId })

// tasks by project id
const projectTasksRef = collection(db, 'projects', projectId, 'tasks')
const tasks:Ref<Task[]>=ref([])
fetchTasksByProjectId({projectId:projectId,tasksById:tasks})
</script>

<template>
  <main>
    <TasksTable :projectFromParent="project" :tasksFromParent="tasks" :tasksRef="projectTasksRef" />
  </main>
</template>

<style scoped></style>
