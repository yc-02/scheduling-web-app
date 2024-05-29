<script setup lang="ts">
import { RouterView } from 'vue-router'
import NavbarWeb from './components/NavbarWeb.vue';


</script>

<template>
    <header>
      <NavbarWeb/>
    </header>
    <main>
      <RouterView/>
    </main>
</template>

<style>
</style>