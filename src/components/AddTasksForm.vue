<script setup lang="ts">
import { ref, watch } from 'vue';
import { addDoc, arrayUnion, collection, doc, setDoc, updateDoc } from 'firebase/firestore';
import { useRouter } from 'vue-router';
import { formatSubmitDate } from '@/utils/dateUtils';
import { db } from '@/firebase';


const props = defineProps<{
    minDate?:string;
    maxDate?:string;
    clicked:{date:string,time:string,id:string};
    exist?:boolean
}>()

const taskName = ref('')
const taskDate = ref(props.clicked.date)
const startTime = ref(props.clicked.time)
const endTime = ref()
const taskDetails=ref('')

const tasksRef=ref(collection(db,'projects',props.clicked.id,'tasks'))


watch(props,(newValue)=>{
    taskDate.value=newValue.clicked?.date
    startTime.value=newValue.clicked?.time
    tasksRef.value = collection(db,'projects',props.clicked.id,'tasks')

    
})



const router = useRouter()
const handleSubmit=async()=>{
    if(props.exist === true){
        await updateDoc(doc(db,'projects',props.clicked.id),{
        projectName:taskDate.value,
        events:arrayUnion(taskName.value),
        startDate:formatSubmitDate(taskDate.value),
        endDate:formatSubmitDate(taskDate.value),
        important:false,
    })
    }else{
        await setDoc(doc(db,'projects',props.clicked.id),{
        projectName:taskDate.value,
        events:arrayUnion(taskName.value),
        startDate:formatSubmitDate(taskDate.value),
        endDate:formatSubmitDate(taskDate.value),
        important:false,
    })
    }
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

    await addDoc(tasksRef.value,newTask).then(()=>{
        router.go(0)
    })
}



//submit form
</script>
<template>
    <form style="display: inline-flex; flex-direction: column;" @submit.prevent="handleSubmit">
        <label>
          Title
            <input type="text" placeholder="Title" v-model="taskName" required>
        </label>
        <label>
           Date
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
        <button class="btn-primary">Add</button>
    </form>
</template> 
<style scoped>
form{
    padding: 20px;
    border-radius: 10px;
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
button{
    padding: 10px;
    border-radius: 10px;
}

</style>