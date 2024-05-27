<script setup lang="ts">
import { ref, watch } from 'vue';
import { CollectionReference, addDoc, type DocumentData } from 'firebase/firestore';
import { useRouter } from 'vue-router';
import { formatSubmitDate } from '@/utils/dateUtils';
const props = defineProps<{
    tasksRef:CollectionReference<DocumentData,DocumentData>;
    minDate:string;
    maxDate:string;
    clicked:{date:string,time:string};
}>()

const taskName = ref('')
const taskDate = ref(props.clicked.date)
const startTime = ref(props.clicked.time)
const endTime = ref()
const taskDetails=ref('')

watch(props,(newValue,oldValue)=>{
    taskDate.value=newValue.clicked.date
    startTime.value=newValue.clicked.time


})
const router = useRouter()
const handleSubmit=async()=>{
    let newTask
    if(taskDate.value && startTime.value){
        newTask={
        taskName:taskName.value,
        taskDate:formatSubmitDate(taskDate.value),
        startTime:startTime.value,
        endTime:endTime.value,
        details:taskDetails.value,
        checked:false,
    }}
    
    await addDoc(props.tasksRef,newTask).then(()=>{
        router.go(0)
    })
}



//submit form
</script>
<template>
    <form style="display: inline-flex; flex-direction: column;" @submit.prevent="handleSubmit">
        <p style="text-align: center;">Add Tasks</p>
        <label>
            Task Name
            <input type="text" placeholder="Task Name" v-model="taskName" required>
        </label>
        <label>
           Task Date
            <input type="date" v-model="taskDate" required :min="minDate" :max="maxDate"/>
        </label>
        <label>
            Start Time
            <input type="time" required v-model="startTime"/>
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
form{
    background-color: var(--primary-color);
    padding: 20px;
    border-radius: 10px;
    box-shadow: 1px 1px rgb(0, 0, 0,0.1);
}
input{
    padding: 10px;
    width: 300px;
    border: none;
    border-radius: 10px;
    margin-bottom: 10px;
}
label{
    width: 300px;
}

</style>