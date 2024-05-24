<script setup lang="ts">
import { isAfter, isBefore, isEqual } from "date-fns";
import CalendarByMonth from './CalendarByMonth.vue';
import router from '@/router';
import { ref } from "vue";
import { getDocs, type DocumentData } from "firebase/firestore";
import { listsRef, taskRef } from "@/firebase";
import { useCollection } from "vuefire";
const lists = useCollection(listsRef)
const tasks = ref()
const isLoading=ref(true)

function fetchTasks(){
    getDocs(taskRef).then(querySnapshot=>{
        tasks.value = querySnapshot.docs.map(doc=>{
            return doc.data()
        })
    }).then(()=>{
        isLoading.value=false
    }).catch(error=>{
        console.log(error)
    })
}
fetchTasks()

const handleClick = () =>{
    router.push('/projects')
}

const showTodayTasks=(task:DocumentData)=>{
    return new Date().toLocaleDateString()===new Date(task.taskDate).toLocaleDateString()
}
const showProjects=(slotProps:{dates:Date},list:DocumentData)=>{
    return isBefore(slotProps.dates,new Date(list.endDate)) && isAfter(slotProps.dates,new Date(list.startDate)) || isEqual(slotProps.dates,new Date(list.endDate)) || isEqual(slotProps.dates,new Date(list.startDate))
}

const checked = ref()



</script>
<template>
    <div v-show="!isLoading">
        <button @click="handleClick">Create New Project</button>
        <button>Add Daily Tasks</button>
        <div>
            <CalendarByMonth>
            <template #list="slotProps">
                <div v-for="list in lists" :key="list.id">
                    <RouterLink :to="{name:'project',params:{id:list.id}}">
                        <div class="projects" v-if="showProjects(slotProps,list)">
                        {{list.listName}}
                        </div>
                    </RouterLink>
                </div>
            </template>
            <template #todayTasks>
                <div v-for="task,index in tasks" :key="index">
                    <div v-if="showTodayTasks(task)" style="display: flex; gap: 10px; margin: 3px;">
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