<script setup lang="ts">
import { ref } from 'vue';
import HomeCalendar from '@/components/HomeCalendar.vue';
import HomeList from '@/components/HomeList.vue';
import { useNow } from '@vueuse/core';
const now = useNow()
const greet = ref('Ying')
const listView =ref(false)
const toggleView = ()=>{
  listView.value=!listView.value
}
</script>

<template>
  <main>
    <div>
    Hello, {{ greet }}
    </div>
    <p>{{ now }}</p>
    <button @click="toggleView">list view</button>
    <div v-if="listView">
      <HomeList/>
    </div>
    <div v-else>
      <HomeCalendar/>
    </div>
  </main>
</template>
