<script setup>
import {inject,computed} from 'vue'
import AppIcon from '../AppIcon.vue'
const props=defineProps({compact:{type:Boolean,default:false}})
const {gamification,view,demoMode,previewReward}=inject('pegaPesoApp')
const g=computed(()=>gamification.value)
const earned=computed(()=>g.value?.unlocked||[])
const streak=computed(()=>g.value?.streakRewards||[])
const time=computed(()=>g.value?.timeRewards||[])
const loads=computed(()=>g.value?.loadRewards||[])
const next=computed(()=>g.value?.next||null)
const loadCount=computed(()=>g.value?.exerciseProgress?.length||0)
</script>
<template>
  <section class="pixel-rewards journey-rewards" aria-label="Suas ofensivas, medalhas e insígnias">
    <div class="pixel-rewards-head">
      <div><span>JORNADA DA AVENTUREIRA</span><h3>Medalhas & insígnias</h3></div>
      <div class="pixel-streak-chip"><AppIcon name="flame" :size="19"/><strong>Dia {{g.day}}</strong><small>ofensiva</small></div>
    </div>

    <div class="journey-streak-status">
      <div class="journey-streak-bubble"><AppIcon name="flame" :size="26"/><strong>{{g.current||0}}</strong></div>
      <div>
        <strong>{{g.expired?'Sua ofensiva recomeçou!':g.current?'Sua chama está acesa!':'Sua primeira chama começa hoje'}}</strong>
        <p>{{g.expired?'Dois dias completos sem treinar. Seu próximo registro será o dia 1, sem perder seus treinos e suas medalhas.':g.missedDays===1?'Você teve um dia de pausa. Registre um treino hoje para manter sua ofensiva.':'Registre musculação ou cardio para avançar. Um dia de pausa não quebra sua sequência.'}}</p>
      </div>
    </div>
    <div class="pixel-reward-stats journey-stats">
      <div><strong>{{g.best}}</strong><small>Maior ofensiva</small></div>
      <div><strong>{{g.total}}</strong><small>Dias registrados</small></div>
      <div><strong>{{earned.length}}</strong><small>Conquistas</small></div>
    </div>

    <section v-if="next" class="pixel-next-reward journey-next">
      <span>PRÓXIMO MARCO DE OFENSIVA</span>
      <strong>{{next.title}}</strong>
      <small>{{next.threshold}} dias com treinos na sequência · {{Math.max(0,next.threshold-g.current)}} para conquistar na ofensiva atual</small>
      <div class="pixel-reward-track" role="progressbar" :aria-valuenow="Math.min(g.current,next.threshold)" :aria-valuemax="next.threshold" aria-valuemin="0" :aria-label="'Progresso para '+next.title">
        <i :style="{width:Math.min(100,g.current/next.threshold*100)+'%'}"></i>
      </div>
    </section>
    <p v-else class="pixel-rewards-complete">Você já conquistou todos os marcos de ofensiva disponíveis!</p>

    <div class="journey-award-group">
      <div class="journey-award-heading"><AppIcon name="flame" :size="18"/><div><strong>Ofensiva</strong><small>Por manter sua sequência de treinos</small></div></div>
      <div v-if="streak.length" class="pixel-medal-grid">
        <button v-for="r in (compact?streak.slice(-3):streak)" :key="r.id" type="button"
          class="pixel-medal-card" :class="'journey-tier-'+r.tier.toLowerCase()" @click="previewReward(r)">
          <span class="pixel-medal-art"><AppIcon name="flame" :size="25"/></span>
          <strong>{{r.title}}</strong><small>{{r.threshold}} dias · {{r.tier}}</small>
        </button>
      </div>
      <p v-else class="journey-empty">A primeira insígnia chega após 3 dias de treino em sequência.</p>
    </div>

    <div class="journey-award-group">
      <div class="journey-award-heading"><AppIcon name="calendarCheck" :size="18"/><div><strong>Tempo de jornada</strong><small>{{Math.floor(g.hours||0)}} h cronometradas · {{g.total}} dias registrados</small></div></div>
      <div v-if="time.length" class="pixel-medal-grid">
        <button v-for="r in (compact?time.slice(-3):time)" :key="r.id" type="button"
          class="pixel-medal-card" :class="'journey-tier-'+r.tier.toLowerCase()" @click="previewReward(r)">
          <span class="pixel-medal-art"><AppIcon :name="r.category==='duration'?'timer':'calendarCheck'" :size="25"/></span>
          <strong>{{r.title}}</strong><small>{{r.threshold}} {{r.category==='duration'?'horas':'dias'}} · {{r.tier}}</small>
        </button>
      </div>
      <p v-else class="journey-empty">Registre seus primeiros dias ou sua primeira hora de treino cronometrado para ganhar uma medalha.</p>
    </div>

    <div class="journey-award-group">
      <div class="journey-award-heading"><AppIcon name="dumbbell" :size="18"/><div><strong>Evolução de carga</strong><small>Uma insígnia para cada conquista em cada exercício</small></div></div>
      <div v-if="loads.length" class="pixel-medal-grid">
        <button v-for="r in (compact?loads.slice(-3):loads)" :key="r.id" type="button"
          class="pixel-medal-card journey-load-card" :class="'journey-tier-'+r.tier.toLowerCase()" @click="previewReward(r)">
          <span class="pixel-medal-art"><AppIcon name="trophy" :size="25"/></span>
          <strong>{{r.title}}</strong><small>{{r.exercise}}</small>
          <small>{{r.id.startsWith('double_')?'2× a carga inicial':r.threshold+' kg'}} · {{r.tier}}</small>
        </button>
      </div>
      <p v-else class="journey-empty">Registre séries com peso e repetições para começar a desbloquear insígnias de força.</p>
      <p v-if="!compact" class="journey-weight-guide">Rosa: 10 kg ou dobro da carga inicial · Bronze: 25 kg · Prata: 50 kg · Ouro: 100 kg, sempre por exercício.</p>
      <p v-if="loadCount&&!compact" class="journey-weight-guide">{{loadCount}} {{loadCount===1?'exercício acompanhado':'exercícios acompanhados'}} com cargas registradas.</p>
    </div>

    <p class="pixel-reward-rule">A ofensiva conta um dia por data com treino ou check registrado; um dia de pausa é permitido. Após dois dias completos sem registro, ela recomeça no dia 1. As fases, fichas e medalhas permanecem. Medalhas de horas usam duração real, e as de peso usam séries detalhadas.</p>
    <button v-if="compact" type="button" class="pixel-reward-more" @click="view='stats'">Ver todas as medalhas</button>
    <div v-if="demoMode" class="pixel-reward-demo">
      <small>TESTAR VISUAL DAS MEDALHAS</small>
      <div><button v-for="r in [3,7,15]" :key="r" type="button" @click="previewReward(r)">Prévia {{r}}</button></div>
    </div>
  </section>
</template>