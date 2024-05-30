<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch, type Ref } from 'vue'
import HomeCalendar from '@/components/HomeCalendar.vue'
import { onClickOutside, useNow } from '@vueuse/core'
import { fetchAllProjects } from '@/services/fetchData'
import type { Project } from 'env'
import { inputDefaultDate, sortProjectByStart } from '@/utils/dateUtils'
import CreateProjectForm from '@/components/CreateProjectForm.vue'
import AddTasksForm from '@/components/AddTasksForm.vue'
//now time
const now = useNow()
//get all projects
const projects: Ref<Project[]> = ref([])
const isLoading = ref(true)
fetchAllProjects({ projects, isLoading })
//greeting
const greet = ref('Ying')

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
const showEForm = ref(false)
//project and event ref
const pFormRef = ref(null)
const eFormRef = ref(null)

//send to event form
const today = inputDefaultDate(new Date())
const clicked = { date: today, isEvent: true }

const handleClickEForm = () => {
  showEForm.value = true
  showPForm.value = false
}
const handleClickPForm = () => {
  showEForm.value = false
  showPForm.value = true
}

onMounted(() => {
  onClickOutside(eFormRef, () => {
    showEForm.value = false
  })

  onClickOutside(pFormRef, () => {
    showPForm.value = false
  })
})
</script>

<template>
  <div v-if="isLoading">Loading...</div>
  <div class="container" v-show="!isLoading">
    <div class="titleContainer">
      <div class="timeContainer">
        <p>{{ now.toDateString() }}</p>
        <p>{{ now.toLocaleTimeString() }}</p>
      </div>
      <div class="buttonContainer">
        <button @click="handleClickPForm">Create Project</button>
        <button @click="handleClickEForm">Create Event</button>
      </div>
    </div>
    <div class="homeComponent">
      <HomeCalendar :projects="projects" :screen-width="screenWidth"/>
    </div>
    <div class="formContainer" ref="pFormRef" v-if="showPForm">
      <p class="title">Create Project</p>
      <div class="form">
        <CreateProjectForm />
      </div>
    </div>
    <div ref="eFormRef" class="formContainer" v-if="showEForm">
      <p class="title">Create Event</p>
      <div class="form">
        <AddTasksForm :clicked="clicked" :projects="projects" />
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
.formContainer {
  position: absolute;
  left: 40%;
  background-color: var(--primary-color-extra-light);
  padding: 20px 30px;
  border-radius: 10px;
  box-shadow: 1px 1px 6px rgb(0, 0, 0, 0.2);
  max-height: 45vh;
  display: flex;
  flex-direction: column;
  gap: 9px;
}
.form {
  height: 90%;
  display: flex;
  align-items: center;
}
.buttonContainer {
  display: flex;
  gap: 6px;
}
button {
  background-color: var(--primary-color);
  color: white;
  padding: 9px;
  border-radius: 10px;
  font-weight: 600;
}
@media screen and (max-width:1000px) {
  .timeContainer{
    flex-direction: column;
  }
  .buttonContainer{
    flex-direction: column;
  }
  button{
    padding: 0;
    background-color: inherit;
    color: black;
  }
}
</style>
