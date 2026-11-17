<script setup>
import { computed, inject, ref, watch, nextTick } from 'vue'
import AppIcon from '../AppIcon.vue'
import PixelQuestMap from './PixelQuestMap.vue'
import { questPhase, questChapter, questWindow, questMission } from '../lib/pixelQuest.js'
import { strengthNames } from '../lib/weeklyCards.js'
import { CYCLE_PHASES, phaseForCycleDate } from '../lib/cycleTracking.js'
import { dateKey } from '../lib/planner.js'

const {
  state,view,profile,demoMode,openWorkout,openCreateModal,openCardioModal,
  start,weeklyStrengthCards,toggleStrengthCard,quickFeedback,
  weeklyCardio,cycle,cycleDay,cycleDayInfo,gamification
}=inject('pegaPesoApp')

const workouts=computed(()=>strengthNames(state.value))
const completedSessions=computed(()=>(state.value.history||[]).filter(h=>h.kind==='forca').length)
const simulatedWins=ref(0)
const currentStage=computed(()=>questPhase(completedSessions.value,simulatedWins.value))
const chapter=ref(0)
const missionNumber=ref(null)
const closeButton=ref(null)
// Cada plataforma da ilustração é um salto/fase, de baixo para cima.
// Cinco plataformas reais da imagem, da entrada inferior até o castelo.
const positions=[
  {x:15,y:87},{x:53,y:87},{x:61,y:68},
  {x:86,y:34},{x:67,y:16}
]
const stages=computed(()=>questWindow(chapter.value,workouts.value,
  completedSessions.value,simulatedWins.value).map((entry,index)=>({...entry,...positions[index]})))
const mission=computed(()=>missionNumber.value===null?null:
  questMission(workouts.value,state.value.workouts,missionNumber.value,currentStage.value))
const weeklyCard=computed(()=>weeklyStrengthCards.value.find(w=>w.name===mission.value?.name))
const canMark=computed(()=>mission.value?.current&&!weeklyCard.value?.completed)
const cardioMinutes=computed(()=>{
  const entry=state.value.workouts.find(w=>w.name===mission.value?.name)
  return entry?.cardioMinutes??state.value.cardioSessionTarget??0
})
// Corazões representam apenas o progresso da agenda do ciclo, nunca saúde ou energia.
const cycleHearts=computed(()=>{
  const length=Math.max(1,Number(cycle.value.length)||28)
  if(!cycle.value.enabled||!cycleDay.value)return 0
  return Math.max(1,Math.min(4,Math.ceil(cycleDay.value/length*4)))
})
const cycleStatus=computed(()=>{
  if(!cycleDayInfo.value.last||!cycleDay.value)return 'Registrar ciclo'
  return 'Dia '+cycleDay.value+' do ciclo'
})
const phaseModal=ref(false)
const currentCyclePhase=computed(()=>{
  void cycleDayInfo.value
  const today=dateKey(new Date())
  const phase=phaseForCycleDate(cycle.value,today,today)
  return phase?CYCLE_PHASES[phase]:null
})
watch(currentStage,stage=>{chapter.value=questChapter(stage);missionNumber.value=null},{immediate:true})
watch(completedSessions,(now,before)=>{if(now!==before)simulatedWins.value=0})
function openMission(number){
  missionNumber.value=number
  nextTick(()=>closeButton.value?.focus())
}
function closeMission(){missionNumber.value=null}
function changeArea(delta){chapter.value=Math.max(0,chapter.value+delta);closeMission()}
function goToTraining(){
  if(!mission.value?.exists){closeMission();view.value='list';openCreateModal();return}
  const name=mission.value.name
  closeMission()
  openWorkout(name)
  start('forca')
}
function editMission(){
  if(!mission.value?.exists){closeMission();view.value='list';openCreateModal();return}
  const name=mission.value.name
  closeMission()
  openWorkout(name)
}
function startCardio(){closeMission();openCardioModal()}
function markMission(){
  if(!canMark.value)return
  toggleStrengthCard(mission.value.name)
  if(quickFeedback.value.startsWith('Ficha marcada'))closeMission()
}
function simulate(){if(!demoMode||!workouts.value.length)return;simulatedWins.value++}
</script>

