<script setup lang="ts">
import {RouterLink, useRoute} from 'vue-router'

const route= useRoute()
</script>
<template>
   <nav>
      <RouterLink to="/" :class="{current:route.fullPath==='/'}" class="link">
         <p>Home</p>
         <font-awesome-icon icon="fa-solid fa-calendar" size="sm"/>
      </RouterLink>
      <RouterLink to="/listview" :class="{current:route.fullPath==='/listview'}" class="link">
         <p>List</p>
         <font-awesome-icon icon="fa-solid fa-list" size="sm" />
      </RouterLink>
   </nav>
</template>
<style scoped>
nav{
   display: flex;
   flex-direction: column;
   gap: 10px;
   padding: 10px;
}
.link{
   display: inline-flex;
   align-items: center;
   justify-content: space-between;
}

a:hover{
   color: var(--primary-color-light);
}
.current{
   color: rgb(39, 127, 100);
}
.current:hover{
   color: rgb(143, 198, 181);
}

</style>