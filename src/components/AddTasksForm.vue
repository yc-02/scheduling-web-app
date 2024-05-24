<script setup lang="ts">
import { ref } from 'vue';
import { CollectionReference, addDoc, type DocumentData } from 'firebase/firestore';
import type { Tasks } from 'env';
import { formatSubmitDate, inputDefaultToday } from '@/stores/date';


const taskName = ref('')
const taskDate = ref(inputDefaultToday)
const startTime = ref()
const endTime = ref()
const taskDetails=ref('')

const props = defineProps({
    tasksRef:{
        type: Object as () => CollectionReference<DocumentData, DocumentData>,
        required:true
}
})


const handleSubmit=async()=>{

    const newTask:Tasks={
        taskName:taskName.value,
        taskDate:formatSubmitDate(taskDate.value),
        startTime:startTime.value,
        endTime:endTime.value,
        details:taskDetails.value,
        checked:false

    }
    
    await addDoc(props.tasksRef,newTask)
}
//submit form
</script>
<template>
    <form style="display: flex; flex-direction: column;" @submit.prevent="handleSubmit">
        <p style="text-align: center;">Add Tasks</p>
    <label>
        Task Name
        <input type="text" placeholder="Task Name" v-model="taskName" required>
    </label>
    <label>
       Task Date
        <input type="date" v-model="taskDate" required/>
    </label>
    <label>
        Start Time
        <input type="time" v-model="startTime" required/>
    </label>
    <label>
        End Time
        <input type="time" v-model="endTime" required/>
    </label>
    <label>
        Details
        <input type="text" v-model="taskDetails"/>
    </label>
    <button class="btn-primary">Add Task</button>
    </form>
</template> 
<style scoped>
input{
  border: none;
  padding:15px;
  border-radius: 5px;
  width: 300px;
}
label{
  width: 300px;
}

</style>