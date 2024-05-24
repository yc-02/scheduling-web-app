<script setup lang="ts">
import { listsRef } from '@/firebase';
import { formatSubmitDate, inputDefaultToday } from '@/stores/date';
import { addDoc} from 'firebase/firestore';
import { ref, type Ref } from 'vue';
import { useRouter } from 'vue-router';

const listName:Ref<string> = ref('')
const startDate:Ref<string> = ref(inputDefaultToday)
const endDate:Ref<string>=ref(inputDefaultToday)
const important = ref(false)




const route = useRouter()

const handleSubmit=async()=>{
    const newProject = {
        listName:listName.value,
        startDate:formatSubmitDate(startDate.value),
        endDate:formatSubmitDate(endDate.value),
        important:important.value

    }
    await addDoc(listsRef,newProject).then((docRef)=>{
        route.push({name:'project',params:{id:docRef.id}})
    })
}

</script>

<template>
        <form @submit.prevent="handleSubmit">
            <label>
                Name
                <input placeholder="Name"  v-model.trim="listName" required />
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