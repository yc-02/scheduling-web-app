<script setup lang="ts">
import { computed, ref, type Ref} from 'vue'
import TestCompo from '../components/TestCompo.vue'
type Item = {
  label: any;
  highPriority: boolean;
}
const items:Ref<Item[]> = ref([])

const newItem =ref("")
const reversedItems = computed(()=> [...items.value].reverse())
const highPriority=ref(false)
const saveItems =()=>{
    items.value.push({label:newItem.value,highPriority:highPriority.value})
    newItem.value=""
    highPriority.value=false
}
</script>
<template>
    <main>
    <form @submit.prevent="saveItems()">
        <input v-model.trim="newItem" type="text" placeholder="add an item"/>
        <label>
        <input type="checkbox" v-model="highPriority"/>
        High Priority
        </label>
    <button :disabled="newItem.length===0">add</button>
    </form>
    <div>
        <p v-if="!items.length">No items</p>
        <ul>
        <li v-for="({label,highPriority},index) in reversedItems" :key="index" :class="{important:highPriority}">{{ label}} {{ highPriority }}</li>
        </ul>
    </div>
    <TestCompo name="haha"></TestCompo>
    </main>
</template>

<style scoped>
.important{
    color: orange;
}
</style>