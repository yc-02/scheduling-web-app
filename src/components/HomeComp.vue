<script setup lang="ts">
import { isAfter, isBefore, isEqual } from "date-fns";
import CalendarByMonth from './CalendarByMonth.vue';
import router from '@/router';
import { ref, watch, type Ref } from "vue";
import { doc, updateDoc, type DocumentData } from "firebase/firestore";
import { db, listsRef } from "@/firebase";
import { useCollection } from "vuefire";
import { fetchAllTasksByDate, sortTasksByTime } from "@/stores/projects";
import { formatSubmitDate } from "@/stores/date";
import type { Tasks } from "env";
const lists = useCollection(listsRef)
const todayTasks:Ref<Tasks[]>=ref([])
const isLoading=ref(true)
//get data from firebase
const today = formatSubmitDate(new Date().toDateString())
fetchAllTasksByDate(todayTasks,today,isLoading)

const handleClick = () =>{
    router.push('/projects')
}


const showProjects=(slotProps:{dates:Date},list:DocumentData)=>{
    return isBefore(slotProps.dates,new Date(list.endDate)) && isAfter(slotProps.dates,new Date(list.startDate)) || isEqual(slotProps.dates,new Date(list.endDate)) || isEqual(slotProps.dates,new Date(list.startDate))
}


const checked:Ref<boolean[]> = ref([])
watch(todayTasks,()=>{
    sortTasksByTime(todayTasks)
    const checkedInitialValue = todayTasks.value.map(task=>task.checked)
    checked.value=checkedInitialValue
})

const handleCheckChange=async(index:number)=>{
const path = todayTasks.value[index].path
const isChecked = checked.value[index]
const taskRef = doc(db,path)
await updateDoc(taskRef,{
    checked:isChecked
}).then(()=>{
    console.log('checked')
}).catch(error=>{
    console.log(error)
})
}

</script>
<template>
    <div v-show="!isLoading">
            <CalendarByMonth>
            <template #list="slotProps">
                <div v-for="list in lists" :key="list.id">
                    <RouterLink :to="{name:'project',params:{id:list.id}}">
                        <div :class="{important:list.important}" class="projects" v-if="showProjects(slotProps,list)">
                        {{list.listName}}
                        </div>
                    </RouterLink>
                </div>
            </template>
            <template #todayTasks>
                <div v-for="task,index in todayTasks" :key="index">
                    <div class="tasksContainer">
                        <input type="checkbox" v-model="checked[index]" @change="handleCheckChange(index)"/>
                        <p :class="{checkedItem:task.checked}">{{ task.taskName }}</p>
                    </div>
                </div>
            </template>
        </CalendarByMonth>
    </div>
</template>
<style scoped>
.projects{
    background-color: var(--primary-color-light);
    padding-left: 3px;
    margin-bottom: 3px;
    
}
.important{
    background-color: var(--primary-color);
    color: white;
}
.tasksContainer{
    display: flex;
    gap: 9px;
    padding-left: 19px;
}

.buttonContainer{
    display: flex;
    align-items: center;
    gap: 19px;
}
button{
    width: 160px;
}
.checkedItem{
    text-decoration: line-through;
}
</style>