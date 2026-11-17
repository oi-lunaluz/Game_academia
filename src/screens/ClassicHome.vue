<script setup>
import { inject } from 'vue'
import AppIcon from '../AppIcon.vue'
import WeeklyWorkoutCards from './WeeklyWorkoutCards.vue'
import { computed, ref } from 'vue'
import { CYCLE_PHASES, phaseForCycleDate } from '../lib/cycleTracking.js'
import { dateKey } from '../lib/planner.js'

const {
  state,
  scheduledDayNames,
  overdueWorkouts,
  weekPlan,
  selectedWeekDate,
  selectedWeekDay,
  selectedWeekPreview,
  predictedDayLabel,
  selectWeekDay,
  quickFeedback,
  toggleDayDone,
  canQuickCheck,
  view,
  rotation,
  rotationIndex,
  nextWorkoutName,
  nextWorkout,
  openCardioModal,
  start,
  cycle,
  cycleDay,
  cycleDayInfo,
  weeklyCardio,
  strengthThisMonth,
  personalRecords,
  homeGreeting,
  openToday,
} = inject('pegaPesoApp')
const phaseOpen=ref(false)
const phase=computed(()=>{
  void cycleDayInfo.value
  const today=dateKey(new Date())
  const id=phaseForCycleDate(cycle.value,today,today)
  return id?CYCLE_PHASES[id]:null
})
</script>

<template>
<div class="home-greeting">
 <div class="greeting-copy"><span class="eyebrow">BORA PRA CIMA!</span><h2>{{homeGreeting}},<br/><em>mulher!</em></h2><p>A CaraMary tá de olho na sua evolução!</p></div>
 <img class="home-dog" src="/caramelo-treino.svg" alt="Mary, a caramela apelidada CaraMary, de óculos e bandana rosa, sorrindo"/><span class="mary-label">Mary, a CaraMary</span>
</div>
<WeeklyWorkoutCards/>
<div class="home-metrics">
 <button class="home-metric mint" @click="view='stats'"><small>Treinos no mês</small><strong>{{strengthThisMonth}}</strong><span class="metric-caption">Você tá construindo!</span></button>
 <button class="home-metric peach" @click="view='stats'"><small>Exercícios registrados</small><strong>{{personalRecords}}</strong><span class="metric-caption">Sua evolução conta!</span></button>
</div>
<div class="home-bottom-grid week-home-tail">
 <div class="home-cycle home-cycle-summary">
   <span class="eyebrow">SEU CICLO</span>
   <strong>{{cycleDay?'Dia '+cycleDay:'Meu ciclo'}}</strong>
   <span>{{phase?phase.title+' · estimada':'Acompanhe como se sente'}}</span>
   <div class="home-cycle-actions">
     <button type="button" @click="view='cycle'">Ver ciclo</button>
     <button v-if="phase" type="button" aria-label="Entender a fase do ciclo" @click="phaseOpen=true"><AppIcon name="help" :size="17"/></button>
   </div>
 </div>
</div>
<div v-if="phaseOpen&&phase" class="cycle-phase-backdrop" @click.self="phaseOpen=false">
 <section class="cycle-phase-popup" role="dialog" aria-modal="true" aria-labelledby="classic-cycle-phase">
   <div class="cycle-phase-popup-top"><span class="cycle-phase-popup-dot"></span><span>SEU CICLO E TREINO</span><button aria-label="Fechar" @click="phaseOpen=false"><AppIcon name="close" :size="19"/></button></div>
   <h2 id="classic-cycle-phase">{{phase.title}}</h2>
   <p>{{phase.description}}</p>
   <p class="cycle-phase-popup-disclaimer">A fase é estimada. Os efeitos variam entre pessoas; ajuste seus treinos ao que sentir.</p>
   <button class="cycle-phase-popup-close" type="button" @click="phaseOpen=false">Entendi!</button>
 </section>
</div>
<div class="home-footer-note">O peso varia. A evolução continua.</div>
</template>
