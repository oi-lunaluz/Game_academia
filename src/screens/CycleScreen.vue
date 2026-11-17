<script setup>
import { computed, inject, ref } from 'vue'
import AppIcon from '../AppIcon.vue'
import { CYCLE_PHASES, phaseForCycleDate } from '../lib/cycleTracking.js'
const {
  cycle,cycleDay,cycleDayInfo,recordPeriodDay,
  moveCycleMonth,calendarMonthName,cycleCalendarDays,
  noteDate,noteEnergy,noteSymptoms,noteDifficulty,addNote,demoMode
}=inject('pegaPesoApp')
const phaseModal=ref(null)
const phaseOrder=['menstrual','follicular','ovulatory','luteal']
const currentPhase=computed(()=>phaseForCycleDate(cycle.value,new Date().toLocaleDateString('en-CA'),new Date().toLocaleDateString('en-CA')))
const currentPhaseInfo=computed(()=>currentPhase.value?CYCLE_PHASES[currentPhase.value]:null)
function showPhase(phase){if(CYCLE_PHASES[phase])phaseModal.value=CYCLE_PHASES[phase]}
function closePhase(){phaseModal.value=null}
const guideOpen=ref(false)
const notesOpen=ref(false)
const feedback=ref('')
const savedStarts=computed(()=>[...cycleDayInfo.value.starts].reverse().slice(0,4))
const lastStart=computed(()=>cycleDayInfo.value.last?
  new Date(cycleDayInfo.value.last+'T12:00:00').toLocaleDateString('pt-BR',{day:'2-digit',month:'short'}):'—')
const predictedStart=computed(()=>cycleDayInfo.value.next?
  new Date(cycleDayInfo.value.next+'T12:00:00').toLocaleDateString('pt-BR',{day:'2-digit',month:'short'}):'—')
function tapDay(day){
  if(day.future)return
  const removing=day.recorded
  if(!recordPeriodDay(day.date))return
  feedback.value=removing?'Registro retirado. Pode tocar de novo para corrigir.':
    'Início da menstruação registrado! Os próximos dias aparecem em rosa.'
}
function removeStart(day){
  recordPeriodDay(day)
  feedback.value='Registro retirado do calendário.'
}
const dateLabel=day=>new Date(day+'T12:00:00').toLocaleDateString('pt-BR',{day:'2-digit',month:'short',year:'numeric'})
function clampCycle(){
  cycle.length=Math.max(15,Math.min(60,Math.round(Number(cycle.length)||28)))
}
function clampPeriod(){
  cycle.period=Math.max(1,Math.min(15,Math.round(Number(cycle.period)||5)))
}
</script>

