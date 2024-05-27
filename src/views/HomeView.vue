<script setup lang="ts">
import { onMounted, onUnmounted, ref, type Ref } from 'vue';
import HomeCalendar from '@/components/HomeCalendar.vue';
import HomeList from '@/components/HomeList.vue';
import { useNow } from '@vueuse/core';
import { fetchAllProjects, fetchTasks } from '@/services/fetchData';
import type { Project, Task } from 'env';
//now time
const now = useNow()
//get all tasks and projects
const tasks: Ref<Task[]> = ref([])
const projects: Ref<Project[]> = ref([])
const isLoading= ref(true)
fetchTasks({ tasks })
fetchAllProjects({ projects,isLoading })
//greeting
const greet = ref('Ying')
//toggle list view and calendar view
const listView =ref(false)

const toggleView = ()=>{
  listView.value=!listView.value
}

//base on screen width changed list view and calendar view
const screenWidth = ref(window.innerWidth);

const updateScreenWidth = () => {
  screenWidth.value = window.innerWidth;
};

onMounted(() => {
  window.addEventListener('resize', updateScreenWidth);
});
onUnmounted(() => {
  window.removeEventListener('resize', updateScreenWidth);
});


</script>

<template>
  <main>
    <div>
    Hello, {{ greet }}
    </div>
    <p>{{ now }}</p>
    <div v-if="isLoading">
      Loading...
    </div>
    <div v-show="!isLoading">
    <button @click="toggleView" v-show="screenWidth>1000">{{listView?'Calendar View':'List View'}}</button>
    <div v-show="listView||screenWidth<1000">
      <HomeList :tasks="tasks" :projects="projects"/>
    </div>
    <div v-show="!listView||screenWidth>1000">
      <HomeCalendar :projects="projects"/>
    </div>
    </div>
  </main>
</template>
<style scoped>
@media screen and (max-width:900px) {


  
}
</style>