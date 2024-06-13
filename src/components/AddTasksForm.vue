<script setup lang="ts">
import { ref, watch } from 'vue';
import { addDoc,collection } from 'firebase/firestore';
import { useRouter } from 'vue-router';
import { compareTime, formatSubmitDate } from '@/utils/dateUtils';
import { db } from '@/firebase';


const props = defineProps<{
    minDate?:string;
    maxDate?:string;
    clicked:{date:string,time:string,projectId:string,projectName?:string};
}>()

const title = ref('')
const taskDate = ref(props.clicked.date)
const startTime = ref(props.clicked.time)
const endTime = ref()
const taskDetails=ref('')
const taskRefId=ref(props.clicked.projectId)
const isAllDay=ref(false)

watch(props,()=>{
    taskDate.value=props.clicked.date
    startTime.value=props.clicked.time
    taskRefId.value=props.clicked.projectId
    
})

watch(isAllDay,()=>{
    if(isAllDay.value){
        startTime.value='00:00'
        endTime.value='00:00'
    }
})


const emit = defineEmits(['data-update'])
const errorMessage=ref('')
// const router = useRouter()
const handleSubmit=async()=>{
    if(startTime.value && compareTime(startTime.value,endTime.value)<=0){
    // //for events or tasks
    const newTask={
        taskName:title.value,
        projectName:props.clicked.projectName,
        taskDate:formatSubmitDate(taskDate.value),
        startTime:startTime.value,
        endTime:endTime.value,
        details:taskDetails.value,
        checked:false,
    }
    if(taskRefId.value){
    await addDoc(collection(db,'projects',taskRefId.value,'tasks'),newTask).then(()=>{
        emit('data-update',true)
    })
    }else{
        alert('something wrong!')
    }
    }else{
        errorMessage.value='End time cannot be earlier than start time.'
    }

}



//submit form
</script>
<template>
    <form style="display: inline-flex; flex-direction: column;" @submit.prevent="handleSubmit">
        <label>
          Task
            <input type="text" placeholder="Task" v-model="title" required>
        </label>
        <label>
           Date
            <input type="date" v-model="taskDate" required :min="minDate" :max="maxDate"/>
        </label>
        <label class="checkLable">
        <input type="checkbox" class="checkInput" v-model="isAllDay"/> All Day  
        </label>
        <div class="timeContainer" v-if="!isAllDay">
        <label>
            Start Time 
            <input type="time" required v-model="startTime"/>
        </label>
        <label>
            End Time
            <input type="time" v-model="endTime" required/>
        </label>
        <label class="error">{{ errorMessage }}</label>
        </div>
        <label>
            Details
            <input type="text" v-model="taskDetails"/>
        </label>
        <button class="btn-primary btn-form">Add</button>
    </form>
</template> 
<style scoped>
.error{
   font-size: small;
   color: rgb(185, 72, 119);
}
.timeContainer{
    display:flex;
    flex-direction:column;
}
</style>