<template>
  <div class="cycle-simple">
    <div class="cycle-simple-head">
      <div>
        <span class="cycle-kicker">SEU CORPO, SEU RITMO</span>
        <h2>Meu ciclo <AppIcon name="flower" :size="22"/></h2>
        <p>Um toque no calendário para registrar sua menstruação.</p>
      </div>
      <img src="/pixel-caramary.svg" class="cycle-head-dog" alt="CaraMary em pixel art"/>
    </div>

    <section class="cycle-calendar" aria-label="Calendário menstrual clicável">
      <div class="cycle-month-bar">
        <button type="button" aria-label="Mês anterior" @click="moveCycleMonth(-1)">‹</button>
        <h3>{{calendarMonthName}}</h3>
        <button type="button" aria-label="Próximo mês" @click="moveCycleMonth(1)">›</button>
      </div>
      <div class="cycle-calendar-grid">
        <span v-for="(weekday,i) in ['D','S','T','Q','Q','S','S']" :key="'wd'+i" class="cycle-weekday">{{weekday}}</span>
        <button v-for="day in cycleCalendarDays" :key="day.date" type="button"
          class="cycle-day" :class="{
            'is-outside':day.outside,'is-today':day.today,
            'is-recorded':day.recorded,'is-start':day.recordedStart,
            'is-estimate':day.predicted, 'is-future':day.future,
            'phase-menstrual':day.phase==='menstrual',
            'phase-follicular':day.phase==='follicular',
            'phase-ovulatory':day.phase==='ovulatory',
            'phase-luteal':day.phase==='luteal',
            'phase-current':day.today&&!!day.phase
          }"
          :disabled="day.future"
          :aria-label="dateLabel(day.date)+(day.recorded?', menstruação registrada':day.predicted?', menstruação prevista':'')+(day.phase?', '+CYCLE_PHASES[day.phase].title.toLowerCase()+' estimada':'')+(day.future?', data futura':'')"
          :aria-pressed="day.recorded" @click="tapDay(day)">
          <span>{{day.number}}</span>
          <i v-if="day.recordedStart" aria-hidden="true"></i>
        </button>
      </div>
      <div class="cycle-calendar-key">
        <span><i class="cycle-key-recorded"></i> Menstruação registrada</span>
        <span><i class="cycle-key-predicted"></i> Menstruação prevista</span>
        <span><i class="cycle-key-today"></i> Hoje</span>
      </div>
      <div v-if="currentPhaseInfo" class="cycle-current-phase">
        <div class="cycle-current-phase-icon"><AppIcon name="leaf" :size="21"/></div>
        <div class="cycle-current-phase-text">
          <small>FASE ATUAL · ESTIMADA</small>
          <strong>{{currentPhaseInfo.title}}</strong>
        </div>
        <button type="button" class="cycle-phase-help" @click="showPhase(currentPhase)" :aria-label="'Entender '+currentPhaseInfo.title">
          <AppIcon name="help" :size="19"/>
        </button>
      </div>
      <div v-if="cycleDayInfo.last" class="cycle-phase-selector" aria-label="Explicações das fases do ciclo">
        <button v-for="id in phaseOrder" :key="id" type="button"
          class="cycle-phase-chip" :class="['phase-'+id,{'selected':currentPhase===id}]"
          @click="showPhase(id)"
          :aria-label="'Entender '+CYCLE_PHASES[id].title">
          <span class="cycle-phase-swatch"></span>
          <span>{{CYCLE_PHASES[id].title}}</span>
          <AppIcon name="help" :size="13"/>
        </button>
      </div>
      <p class="cycle-calendar-hint">Toque no <strong>primeiro dia</strong> em que a menstruação começou. A duração preenchida abaixo colore os dias seguintes. Para desfazer, toque novamente no dia rosa.</p>
      <p v-if="feedback" class="cycle-feedback" role="status">{{feedback}}</p>
    </section>

    <section class="cycle-overview" aria-label="Acompanhamento do ciclo">
      <div class="cycle-overview-item">
        <small>Último início</small>
        <strong>{{lastStart}}</strong>
        <span>marcado no calendário</span>
      </div>
      <div class="cycle-overview-item">
        <small>Dia do ciclo</small>
        <strong>{{cycleDay?'Dia '+cycleDay:'—'}}</strong>
        <span>{{cycleDay?'estimado pelo calendário':'aguardando registro'}}</span>
      </div>
      <div class="cycle-overview-item">
        <small>Próximo início</small>
        <strong>{{predictedStart}}</strong>
        <span>estimativa, não garantia</span>
      </div>
    </section>

    <section class="cycle-settings">
      <div class="cycle-settings-title">
        <AppIcon name="calendar" :size="19"/>
        <div><strong>Como é seu ciclo?</strong><small>Você pode ajustar quando quiser.</small></div>
      </div>
      <div class="cycle-two-inputs">
        <label>Ciclo costuma durar
          <span><input type="number" inputmode="numeric" min="15" max="60" v-model.number="cycle.length" @change="clampCycle"/> dias</span>
        </label>
        <label>Menstruação dura
          <span><input type="number" inputmode="numeric" min="1" max="15" v-model.number="cycle.period" @change="clampPeriod"/> dias</span>
        </label>
      </div>
      <p>A contagem do ciclo começa no primeiro dia da menstruação. Os outros dias rosados usam a duração informada por você.</p>
    </section>

    <section v-if="savedStarts.length" class="cycle-recent">
      <strong>Meus registros</strong>
      <div class="cycle-recent-dates">
        <div v-for="start in savedStarts" :key="start">
          <span>{{dateLabel(start)}}</span>
          <button type="button" :aria-label="'Apagar início de '+dateLabel(start)" @click="removeStart(start)"><AppIcon name="close" :size="14"/></button>
        </div>
      </div>
    </section>

    <section class="cycle-training-guide">
      <button type="button" class="cycle-guide-toggle" :aria-expanded="guideOpen" @click="guideOpen=!guideOpen">
        <span class="cycle-guide-icon"><AppIcon name="help" :size="20"/></span>
        <span><strong>Como o ciclo pode influenciar meus treinos?</strong>
          <small>Veja as fases e possíveis mudanças na energia e na força</small></span>
        <AppIcon name="chevron" :size="18"/>
      </button>
      <div v-if="guideOpen" class="cycle-guide-content">
        <p class="cycle-guide-intro">O ciclo pode mudar como você <em>se sente</em> para treinar. A força não segue uma regra fixa: observe seus sintomas e seu desempenho individual.</p>
        <article><span class="cycle-guide-dot menstrual"></span><div><strong>Menstruação</strong><p>Cólicas e cansaço podem tornar alguns treinos mais difíceis. Se sentir necessidade, reduza o ritmo ou adapte exercícios.</p></div></article>
        <article><span class="cycle-guide-dot follicular"></span><div><strong>Fase folicular</strong><p>Algumas mulheres percebem mais disposição, mas isso varia. Vale acompanhar como você responde às cargas.</p></div></article>
        <article><span class="cycle-guide-dot ovulatory"></span><div><strong>Período ovulatório</strong><p>Não é garantido que a força aumente. O calendário sozinho não confirma quando houve ovulação.</p></div></article>
        <article><span class="cycle-guide-dot luteal"></span><div><strong>Fase lútea / pré-menstrual</strong><p>Sensibilidade, sono, calor ou sintomas de TPM podem afetar a percepção de esforço. Ajuste o treino conforme seu bem-estar.</p></div></article>
        <p class="cycle-guide-caution">Estas informações são educativas, não recomendam diminuir ou aumentar cargas automaticamente e não servem para prever fertilidade, prevenir gravidez ou diagnosticar condições de saúde.</p>
      </div>
    </section>

    <section class="cycle-optional-notes">
      <button type="button" class="cycle-notes-toggle" :aria-expanded="notesOpen" @click="notesOpen=!notesOpen">
        <AppIcon name="pencil" :size="17"/>
        <span>Registrar como me senti <small>Opcional · energia, treino e sintomas</small></span>
        <AppIcon name="chevron" :size="17"/>
      </button>
      <div v-if="notesOpen" class="cycle-notes-body">
        <label>Dia <input type="date" v-model="noteDate"/></label>
        <div class="cycle-two-inputs">
          <label>Energia <select v-model="noteEnergy"><option value="baixa">Baixa</option><option value="normal">Normal</option><option value="alta">Alta</option></select></label>
          <label>Treino <select v-model="noteDifficulty"><option value="leve">Leve</option><option value="normal">Normal</option><option value="pesada">Pesado</option></select></label>
        </div>
        <label>Observações <textarea v-model="noteSymptoms" rows="2" placeholder="Cólicas, disposição, humor..."/></label>
        <button type="button" class="cycle-save-note" @click="addNote">Salvar observação</button>
        <div v-if="cycle.notes.length" class="cycle-note-history">
          <strong>Observações anteriores</strong>
          <div v-for="(note,i) in cycle.notes.slice(0,5)" :key="i">
            <strong>{{note.date}}</strong><span>Energia {{note.energy}} · Treino {{note.difficulty}}</span>
            <small v-if="note.symptoms">{{note.symptoms}}</small>
          </div>
        </div>
      </div>
    </section>
    <div v-if="phaseModal" class="cycle-phase-backdrop" @click.self="closePhase" @keydown.esc="closePhase">
      <section role="dialog" aria-modal="true" aria-labelledby="cycle-phase-modal-title"
        class="cycle-phase-popup" :class="'phase-'+phaseModal.id">
        <div class="cycle-phase-popup-top">
          <span class="cycle-phase-popup-dot"></span>
          <span>ENTENDA SUA FASE</span>
          <button type="button" aria-label="Fechar explicação" @click="closePhase"><AppIcon name="close" :size="19"/></button>
        </div>
        <h2 id="cycle-phase-modal-title">{{phaseModal.title}}</h2>
        <p>{{phaseModal.description}}</p>
        <div class="cycle-phase-popup-note">
          <AppIcon name="dumbbell" :size="19"/>
          <span>O desempenho e a força variam de pessoa para pessoa. Observe seus próprios registros e ajuste o treino pelo que sentir, não apenas pelo calendário.</span>
        </div>
        <p class="cycle-phase-popup-disclaimer">As fases são estimativas. Este calendário não confirma ovulação nem serve para contracepção ou diagnóstico.</p>
        <button type="button" class="cycle-phase-popup-close" @click="closePhase">Entendi!</button>
      </section>
    </div>
    <p class="cycle-privacy"><AppIcon name="lock" :size="15"/> {{demoMode?'Modo demonstração: os registros não são salvos.':'Seus registros são pessoais e sincronizados com sua conta. Evite dispositivos compartilhados.'}} A previsão é aproximada.</p>
  </div>
</template>