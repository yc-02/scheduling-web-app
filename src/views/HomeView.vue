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
        <button @click="handleClickPForm"><font-awesome-icon icon="fa-solid fa-plus" /> Project</button>
        <button @click="handleClickEForm"><font-awesome-icon icon="fa-solid fa-plus" /> Event</button>
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
  .titleContainer{
    padding: 0;
  }
  .timeContainer p{
    font-size: 15px;
  }
  button{
    padding: 0;
    background-color: inherit;
    color: black;
  }
  .formContainer {
  position: absolute;
  align-items: center;
  background-color: whitesmoke;
  left: 0;
  right: 0;
  top: 16%;
  min-height: 90%;
  margin: 0;
}

.form{
  min-height: 60%;
  align-items: start;
}
}
</style>
