<script setup lang="ts">
import ProjectsList from'@/components/ProjectsList.vue';
import { fetchAllProjects, fetchTasks } from '@/services/fetchData';
import { sortProjectByStart, sortTasksByTime } from '@/utils/dateUtils';
import type { Project, Task } from 'env';
import { ref, watch, type Ref } from 'vue';

//get all projects
const projects: Ref<Project[]> = ref([])
const isLoading= ref(true)
fetchAllProjects({ projects,isLoading })
watch(projects,()=>{
    sortProjectByStart({ projects: projects.value })
})
const tasks:Ref<Task[]> =ref([])
fetchTasks({tasks})
watch(tasks,()=>{
    sortTasksByTime(tasks.value)
})

</script>

<template>
    <div v-if="isLoading">
        <p>Loading...</p>
    </div>
    <div v-else>
        <ProjectsList :projects="projects" :tasks="tasks"/>
    </div>
</template>