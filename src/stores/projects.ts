import { db, taskRef } from "@/firebase"
import {doc, getDoc, getDocs, query, where, type DocumentData } from "firebase/firestore"
import type { Ref } from "vue"
//get projects lists


export async function fetchProjectById(list:Ref<DocumentData>,listId:string){
    const listDocRef = doc(db,'lists',listId)
    const docSnap = await getDoc(listDocRef)
    if(docSnap.exists()){
        list.value={id:docSnap.id,path:docSnap.ref.path,...docSnap.data()}
    }else{
        console.log('no list')
    }

}

//fetch all tasks
export function fetchTasks(tasks:Ref<DocumentData[]>,isLoading:Ref<boolean>){
    getDocs(taskRef).then(querySnapshot=>{
        tasks.value = querySnapshot.docs.map(doc=>{
            return {id:doc.id,path:doc.ref.path,...doc.data()}
        })
    }).then(()=>{
        isLoading.value=false
    }).catch(error=>{
        console.log(error)
    })
}

export function fetchAllTasksByDate(tasks:Ref<DocumentData[]>,date:string,isLoading?:Ref<boolean>){
    const q = query(taskRef,where("taskDate","==",date))
    getDocs(q).then(querySnapshot=>{
        tasks.value = querySnapshot.docs.map(doc=>{
            return {id:doc.id,path:doc.ref.path,...doc.data()}
        })
    }).then(()=>{
        if(isLoading){
            isLoading.value=false
        }
    }).catch(error=>{
        console.log(error)
    })
}

 //sort by start time
const formatTime = (time:string)=>{
    return new Date(`May 24, 2024 ${time}`)
}
export const sortTasksByTime = (tasks:Ref<DocumentData[]|undefined>)=>{
    tasks.value?.sort((a,b)=>{
        const dateA = formatTime(a.startTime).getTime();
        const dateB = formatTime(b.startTime).getTime();
        return dateA - dateB
        }); 
}