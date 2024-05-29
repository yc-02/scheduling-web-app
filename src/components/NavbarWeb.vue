<script setup lang="ts">
import { useNow } from '@vueuse/core';
import {RouterLink} from 'vue-router'
const now = useNow()
</script>
<template>
   <nav>
      <RouterLink to="/">Home</RouterLink>
      <RouterLink to="/projects">Projects</RouterLink>
      <RouterLink to="#">About</RouterLink>
   </nav>
</template>
<style scoped>
nav{
   background-color: var(--primary-color-extra-light);
   padding:20px 13px;
   border-radius: 10px;
   font-size: 16px;
   display: flex;
   gap: 9px;
}

</style>