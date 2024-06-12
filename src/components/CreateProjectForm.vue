<script setup lang="ts">
import { projectsCollectionRef } from '@/firebase';
import { formatSubmitDate, inputDefaultDate } from '@/utils/dateUtils';
import { isBefore, isEqual } from 'date-fns';
import { addDoc} from 'firebase/firestore';
import { ref, type Ref } from 'vue';
import { useRouter } from 'vue-router';

const projectName:Ref<string> = ref('')
const startDate:Ref<string> = ref(inputDefaultDate(new Date()))
const endDate:Ref<string>=ref(inputDefaultDate(new Date()))
const important = ref(false)
const errorMessage=ref()


const route = useRouter()
const handleSubmit=async()=>{
    if(isBefore(startDate.value,endDate.value) || isEqual(startDate.value,endDate.value)){
        const newProject = {
        projectName:projectName.value,
        startDate:formatSubmitDate(startDate.value),
        endDate:formatSubmitDate(endDate.value),
        important:important.value

    }
    await addDoc(projectsCollectionRef,newProject).then((docRef)=>{
        route.push({name:'project',params:{id:docRef.id}})
    })

    }else{
        errorMessage.value='Start date cannot be later than end date.'
    }

}

</script>

<template>
        <form @submit.prevent="handleSubmit">
            <label>
                Title
                <input placeholder="Title"  v-model.trim="projectName" required />
            </label>
            <label>
                Start Date
                <input type="date" v-model="startDate" required/>
            </label>
            <label>
                End Date
                <input type="date" v-model="endDate" required/>
            </label>
            <label class="error">{{ errorMessage }}</label>
            <label class="checkLable">
                <input type="checkbox" v-model="important" class="checkInput"/>
                important
            </label>
            <button class="btn-primary btn-form">Add Project</button>
        </form>

</template>
<style scoped>
.error{
   font-size: small;
   color: rgb(185, 72, 119);
}



</style>