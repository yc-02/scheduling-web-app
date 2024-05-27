import { db } from "@/firebase"
import router from "@/router"
import { deleteDoc, doc } from "firebase/firestore"

const handleDeleteDoc = async ({path}:{path: string}) => {
    console.log(path,'waht is path')
  await deleteDoc(doc(db, path))
    .then(() => {
      console.log('deleted')
    })
    .then(() => {
      router.go(0)
    })
    .catch((err) => console.log(err))
}

export{
    handleDeleteDoc
}