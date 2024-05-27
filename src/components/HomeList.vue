<script setup lang="ts">
import { fetchAllProjects, fetchTasks } from "@/stores/fetchData";
import type { Project, Task } from "env";
import { ref, type Ref } from "vue";
//daily tasks
const tasks:Ref<Task[]> =ref([])
const projects:Ref<Project[]>=ref([])
const isLoading=ref(false)
fetchTasks({tasks,isLoading})
fetchAllProjects({projects})
</script>

<template>

    <div v-for="project in projects" :key="project.id">
    {{ project.projectName }}
    {{ project.startDate }} - {{ project.endDate }}
    <div v-for="task in tasks" :key="task.id">
        <div v-if="task.path?.includes(project.id)"></div>
        {{ task.taskName }}
    </div>
    </div>
</template>