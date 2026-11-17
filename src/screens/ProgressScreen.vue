<script setup>
import { computed, inject, ref } from 'vue'
import AppIcon from '../AppIcon.vue'
import PixelRewardShelf from './PixelRewardShelf.vue'

const {
  view,
  selectedStat, selectedWorkoutStat, workoutStatNames,
  statsSessions, allExercises, bestExercise, maxLoad,
  totalVolume, completedSessions, onWorkoutStatChange,
  chartWeeks, chartMax, gamification
}=inject('pegaPesoApp')

const tab=ref('overview')
const historyOpen=ref(false)
const seriesOpen=ref(false)
const hasVolume=computed(()=>chartWeeks.value.some(week=>week.value>0))
const recentSessions=computed(()=>[...statsSessions.value].reverse().slice(0,8))
const latestSeries=computed(()=>[...bestExercise.value].reverse().slice(0,8))
const totalWorkouts=computed(()=>statsSessions.value.filter(h=>h.kind==='forca').length)
const totalCardio=computed(()=>statsSessions.value.filter(h=>h.kind==='cardio').length)
const bestByExercise=computed(()=>{
  const result=new Map()
  for(const set of bestExercise.value){
    if(!result.has(set.name)||result.get(set.name).kg<set.kg)
      result.set(set.name,{name:set.name,kg:set.kg,reps:set.reps,date:set.date})
  }
  return [...result.values()].sort((a,b)=>b.kg-a.kg).slice(0,4)
})
const allTimeLoadLabel=computed(()=>maxLoad.value>0?`${maxLoad.value} kg`:'—')
function openHistory(){tab.value='overview';historyOpen.value=!historyOpen}
</script>

