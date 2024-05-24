<script setup lang="ts">
import { ref } from 'vue';
import HomeComp from '@/components/HomeComp.vue';
import { useNow } from '@vueuse/core';
const now = useNow()
const greet = ref('Ying')

</script>

<template>
  <main>
    <div>
    Hello, {{ greet }}
    </div>
    <p>{{ now }}</p>
    <HomeComp/>
  </main>
</template>
