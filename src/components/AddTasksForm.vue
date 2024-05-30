<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { addDoc, arrayUnion, collection, doc, setDoc, updateDoc } from 'firebase/firestore';
import { useRouter } from 'vue-router';
import { compareTime, formatSubmitDate } from '@/utils/dateUtils';
import { db } from '@/firebase';
import type { Project } from 'env';


const props = defineProps<{
    minDate?:string;
    maxDate?:string;
    clicked:{date:string,time?:string,id?:string,isEvent:boolean};
    eventExist?:boolean;
    projects:Project[]
}>()

const title = ref('')
const taskDate = ref(props.clicked.date)
const startTime = ref(props.clicked.time)
const endTime = ref()
const taskDetails=ref('')
const tasksRef=ref()


watch(props,(newValue)=>{
    taskDate.value=newValue.clicked?.date
    startTime.value=newValue.clicked?.time  
    if(newValue.clicked.id){
        tasksRef.value=collection(db,'projects',newValue.clicked.id,'tasks')
    }
 
})

if(props.clicked.isEvent===true){
    watch(taskDate,()=>{
        tasksRef.value=collection(db,'projects',taskDate.value,'tasks')
    },{immediate:true})
}
const isEventExist = computed(()=>{
    const exist = props.projects.filter(a=>a.id===taskDate.value)
    return exist.length>0? true: false
})


const errorMessage=ref('')
const router = useRouter()
const handleSubmit=async()=>{
    if(startTime.value && compareTime(startTime.value,endTime.value)<0){
    //for events only
    if(props.clicked.isEvent===true)
        if(isEventExist.value === true){
        await updateDoc(doc(db,'projects',taskDate.value),{
        projectName:taskDate.value,
        events:arrayUnion(title.value),
        startDate:formatSubmitDate(taskDate.value),
        endDate:formatSubmitDate(taskDate.value),
        important:false,
    })
    }else{
        await setDoc(doc(db,'projects',taskDate.value),{
        projectName:taskDate.value,
        events:arrayUnion(title.value),
        startDate:formatSubmitDate(taskDate.value),
        endDate:formatSubmitDate(taskDate.value),
        important:false,
    })
    }
    // //for events or tasks
    const newTask={
        taskName:title.value,
        taskDate:formatSubmitDate(taskDate.value),
        startTime:startTime.value,
        endTime:endTime.value,
        details:taskDetails.value,
        checked:false,
    }

    await addDoc(tasksRef.value,newTask).then(()=>{
        router.go(0)
    })

    }else{
        errorMessage.value='End time cannot be earlier than start time.'
    }

}



//submit form
</script>
<template>
    <form style="display: inline-flex; flex-direction: column;" @submit.prevent="handleSubmit">
        <label>
          Title
            <input type="text" placeholder="Title" v-model="title" required>
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
        <label class="error">{{ errorMessage }}</label>
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

</style>