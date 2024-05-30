import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
      meta:{title:'home'}
    },
    {
      path: '/about',
      name: 'about',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('../views/AboutView.vue')
    },
    {
      path:'/listView',
      name:'listView',
      meta:{title:'List View'},
      component:()=>import('../views/ProjectsListView.vue')
    },
    {
      path:'/projects/:id',
      name:'project',
      meta:{title:'Project'},
      component:()=>import('@/views/ProjectDetailsView.vue')
    },
    {
      path:'/activities/:slug',
      name:'activities',
      meta:{title:'Activities'},
      component:()=>import('@/views/ActivitiesView.vue')
    }
  ]
})

router.beforeEach((to,from,next)=>{
  if(to.meta.title && typeof to.meta.title ==='string'){
    document.title = to.meta.title;
  }
  else{
    document.title ='Schedule'
  }
  next();
})
export default router
