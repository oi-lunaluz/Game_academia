<script setup>
import { computed } from 'vue'
import AppIcon from '../AppIcon.vue'
const props=defineProps({reward:{type:Object,required:true},preview:{type:Boolean,default:false}})
defineEmits(['close'])
const subtitle=computed(()=>{
 const r=props.reward
 if(r.category==='load')
   return r.exercise+' · '+(r.id?.startsWith('double_')?'Dobrou a carga inicial':r.threshold+' kg alcançados')
 if(r.category==='duration')return r.threshold+' horas de treino registradas'
 if(r.category==='time')return r.threshold+' dias de treino ao longo da jornada'
 return r.threshold+' dias de ofensiva'
})
const iconName=computed(()=>props.reward.category==='load'?'dumbbell':props.reward.category==='duration'?'timer':props.reward.category==='time'?'calendarCheck':'flame')
</script>
<template>
 <div class="pixel-reward-backdrop" @click.self="$emit('close')">
  <section class="pixel-reward-popup" :class="'journey-popup-'+(reward.tier||'Rosa').toLowerCase()"
    role="dialog" aria-modal="true" aria-labelledby="reward-title">
    <div class="pixel-reward-popup-label">{{preview?'PRÉVIA DA INSÍGNIA':'✨ PARABÉNS! NOVA CONQUISTA ✨'}}</div>
    <div class="pixel-reward-popup-characters">
      <img src="/pixel-hero-girl.svg" alt="Aventureira de cabelo castanho"/>
      <div class="pixel-popup-medal" :class="'journey-tier-'+(reward.tier||'Rosa').toLowerCase()">
        <AppIcon :name="iconName" :size="40"/>
      </div>
      <img src="/pixel-caramary.svg" alt="CaraMary celebrando com a aventureira"/>
    </div>
    <h2 id="reward-title">{{reward.title}}</h2>
    <strong>{{reward.tier}} · {{subtitle}}</strong>
    <p>{{reward.description}}</p>
    <p class="pixel-popup-quote">A CaraMary tá orgulhosa de você!</p>
    <button type="button" @click="$emit('close')">Continuar aventura</button>
  </section>
 </div>
</template>