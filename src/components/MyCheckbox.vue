<script setup lang="ts">
import { db } from '@/firebase';
import { doc, updateDoc } from 'firebase/firestore';



const {path,index,checked} = defineProps<{
    path:string|undefined;
    index:number;
    checked:boolean[];
    title:string;
}>()


const handleCheckChange = async () => {
  const isChecked = !checked[index]
  emit('is-checked',isChecked)
  if (path) {
    const taskRef = doc(db, path)
    await updateDoc(taskRef, {
      checked: isChecked
    })
      .then(() => {
        console.log('checked')
      })
      .catch((error) => {
        console.log(error)
      })
  }
}
const emit = defineEmits(['is-checked'])



</script>
<template>
  <div class="container">
    <div class="box" @click="handleCheckChange" :class="{isChecked:checked}">
    <font-awesome-icon icon="fa-solid fa-check" v-if="checked[index]" style="color:whitesmoke"/>
    </div>
    <p :class="{ checkedItem: checked[index]}">{{ title}}</p>
  </div>
</template>
<style scoped>
.container{
  display: flex;
  gap: 9px;
  align-items: center;
}
.box{
    width: 20px; 
    height: 20px; 
    min-width: 20px;
    min-height: 20px;
    display: flex; 
    align-items: center; 
    justify-content: center; 
    border-radius: 5px;
    cursor: pointer;
    border: 2px solid var(--primary-color-dark);
}
.isChecked{
    background-color: var(--primary-color-dark);
}
.checkedItem {
  text-decoration: line-through;
}

</style>