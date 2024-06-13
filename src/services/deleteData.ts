import { db } from "@/firebase"
import router from "@/router"
import type { Task } from "env"
import { deleteDoc, doc } from "firebase/firestore"

const handleDeleteDoc = async ({path}:{path: string}) => {
  await deleteDoc(doc(db, path))
    .then(() => {
      console.log('deleted')
    })
    .catch((err) => console.log(err))
}

const handleDeleteProject = async({projectPath,tasks}:{projectPath:string,tasks:Task[]})=>{
  await deleteDoc(doc(db, projectPath))
  .then(() => {
    console.log('deleted')
  })
  .then(() => {
    router.push('/')
  })
  .catch((err) => console.log(err))
  handleDeleteSubCollection(tasks)

}
const handleDeleteSubCollection=async(tasks:Task[])=>{
  for(let i=0; i<tasks.length;i++){
    await deleteDoc(doc(db,tasks[i].path))
    .then(()=>{
      console.log(tasks[i].path,'deleted')
    })
    .catch((err)=>{
      console.log(err)
    })
  }
}



export{
    handleDeleteDoc,
    handleDeleteProject,
    handleDeleteSubCollection

}