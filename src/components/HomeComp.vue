<script setup lang="ts">
import { isAfter, isBefore, isEqual } from "date-fns";
import CalendarByMonth from './CalendarByMonth.vue';
import router from '@/router';
import { onMounted, ref, watch, type Ref } from "vue";
import type { Tasks } from "env";
import { useProjects } from "@/stores/projects";
const lists = useProjects()


const handleClick = () =>{
    router.push('/projects')
}
const tasks:Ref<Tasks[]> = ref([])
onMounted(()=>{
    watch(lists.data,()=>{
      lists.value.forEach(list=>{
      tasks.value = list.tasks})
    })
})

const checked = ref()
console.log(checked.value)

</script>
<template>
    <div>
        <button @click="handleClick">Create New Project</button>
        <button>Add Daily Tasks</button>
        <div>
            <CalendarByMonth>
            <template #list="slotProps">
                <div v-for="list in lists" :key="list.id">
                    <RouterLink :to="{name:'project',params:{id:list.id}}">
                        <div
                        class="projects" 
                        v-if="isBefore(slotProps.dates,new Date(list.endDate)) && isAfter(slotProps.dates,new Date(list.startDate)) 
                        || isEqual(slotProps.dates,new Date(list.endDate)) || isEqual(slotProps.dates,new Date(list.startDate))"
                        >
                        {{list.listName}}
                    </div>
                    </RouterLink>
                </div>
            </template>
            <template #todayTasks>
                <div v-for="task,index in tasks" :key="index">
                    <div v-if="new Date().toLocaleDateString()===new Date(task.taskDate).toLocaleDateString()" style="display: flex; gap: 10px; margin: 3px;">
                        <input type="checkbox" v-model="checked"/>
                    <label>
                        {{ task.taskName }}
                    </label>
                    </div>
                </div>
            </template>
        </CalendarByMonth>
        </div>
    </div>
</template>
<style scoped>
form{
    display: inline-flex;
    flex-direction: column;
    background-color: rgb(204, 204, 240);;
    gap: 13px;
    padding: 30px;
    align-items: center;
    border-radius: 10px;
}
input{
    width: 300px;
}
label{
    width: 300px;
}

.projects{
    background-color: rgb(119, 119, 236);
    color: white;
    padding-left: 10px;
    margin-top: 3px;
    
}
</style>