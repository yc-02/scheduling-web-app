<script setup lang="ts">
import { listsRef } from '@/firebase';
import { eachDayOfInterval, eachHourOfInterval, format} from 'date-fns';
import { doc } from 'firebase/firestore';
import { nextTick, onMounted, ref, watch, type Ref } from 'vue';
import { useRoute } from 'vue-router';
import { useDocument } from 'vuefire';
import { onClickOutside } from '@vueuse/core'
const route = useRoute()
const listId = route.params.id.toString()
//get data from firebase
const list = useDocument(doc(listsRef, listId))

type DatesType = {
    formatDate:string;
    date:Date
}
//total days in project
const dates:Ref<DatesType[]|undefined>= ref([])

//create dates
const watchListData = () =>{
    let datesVaule
    if(list.value?.startDate && list.value?.endDate){
        const result = eachDayOfInterval({
        start: new Date(list.value?.startDate),
        end: new Date(list.value?.endDate)
        })
        datesVaule= result.map(item=>{
            return {formatDate:format(new Date(item),'EEE, dd'),date:new Date(item)}
        })
        
    }
    return datesVaule
}


//generate a timeline from 12:00 AM to 12:00 AM
const timeline = eachHourOfInterval({
  start: new Date(2024, 10, 29, 0),
  end: new Date(2024, 10, 29, 24)
})

//formatted
const formattedTimeline = timeline.map(item=>{
    return format(new Date(item),'HH:mm')
})


//change table if there are tasks
const alterTable = ()=>{
    const tableRows = document.querySelectorAll('.tableRows')
    for(let i=0; i<tableRows.length; i++){
        const row = tableRows[i] as HTMLElement;
        if(i%2 ===0){
            row.style.backgroundColor='rgb(217, 217, 217)'
        }else{
            row.style.backgroundColor='white'
        }
    }
    nextTick(()=>{
        
    const listLength = list.value?.tasks?.length
    for(let i=0;i<listLength;i++){
        const tableData = document.querySelectorAll('.tableData')
        const filteredData = Array.from(tableData).filter(td => td.querySelector(`.showTasks${i}`) !== null);
        for(let i=filteredData.length-1; i>0;i--){
            filteredData[i].remove()
        }
        const firstData = filteredData[0] as HTMLTableCellElement
        firstData.rowSpan=filteredData.length-1

    }
})
    
}
const modal = ref(list.value?.tasks?.map(()=>false))
//onmounted watch list data invoke functions

onMounted(()=>{
    watch(list.data,()=>{
    dates.value = watchListData()
    alterTable()
    modal.value = list.value?.tasks?.map(()=>false)

})

})


const handleClick = (index:number)=>{
    modal.value[index]=true
    for (let key in modal.value){
        if(parseInt(key)!==index){
            modal.value[key]=false
        }
    }
    
}
const target = ref()
console.log(target.value)
const closeModal=()=>{
    for (let key in modal.value){
        modal.value[key]=false
    }
}
onClickOutside(target,closeModal)
</script>

<template>
    <div>
        {{ list?.listName }}
        {{ (list?.startDate) }} to {{ list?.endDate }}
    </div>
    <table>
        <tr>
            <th></th>
            <th  v-for="date in dates" :key="date.formatDate" class="tableHeader">
                {{ date.formatDate }}
            </th>
        </tr>
        <tr v-for="time,index in formattedTimeline" :key="index" class="tableRows">
            <td>{{ time }}</td>
            <td v-for="date in dates" :key="date.formatDate" class="tableData">
            <div v-for="task,i in list?.tasks" :key="i" @click="handleClick(i)" ref="target">
                <div v-if="new Date(task.taskDate).toDateString() === new Date(date.date).toDateString() && index>= parseInt(task.startTime.split(':')[0]) && index<= parseInt(task.endTime.split(':')[0])" :class="'showTasks'+i" style="position: relative;">
                    {{ task.taskName }}
                    {{ task.startTime }}
                    {{ task.endTime }}
                    <div v-if="modal[i]" class="modal">
                        <li>{{ task.taskName }}</li>
                        <li>{{ task.startTime }}-{{ task.endTime }}</li>
                        <li> {{ task.details }}</li>
                    </div> 
                </div>
            </div>
            </td>
        </tr>
</table>

</template>

<style scoped>

.modal{
    position: absolute;
    background-color: white;
    top: 0;
    height: 200px;
    width: 200px;
    border-radius: 10px;
    box-shadow: 2px 2px rgb(27, 27, 27,0.1);
}
.showTasks{
    background-color: pink;
}
table{
    border:1px solid rgb(166, 166, 166);
}
td,th{
  width: 90px;
  border-right: 1px solid rgb(166, 166, 166);
}
table{
    border-collapse: collapse;
}
.container{
    display: grid;
    grid-template-columns: 100px auto;
}


.timelineLeft{
    display: grid;
    grid-template-rows:repeat(26,40px); 
}

.datesContainer{
    display: grid;
    grid-template-columns: repeat(9,1fr);

}
.title{
    background-color: aquamarine;
    border-bottom: solid 1px;
    border-right: solid 1px;
    height: 40px;
}




</style>