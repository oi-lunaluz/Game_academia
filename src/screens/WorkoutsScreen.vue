<script setup>
import { inject, ref } from 'vue'
import AppIcon from '../AppIcon.vue'
import WeeklyWorkoutCards from './WeeklyWorkoutCards.vue'
import RoutineScreen from './RoutineScreen.vue'

const {
  state, openCreateModal, openWorkout, openCardioModal,
  weeklyCardio, cardioTotalMinutes, cardioSessions
}=inject('pegaPesoApp')
const showFichas=ref(false)
const showSettings=ref(false)
const showHistory=ref(false)
</script>

<template>
  <div class="training-hub">
    <div class="training-hub-intro">
      <div>
        <span class="eyebrow">SEU CANTINHO DE TREINO</span>
        <h2>Meus treinos</h2>
        <p>Treine, marque o que fez e organize tudo aqui, sem trocar de aba.</p>
      </div>
    </div>

    <WeeklyWorkoutCards/>

    <button type="button" class="brazil-primary training-create" @click="openCreateModal">
      <AppIcon name="plus" :size="18"/> Criar novo treino
    </button>

    <section class="training-simple-card">
      <div class="training-simple-heading">
        <AppIcon name="timer" :size="21"/>
        <div><strong>Cardio</strong><small>{{weeklyCardio}} de {{state.cardioGoal||0}} min nesta semana</small></div>
      </div>
      <button class="training-cardio-button" type="button" @click="openCardioModal">Iniciar cardio</button>
    </section>

    <section class="training-disclosure">
      <button class="training-disclosure-toggle" type="button" :aria-expanded="showFichas" @click="showFichas=!showFichas">
        <AppIcon name="dumbbell" :size="19"/>
        <span>Editar minhas fichas <small>{{state.workouts.length}} cadastradas</small></span>
        <AppIcon name="chevron" :size="18"/>
      </button>
      <div v-if="showFichas" class="training-disclosure-content">
        <p>Abra uma ficha para mudar o nome, os exercícios ou iniciar o treino.</p>
        <div class="brazil-list">
          <button v-for="(w,i) in state.workouts" :key="w.name" type="button" class="brazil-list-row" @click="openWorkout(w.name)">
            <span class="row-icon" :class="i%2?'purple-icon':'pink-icon'"><AppIcon name="dumbbell" :size="17"/></span>
            <span class="row-info"><strong>{{w.name}}</strong><small>{{w.exercises.length}} exercícios</small></span>
            <span class="row-arrow">›</span>
          </button>
        </div>
        <button type="button" class="training-secondary-action" @click="openCreateModal">+ Adicionar ficha</button>
      </div>
    </section>

    <section class="training-disclosure">
      <button type="button" class="training-disclosure-toggle" :aria-expanded="showSettings" @click="showSettings=!showSettings">
        <AppIcon name="calendar" :size="19"/>
        <span>Organizar minha rotina <small>Dias, ordem e cardio</small></span>
        <AppIcon name="chevron" :size="18"/>
      </button>
      <div v-if="showSettings" class="training-disclosure-content">
        <p>Essas opções são para quando você quiser mudar o planejamento.</p>
        <RoutineScreen/>
      </div>
    </section>

    <section class="training-disclosure">
      <button type="button" class="training-disclosure-toggle" :aria-expanded="showHistory" @click="showHistory=!showHistory">
        <AppIcon name="check" :size="19"/>
        <span>Histórico de treinos <small>{{state.history.length}} registros</small></span>
        <AppIcon name="chevron" :size="18"/>
      </button>
      <div v-if="showHistory" class="training-disclosure-content">
        <p>Suas sessões concluídas de musculação e cardio.</p>
        <div v-if="!state.history.length" class="brazil-empty">Quando finalizar um treino, ele aparecerá aqui.</div>
        <div v-else class="brazil-list">
          <div v-for="(h,i) in [...state.history].reverse()" :key="i" class="brazil-list-row">
            <span class="row-icon mint-icon"><AppIcon name="check" :size="17"/></span>
            <span class="row-info"><strong>{{h.kind==='cardio'?(h.modality||'Cardio'):h.name}}</strong><small>{{h.date}}</small></span>
            <span class="row-value">{{h.quick?'✓':Math.round(h.seconds/60)+' min'}}</span>
          </div>
        </div>
        <p class="training-history-total">Cardio registrado: {{cardioTotalMinutes}} min · {{cardioSessions.length}} sessões.</p>
      </div>
    </section>
  </div>
</template>
