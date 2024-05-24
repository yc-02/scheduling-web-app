<script setup lang="ts">
import { db } from '@/firebase';
import { collection } from 'firebase/firestore';
import { useRoute } from 'vue-router';
import { useCollection} from 'vuefire';
import TasksTable from '@/components/TasksTable.vue'
import { fetchProjectById } from '@/stores/projects';
import { ref } from 'vue';

const route = useRoute()
const listId = route.params.id.toString()
//get data from firebase
const list = ref()
fetchProjectById(list,listId)

// sub collection tasks
const projectTasksRef = collection(db,'lists',listId,'tasks')
const tasks = useCollection(projectTasksRef)


</script>

<template>
    <main>
    <TasksTable :listFromParent="list" :tasksFromParent="tasks" :tasksRef="projectTasksRef"></TasksTable>
    </main>
</template>



<style scoped>


</style>