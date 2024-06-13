<script setup lang="ts">
import { db, projectsCollectionRef } from '@/firebase';
import { handleDeleteSubCollection } from '@/services/deleteData';
import { formatSubmitDate, inputDefaultDate } from '@/utils/dateUtils';
import { isAfter, isBefore, isEqual } from 'date-fns';
import type { Project, Task } from 'env';
import { addDoc, doc, setDoc} from 'firebase/firestore';
import { computed, ref, type Ref } from 'vue';
import { useRouter } from 'vue-router';

const prop = defineProps<{
    project?:Project
    tasks?:Task[]
}>()

const projectName:Ref<string> = ref(prop.project?prop.project.projectName:'')
const startDate:Ref<string> = ref(prop.project?inputDefaultDate(prop.project.startDate):inputDefaultDate(new Date()))
const endDate:Ref<string>=ref(prop.project?inputDefaultDate(prop.project.endDate):inputDefaultDate(new Date()))
const important = ref(prop.project?prop.project.important:false)
const errorMessage=ref()

const deleteTasks= computed(()=>{
    return prop.tasks?.filter(t=>{
     return isBefore(t.taskDate,formatSubmitDate(startDate.value))||isAfter(t.taskDate,formatSubmitDate(endDate.value))
 })
})

const route = useRouter()

const emit = defineEmits(['project-updated'])
const handleSubmit=async()=>{
    if(isBefore(startDate.value,endDate.value) || isEqual(startDate.value,endDate.value)){
        const newProject = {
        projectName:projectName.value,
        startDate:formatSubmitDate(startDate.value),
        endDate:formatSubmitDate(endDate.value),
        important:important.value
        }
        if(prop.project){
            await setDoc(doc(db,prop.project.path),newProject).then(()=>{
                emit('project-updated',true)
            })
            if(deleteTasks.value) handleDeleteSubCollection(deleteTasks.value);
        }else{
        await addDoc(projectsCollectionRef,newProject).then((docRef)=>{
        route.push({name:'project',params:{id:docRef.id}})
    })

        }

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
            <button class="btn-primary btn-form">{{project?'Update':'Add'}} Project</button>
        </form>

</template>
<style scoped>
.error{
   font-size: small;
   color: rgb(185, 72, 119);
}



</style>