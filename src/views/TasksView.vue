<script setup lang="ts">
import TasksTable from '@/components/TasksTable.vue';
import { formatSubmitDate } from '@/stores/date';
import { fetchAllTasksByDate } from '@/stores/projects';
import { type DocumentData } from 'firebase/firestore';
import { onMounted, ref, type Ref } from 'vue';
import { useRoute } from 'vue-router';
const route = useRoute()
const slug = route.params.slug
const tasksDate = formatSubmitDate(slug.toString())

//daily task not project tasks
// const dailyTasksRef = collection(db,'lists',tasksDate,'tasks')
// const dailyTasks = useCollection(dailyTasksRef)


const ListByDate={
    listName:'Tasks',
    startDate:tasksDate,
    endDate:tasksDate,
    important:false,
}

const lists = ref()
const tasks:Ref<DocumentData[]> =ref([])


fetchAllTasksByDate(tasks,tasksDate)
onMounted(()=>{
    lists.value = ListByDate
})
</script>
<template>
    <div>
        <TasksTable :listFromParent="lists" :tasksFromParent="tasks"/>
    </div>
</template>