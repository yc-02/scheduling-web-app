<script setup lang="ts">

const props = defineProps<{
    checked:boolean;
    handleCheck:() => Promise<void>

}>()


</script>
<template>
<div class="box" @click="handleCheck" :class="{isChecked:checked}">
    <font-awesome-icon icon="fa-solid fa-check" v-if="checked" style="color:whitesmoke"/>
</div>
</template>
<style scoped>
.box{
    width: 19px; 
    height: 19px; 
    display: flex; 
    align-items: center; 
    justify-content: center; 
    padding: none;
    margin: none; 
    border-radius: 5px;
    cursor: pointer;
    border: 2px solid var(--primary-color-dark);
}
.isChecked{
    background-color: var(--primary-color-dark);
}

</style>