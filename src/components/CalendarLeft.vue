<script setup lang="ts">
import { dateSlug } from '@/utils/dateUtils';

</script>
<template>
    <div class="calendarContainer">
      <div class="calendarLeft">
        <RouterLink :to="{name:'tasks',params:{slug:`${dateSlug(new Date())}`}}">
          <p class="title">Today</p>
        </RouterLink>
        <slot name="todayTasks"></slot>
    </div>
    </div>
</template>