<template>
  <section class="quest-screen" aria-label="Aventura de treinos">
    <PixelQuestMap :stages="stages" :chapter="chapter" :selected-number="missionNumber??currentStage"
      @select="openMission">
      <template #hud>
        <div class="quest-hud" aria-label="Indicadores da aventureira">
          <div class="quest-hud-top">
            <div class="quest-hud-level">
              <span class="quest-hud-eyebrow">AVENTUREIRA · {{profile.nickname||'Jogadora'}}</span>
              <strong>FASE {{currentStage}}</strong>
              <span>Área {{chapter+1}} · Missões {{chapter*5+1}}–{{chapter*5+5}}</span>
            </div>
            <div class="quest-hud-cycle" aria-label="Resumo do ciclo menstrual">
              <button type="button" class="quest-hud-life" @click="view='cycle'" :aria-label="'Abrir calendário menstrual. '+cycleStatus">
                <span class="quest-hearts" aria-hidden="true"><span v-for="n in 4" :key="n" :class="{filled:n<=cycleHearts}">♥</span></span>
                <strong>{{cycleStatus}}</strong>
                <small>{{currentCyclePhase?currentCyclePhase.title+' · estimada':'Toque para registrar'}}</small>
              </button>
              <button v-if="currentCyclePhase" type="button" class="quest-cycle-help" :aria-label="'O que posso sentir na '+currentCyclePhase.title+'?'" title="Entenda esta fase" @click="phaseModal=true">
                <AppIcon name="help" :size="15"/>
              </button>
            </div>
          </div>
          <div class="quest-hud-shortcuts">
            <button type="button" @click="view='stats'"><AppIcon name="flame" :size="15"/> {{gamification.current?'🔥 Dia '+gamification.day:'🔥 Dia 1 · recomeçar'}}</button>
            <button type="button" @click="startCardio"><AppIcon name="timer" :size="15"/> {{weeklyCardio}}/{{state.cardioGoal||0}} min cardio</button>
          </div>
        </div>
      </template>
      <template #navigation>
        <div class="quest-map-navigation" aria-label="Navegar entre áreas">
          <button type="button" :disabled="chapter===0" aria-label="Área anterior" @click="changeArea(-1)">◀</button>
          <span>ÁREA {{chapter+1}} · 5 FASES</span>
          <button type="button" aria-label="Próxima área" @click="changeArea(1)">▶</button>
        </div>
        <p class="quest-map-hint">Deslize para explorar • toque na fase para abrir</p>
      </template>
    </PixelQuestMap>

    <div v-if="phaseModal&&currentCyclePhase" class="quest-modal-backdrop quest-cycle-backdrop" @click.self="phaseModal=false">
      <section class="quest-cycle-dialog" role="dialog" aria-modal="true" aria-labelledby="quest-cycle-title">
        <div class="quest-cycle-dialog-head">
          <span>🌷 SEU CICLO E SEUS TREINOS</span>
          <button type="button" aria-label="Fechar explicação" @click="phaseModal=false"><AppIcon name="close" :size="18"/></button>
        </div>
        <h2 id="quest-cycle-title">{{currentCyclePhase.title}}</h2>
        <p class="quest-cycle-day-label">{{cycleStatus}} · fase estimada</p>
        <p>{{currentCyclePhase.description}}</p>
        <p class="quest-cycle-disclaimer">Cada corpo responde de forma diferente. O ciclo não determina sua força nem suas cargas automaticamente, e a fase mostrada é apenas uma estimativa.</p>
        <button class="quest-cycle-understand" type="button" @click="phaseModal=false">Entendi!</button>
        <button class="quest-cycle-open" type="button" @click="phaseModal=false;view='cycle'">Abrir calendário do ciclo</button>
      </section>
    </div>

    <div v-if="mission" class="quest-modal-backdrop" @click.self="closeMission">
      <section class="quest-mission-dialog" role="dialog" aria-modal="true" :aria-label="'Missão da fase '+mission.number">
        <div class="quest-dialog-head">
          <div><span>MISSÃO {{mission.number}} · {{mission.current?'FASE ATUAL':mission.completed?'CONCLUÍDA':'PRÓXIMA AVENTURA'}}</span><h2>{{mission.name}}</h2></div>
          <button ref="closeButton" type="button" class="quest-dialog-close" aria-label="Fechar missão" @click="closeMission">✕</button>
        </div>
        <div class="quest-dialog-party">
          <img src="/pixel-hero-girl.svg" alt="Aventureira"/>
          <div><strong>{{mission.exerciseCount}} {{mission.exerciseCount===1?'exercício':'exercícios'}}</strong><small>na sua ficha</small></div>
          <img src="/pixel-caramary.svg" alt="CaraMary"/>
        </div>
        <div v-if="mission.exercises.length" class="quest-dialog-exercises">
          <strong>DESAFIOS DESTA MISSÃO</strong>
          <ol><li v-for="(exercise,i) in mission.exercises" :key="i">{{exercise}}</li></ol>
        </div>
        <div v-else class="quest-dialog-empty">Esta ficha ainda não tem exercícios. Você pode adicioná-los em Editar ficha.</div>
        <div class="quest-dialog-cardio">
          <AppIcon name="timer" :size="18"/>
          <span>Cardio opcional · {{cardioMinutes}} min de referência</span>
        </div>
        <div class="quest-dialog-actions">
          <button type="button" class="quest-start-strength" @click="goToTraining">
            <AppIcon name="dumbbell" :size="18"/> {{mission.exists?'Iniciar musculação':'Criar minha ficha'}}
          </button>
          <button type="button" class="quest-start-cardio" @click="startCardio">
            <AppIcon name="timer" :size="18"/> Iniciar cardio
          </button>
        </div>
        <div class="quest-dialog-footer">
          <button type="button" @click="editMission"><AppIcon name="pencil" :size="14"/> Ver / editar ficha</button>
          <button v-if="canMark" type="button" @click="markMission"><AppIcon name="check" :size="14"/> Já fiz este treino</button>
          <span v-else-if="weeklyCard?.completed&&mission.current">Concluído nesta semana</span>
        </div>
        <p v-if="quickFeedback" class="quest-dialog-feedback" role="status">{{quickFeedback}}</p>
        <p v-if="demoMode" class="quest-dialog-demo">Modo de teste: não altera seus dados reais.</p>
      </section>
    </div>

    <button v-if="demoMode" class="quest-demo-advance" type="button" @click="simulate" aria-label="Simular avanço de fase">+ Avançar</button>
  </section>
</template>
