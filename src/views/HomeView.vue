<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch, type Ref } from 'vue'
import HomeCalendar from '@/components/HomeCalendar.vue'
import { onClickOutside, useNow } from '@vueuse/core'
import { fetchAllProjects } from '@/services/fetchData'
import type { Project } from 'env'
import { sortProjectByStart } from '@/utils/dateUtils'
import CreateProjectForm from '@/components/CreateProjectForm.vue'
//now time
const now = useNow()
//get all projects
const projects: Ref<Project[]> = ref([])
const isLoading = ref(true)
fetchAllProjects({ projects, isLoading })

//base on screen width changed list view and calendar view
const screenWidth = ref(window.innerWidth)

const updateScreenWidth = () => {
  screenWidth.value = window.innerWidth
}

onMounted(() => {
  window.addEventListener('resize', updateScreenWidth)
})
onUnmounted(() => {
  window.removeEventListener('resize', updateScreenWidth)
})

watch(projects, () => {
  sortProjectByStart({ projects: projects.value })
})

const showPForm = ref(false)
//project and event ref
const pFormRef = ref(null)

const handleClickPForm = () => {
  showPForm.value = true
}

onMounted(() => {
  onClickOutside(pFormRef, () => {
    showPForm.value = false
  })
})
</script>

<template>
  <div v-if="isLoading">Loading...</div>
  <div class="container" v-show="!isLoading">
    <!-- <div class="titleContainer">
      <div class="timeContainer">
        <p>{{ now.toDateString() }}</p>
        <p>{{ now.toLocaleTimeString() }}</p>
      </div>
    </div> -->
    <div class="homeComponent">
      <HomeCalendar :projects="projects" :screen-width="screenWidth">
        <template #addProject>
          <button @click="handleClickPForm"><font-awesome-icon icon="fa-solid fa-plus" /> Project</button>
        </template>
      </HomeCalendar>
    </div>
    <div class="formContainer"  v-if="showPForm">
      <div class="formItem" ref="pFormRef">
        <p class="title">Create Project</p>
          <CreateProjectForm />
      </div>
    </div>
  </div>
</template>
<style scoped>
.timeContainer {
  display: inline-flex;
  gap: 3px;
}
.titleContainer {
  display: inline-flex;
  justify-content: space-between;
  padding: 6px 20px;
}
.link {
  display: inline-flex;
  background-color: var(--primary-color);
  padding: 6px;
  border-radius: 10px;
  color: white;
  font-weight: 500;
}
.container {
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: center;
  width: 100%;
}

.form {
  height: 90%;
  display: flex;
  align-items: center;
}

button {
  font-weight: 600;
  font-size: 16px;
  padding: 9px;
  border-radius: 10px;
  background-color: whitesmoke;
  box-shadow: 1px 1px 9px rgb(0, 0, 0,0.1);
}
@media screen and (max-width:1000px) {
  .titleContainer{
    padding: 0;
  }
  .timeContainer p{
    font-size: 15px;
  }
  button{
    font-size: inherit;
    background-color: white;
    padding: 6px;
  }
}
</style>
