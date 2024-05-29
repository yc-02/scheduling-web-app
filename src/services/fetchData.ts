import { db, projectsCollectionRef, tasksCollectionRef } from "@/firebase"
import type { Task } from "env";
import {collection, doc, getDoc, getDocs, query, where, type DocumentData } from "firebase/firestore"
import type { Ref } from "vue"

//get all projects collection
async function fetchAllProjects({projects,isLoading}:{projects:Ref<DocumentData[]>,isLoading:Ref<boolean>}){
    try{
        const querySnapshot = await getDocs(projectsCollectionRef);
        projects.value = querySnapshot.docs.map(doc=>{
        return {id:doc.id,path:doc.ref.path,...doc.data()}
    }
    )}catch(error){
        console.log(error)
    }finally{
        isLoading.value=false
    }

}

//get single project document by id
async function fetchProjectById({project,id}:{project:Ref<DocumentData>,id:string}){
    try{
        const projectDocRef = doc(db,'projects',id)
        const docSnap = await getDoc(projectDocRef)
        if(docSnap.exists()){
        project.value={id:docSnap.id,path:docSnap.ref.path,...docSnap.data()}
    }
    }catch(error){
        console.log(error)
    }

}

//fetch all tasks (collection group)
async function fetchTasks({tasks}:{tasks:Ref<DocumentData[]>}){
    try{
        const querySnapshot = await getDocs(tasksCollectionRef)
        tasks.value = querySnapshot.docs.map(doc=>{
            return {id:doc.id,path:doc.ref.path,...doc.data()}
        })
    }catch(error){
        console.log(error)
    }
    
}
//fetch tasks collection by project id
async function fetchTasksByProjectId({projectId,tasksById}:{projectId:string,tasksById:Ref<DocumentData[]>}) {
    const projectTasksRef = collection(db,'projects',projectId,'tasks')
    try{
        const querySnapshot = await getDocs(projectTasksRef);
        tasksById.value = querySnapshot.docs.map(doc=>{
            return {id:doc.id,path:doc.ref.path,...doc.data()}
        })

    }catch(error){
        console.log(error)
    }
    
    
}

//query tasks by date
async function fetchAllTasksByDate({tasks,date,isLoading}:{tasks:Ref<DocumentData[]>,date:string,isLoading?:Ref<boolean>}) {
    const q = query(tasksCollectionRef,where("taskDate","==",date))
    try{
        const querySnapshot = await getDocs(q)
        tasks.value = querySnapshot.docs.map(doc=>{
            return {id:doc.id,path:doc.ref.path,...doc.data()}
        })
    }catch(error){
        console.log(error)
    }finally{
        if(isLoading){
            isLoading.value=false
        }
    }
}





export {
    fetchAllProjects,
    fetchProjectById,
    fetchAllTasksByDate,
    fetchTasksByProjectId,
    fetchTasks,
}