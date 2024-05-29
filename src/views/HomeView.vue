<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch, type Ref } from 'vue';
import HomeCalendar from '@/components/HomeCalendar.vue';
import { useNow } from '@vueuse/core';
import { fetchAllProjects } from '@/services/fetchData';
import type { Project } from 'env';
import { sortProjectByStart } from '@/utils/dateUtils';
//now time
const now = useNow()
//get all projects
const projects: Ref<Project[]> = ref([])
const isLoading= ref(true)
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

watch(projects,()=>{
    sortProjectByStart({ projects: projects.value })
})
</script>

<template>
  <div class="container">
    <div class="titleContainer">
    </div>
    <div v-if="isLoading">
      Loading...
    </div>
    <div v-show="!isLoading" class="homeComponent">
      <HomeCalendar :projects="projects"/>
    </div>

  </div>
</template>
<style scoped>
@media screen and (max-width:900px) {


  
}
.titleContainer{
  display: inline-flex;
  flex-direction: column;
  gap: 3px;
}
.link{
  display: inline-flex;
  background-color: var(--primary-color);
  padding: 6px;
  border-radius: 10px;
  color: white;
  font-weight: 500;
  
}
.container{
  display: flex;
  flex-direction: column;
  justify-content: center;
}


</style>