<template>
  <div class="evolution-screen">
    <div class="evolution-intro">
      <div>
        <span class="evolution-eyebrow">DIÁRIO DA AVENTUREIRA</span>
        <h2>Sua evolução ✦</h2>
        <p>Veja o que você conquistou, no seu ritmo.</p>
      </div>
      <img src="/pixel-hero-girl.svg" alt="A aventureira em pixel art" class="evolution-intro-girl"/>
    </div>

    <div class="evolution-segments" role="group" aria-label="Seções da evolução">
      <button type="button" :class="{active:tab==='overview'}" :aria-pressed="tab==='overview'"
        @click="tab='overview'">
        <AppIcon name="chart" :size="16"/> Meu progresso
      </button>
      <button type="button" :class="{active:tab==='rewards'}" :aria-pressed="tab==='rewards'"
        @click="tab='rewards'">
        <AppIcon name="medal" :size="16"/> Medalhas
        <span v-if="gamification.unlocked.length" class="evolution-count">{{gamification.unlocked.length}}</span>
      </button>
    </div>

    <template v-if="tab==='overview'">
      <div class="evolution-filter">
        <label for="evolution-workout">Acompanhar</label>
        <select id="evolution-workout" v-model="selectedWorkoutStat" @change="onWorkoutStatChange">
          <option value="all">Todos os treinos</option>
          <option v-for="name in workoutStatNames" :key="name" :value="name">{{name}}</option>
        </select>
      </div>

      <section class="evolution-overview" aria-label="Resumo dos treinos">
        <div class="evolution-main-stat">
          <span><AppIcon name="dumbbell" :size="17"/> TREINOS DE FORÇA</span>
          <strong>{{totalWorkouts}}</strong>
          <small>sessões concluídas {{selectedWorkoutStat==='all'?'no total':'nesta ficha'}}</small>
          <span class="evolution-main-foot">Cada treino feito conta na jornada.</span>
        </div>
        <div class="evolution-side-stats">
          <div>
            <span><AppIcon name="trophy" :size="16"/> MAIOR CARGA</span>
            <strong>{{allTimeLoadLabel}}</strong>
            <small>em uma série registrada</small>
          </div>
          <div>
            <span><AppIcon name="activity" :size="16"/> CARDIO</span>
            <strong>{{totalCardio}}</strong>
            <small>{{selectedWorkoutStat==='all'?'sessões registradas':'sessões deste filtro'}}</small>
          </div>
        </div>
      </section>

      <section class="evolution-chart-card">
        <div class="evolution-section-top">
          <div><span>SEU RITMO</span><h3>Volume nas últimas 4 semanas</h3></div>
          <AppIcon name="bars" :size="22"/>
        </div>
        <p class="evolution-section-desc">Soma das cargas × repetições que você registrou em cada semana.</p>
        <div v-if="hasVolume" class="evolution-chart" role="img" aria-label="Gráfico de volume semanal em quilogramas">
          <div v-for="(week,i) in chartWeeks" :key="week.label" class="evolution-chart-col">
            <span>{{week.value?week.value.toLocaleString('pt-BR'):'0'}}</span>
            <div class="evolution-chart-track">
              <div :style="{height:week.value?Math.max(5,week.value/chartMax*100)+'%':'0%'}"
                :class="{current:i===chartWeeks.length-1}"></div>
            </div>
            <strong>{{week.label}}</strong>
          </div>
        </div>
        <div v-else class="evolution-empty-graph">
          <AppIcon name="chart" :size="26"/>
          <strong>Seu gráfico começa com os registros</strong>
          <p>Finalize um treino com séries e cargas para ver a evolução aqui.</p>
        </div>
        <div class="evolution-chart-summary">
          <span>Volume total registrado</span>
          <strong>{{totalVolume.toLocaleString('pt-BR')}} kg</strong>
        </div>
        <small class="evolution-caption">O volume é uma medida de atividade registrada, não uma pontuação de força ou resultado físico.</small>
      </section>

      <section class="evolution-records">
        <div class="evolution-section-top">
          <div><span>CONQUISTAS REAIS</span><h3>Meus recordes</h3></div>
          <AppIcon name="trophy" :size="22"/>
        </div>
        <label for="evolution-exercise">Escolher exercício</label>
        <select id="evolution-exercise" v-model="selectedStat">
          <option value="all">Todos os exercícios</option>
          <option v-for="name in allExercises" :key="name" :value="name">{{name}}</option>
        </select>
        <div v-if="bestByExercise.length" class="evolution-pr-list">
          <div v-for="(pr,index) in bestByExercise" :key="pr.name" class="evolution-pr-row">
            <span class="evolution-pr-medal">{{index+1}}</span>
            <div><strong>{{pr.name}}</strong><small>{{pr.date}} · {{pr.reps}} repetições</small></div>
            <b>{{pr.kg}} kg</b>
          </div>
        </div>
        <div v-else class="evolution-empty-small">
          Ainda não existem cargas registradas para este filtro.
        </div>
        <button v-if="bestExercise.length" class="evolution-soft-toggle" type="button"
          :aria-expanded="seriesOpen" @click="seriesOpen=!seriesOpen">
          {{seriesOpen?'Ocultar registros de séries':'Ver séries registradas'}}
          <AppIcon name="chevron" :size="16"/>
        </button>
        <div v-if="seriesOpen" class="evolution-series-list">
          <div v-for="(s,i) in latestSeries" :key="i">
            <div><strong>{{s.name}}</strong><small>{{s.date}}</small></div>
            <span>{{s.kg}} kg × {{s.reps}}</span>
          </div>
        </div>
      </section>

      <section class="evolution-history">
        <button class="evolution-history-toggle" type="button" :aria-expanded="historyOpen" @click="openHistory">
          <span class="evolution-history-icon"><AppIcon name="calendarCheck" :size="19"/></span>
          <span class="evolution-history-title">
            <strong>Histórico de atividades</strong>
            <small>{{completedSessions}} {{completedSessions===1?'registro':'registros'}} neste filtro</small>
          </span>
          <AppIcon name="chevron" :size="18"/>
        </button>
        <div v-if="historyOpen" class="evolution-history-content">
          <p v-if="!recentSessions.length">Suas próximas sessões aparecerão aqui.</p>
          <div v-for="(session,i) in recentSessions" :key="i" class="evolution-history-row">
            <span class="evolution-history-dot"><AppIcon :name="session.kind==='cardio'?'timer':'check'" :size="15"/></span>
            <div><strong>{{session.kind==='cardio'?(session.modality||'Cardio'):session.name}}</strong><small>{{session.date}}</small></div>
            <span>{{session.quick?'✓':Math.round((Number(session.seconds)||0)/60)+' min'}}</span>
          </div>
          <small v-if="statsSessions.length>8">Mostrando as 8 sessões mais recentes.</small>
        </div>
      </section>
      <button class="evolution-go-train" type="button" @click="view='list'">
        <AppIcon name="dumbbell" :size="17"/> Ir para meus treinos
      </button>
    </template>

    <template v-else>
      <section class="evolution-rewards-intro">
        <img src="/pixel-caramary.svg" alt="CaraMary em pixel art"/>
        <div><strong>Seu mural de conquistas</strong><p>A CaraMary comemora cada conquista com você!</p></div>
      </section>
      <PixelRewardShelf/>
      <button class="evolution-go-train" type="button" @click="tab='overview'">
        <AppIcon name="chart" :size="17"/> Voltar ao meu progresso
      </button>
    </template>
  </div>
</template>
