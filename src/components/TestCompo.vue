<script setup lang="ts">
import { ref } from 'vue';

defineProps({
    name:{type:String, required:true}
})
const selected = ref(false)
</script>
<template>
    <div @click="selected= !selected">
        <p>{{ name }}</p>
        <div>{{ selected }}</div>
    </div>
</template>