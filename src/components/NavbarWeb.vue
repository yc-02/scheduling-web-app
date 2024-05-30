<script setup lang="ts">
import {RouterLink, useRoute} from 'vue-router'

const route= useRoute()
</script>
<template>
   <nav>
      <RouterLink to="/" :class="{current:route.fullPath==='/'}"><font-awesome-icon icon="fa-solid fa-calendar" size="sm"/>Home</RouterLink>
      <RouterLink to="/listview" :class="{current:route.fullPath==='/listview'}"><font-awesome-icon icon="fa-solid fa-list" size="sm" />List View</RouterLink>
   </nav>
</template>
<style scoped>
nav{
   padding:20px 0;
   border-radius: 10px;
   font-size: 16px;
   display: flex;
   gap: 9px;
   width: 100%;
}
a{
   background-color: var(--primary-color);
   padding: 6px;
   color: white;
   border-radius: 10px;
   font-weight: bold;
   display: flex;
   gap: 6px;
   align-items: center;
   width: 140px;
   justify-content: center;
   font-size: 15px;


}
a:hover{
   background-color: var(--primary-color-light);
}
.current{
   background-color: rgb(92, 170, 147);
}
.current:hover{
   background-color: rgb(143, 198, 181);
}
@media screen and (max-width: 1000px) {
a{
   font-size: 14px;
   padding: 5px;
}
nav{
  width: 90vw;
}
  
}

</style>