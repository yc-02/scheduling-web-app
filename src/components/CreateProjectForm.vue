<script setup lang="ts">
import { listsRef } from '@/firebase';
import { format } from 'date-fns';
import { addDoc} from 'firebase/firestore';
import { ref, type Ref } from 'vue';
import { useRouter } from 'vue-router';

const today = format(new Date(),'yyyy-MM-dd')
const listName:Ref<string> = ref('')
const startDate:Ref<string> = ref(today)
const endDate:Ref<string>=ref(today)
const important = ref(false)




const route = useRouter()

const handleSubmit=async()=>{
    const newProject = {
        listName:listName.value,
        startDate:format(new Date(startDate.value),'MMM dd, yyyy'),
        endDate:format(new Date(endDate.value),'MMM dd, yyyy'),
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
form{
    display: inline-flex;
    flex-direction: column;
    background-color: rgb(202, 202, 227);
    padding: 20px;
    border-radius: 5px;
    gap: 10px;
}
input{
    border: none;
    padding:15px;
    border-radius: 5px;
    width: 300px;
}
label{
    width: 300px;
}
button{
    margin-top: 10px;
    font-weight: 600;
}
</style>