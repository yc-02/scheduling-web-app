<script setup lang="ts">
import { projectsCollectionRef } from '@/firebase';
import { formatSubmitDate, inputDefaultDate } from '@/utils/dateUtils';
import { addDoc} from 'firebase/firestore';
import { ref, type Ref } from 'vue';
import { useRouter } from 'vue-router';

const projectName:Ref<string> = ref('')
const startDate:Ref<string> = ref(inputDefaultDate(new Date().toString()))
const endDate:Ref<string>=ref(inputDefaultDate(new Date().toString()))
const important = ref(false)




const route = useRouter()
const handleSubmit=async()=>{
    const newProject = {
        projectName:projectName.value,
        startDate:formatSubmitDate(startDate.value),
        endDate:formatSubmitDate(endDate.value),
        important:important.value

    }
    await addDoc(projectsCollectionRef,newProject).then((docRef)=>{
        route.push({name:'project',params:{id:docRef.id}})
    })
}

</script>

<template>
        <form @submit.prevent="handleSubmit">
            <label>
                Name
                <input placeholder="Name"  v-model.trim="projectName" required />
            </label>
            <label>
                Start Date
                <input type="date" v-model="startDate" required/>
            </label>
            <label>
                End Date
                <input type="date" v-model="endDate" required/>
            </label>
            <label>
                <input type="checkbox" v-model="important" style="width: 50px;"/>
                important
            </label>
            <button class="btn-primary">Add Project</button>
        </form>

</template>
<style scoped>

button{
    margin-top: 10px;
    font-weight: 600;
}
</style>