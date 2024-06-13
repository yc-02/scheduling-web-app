<script setup lang="ts">
import TasksTable from '@/components/TasksTable.vue'
import { formatSubmitDate } from '@/utils/dateUtils'
import { fetchAllTasksByDate } from '@/services/fetchData'
import { type DocumentData } from 'firebase/firestore'
import { onMounted, onUnmounted, ref, type Ref } from 'vue'
import { useRoute } from 'vue-router'
const route = useRoute()
const slug = route.params.slug
const tasksDate = formatSubmitDate(slug.toString())


const projectByDate = {
  projectName: 'All Tasks',
  startDate: tasksDate,
  endDate: tasksDate,
  important: false
}

const project = ref()
const tasks: Ref<DocumentData[]> = ref([])
const isLoading = ref(true)
fetchAllTasksByDate({ tasks: tasks, date: tasksDate,isLoading })

const parentWidth:Ref<number>=ref(0)
const parentRef:Ref<HTMLDivElement|null>=ref(null)

const updateScreenWidth = () => {
  if(parentRef.value){
    parentWidth.value=parentRef.value.offsetWidth
  }
}

onMounted(() => {
  project.value = projectByDate
  if(parentRef.value){
    parentWidth.value=parentRef.value.offsetWidth
  }
  window.addEventListener('resize', updateScreenWidth)
})
onUnmounted(() => {
  window.removeEventListener('resize', updateScreenWidth)
})

</script>
<template>
  <div class="container" ref="parentRef">
    <div v-if="isLoading">
    ...Loading
    </div>
    <div v-show="!isLoading">
    <TasksTable :projectFromParent="project" :tasksFromParent="tasks" :parentWidth="parentWidth"/>
    </div>
  </div>
</template>
<style scoped>
.container{
  width: 100%;
}

</style>