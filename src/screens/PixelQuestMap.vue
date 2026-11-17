<script setup>
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import AppIcon from '../AppIcon.vue'

const props=defineProps({
  stages:{type:Array,required:true},
  selectedNumber:{type:Number,required:true},
  chapter:{type:Number,required:true}
})
const emit=defineEmits(['select'])
const scrollArea=ref(null)
const activeNode=computed(()=>props.stages.find(s=>s.current)||null)
const nodes=computed(()=>props.stages.map((stage,index)=>({
  ...stage,
  ...[
    {x:45,y:12},{x:72,y:30},{x:45,y:48},
    {x:22,y:66},{x:50,y:84}
  ][index]
})))
const currentPosition=computed(()=>{
  const node=nodes.value.find(s=>s.current)
  if(!node)return null
  // Characters travel alongside the current phase, without hiding its number.
  return {left:(node.x>58?node.x-25:node.x+23)+'%',top:node.y+'%'}
})
function centerCurrent(){
  if(!scrollArea.value)return
  const node=nodes.value.find(s=>s.current)
  if(!node){
    scrollArea.value.scrollTo({top:0,behavior:'instant'})
    return
  }
  const visible=scrollArea.value.clientHeight
  const absoluteY=138+node.y/100*790
  const target=Math.max(0,absoluteY-visible*.52)
  scrollArea.value.scrollTo({top:target,behavior:'instant'})
}
onMounted(()=>nextTick(centerCurrent))
watch(()=>[props.chapter,props.stages.find(s=>s.current)?.number],()=>nextTick(centerCurrent))
</script>

<template>
  <div class="pixel-map-frame">
    <div class="pixel-map quest-full-map duo-trail-map" role="group"
      :aria-label="'Trilha de treino, área '+(chapter+1)+'. Deslize para cima e para baixo para ver as fases.'">
      <div ref="scrollArea" class="duo-trail-scroll" tabindex="0"
        aria-label="Caminho vertical das cinco fases">
        <div class="duo-trail-world">
          <svg class="duo-world-scenery" viewBox="0 0 360 790" preserveAspectRatio="none" aria-hidden="true">
            <path d="M-40 87 Q28 29 100 82 T261 77 T400 90 V0 H-40 Z" fill="#b8e9db" opacity=".53"/>
            <path d="M-30 440 Q61 380 121 440 T263 432 T394 422 V790 H-30Z" fill="#92d6b0" opacity=".44"/>
            <g fill="#e5f7d2" opacity=".72">
              <ellipse cx="23" cy="205" rx="58" ry="28"/>
              <ellipse cx="343" cy="353" rx="69" ry="31"/>
              <ellipse cx="12" cy="604" rx="60" ry="24"/>
            </g>
            <g fill="#5dba86" opacity=".65">
              <path d="M6 145l17-40 17 40z M13 118l10-29 10 29z"/>
              <path d="M302 175l20-46 20 46z M310 145l12-35 12 35z"/>
              <path d="M313 560l20-42 20 42z M321 534l12-31 12 31z"/>
              <path d="M2 712l20-45 20 45z M9 687l13-34 13 34z"/>
            </g>
            <g stroke="#4e9562" stroke-width="4" stroke-linecap="round" opacity=".65">
              <path d="M23 145v20 M322 175v20 M333 560v20 M22 712v19"/>
            </g>
            <g fill="#f6ca7e">
              <circle cx="59" cy="314" r="5"/><circle cx="306" cy="435" r="6"/>
              <circle cx="292" cy="676" r="5"/><circle cx="55" cy="76" r="5"/>
            </g>
            <g fill="#f7a9b7">
              <circle cx="52" cy="310" r="4"/><circle cx="65" cy="309" r="4"/>
              <circle cx="302" cy="428" r="5"/><circle cx="313" cy="430" r="5"/>
              <circle cx="286" cy="671" r="4"/><circle cx="298" cy="672" r="4"/>
            </g>
            <g fill="#ffffff" opacity=".7">
              <path d="M83 197h8v8h-8z M298 283h7v7h-7z M39 483h6v6h-6z M280 735h7v7h-7z"/>
            </g>
          </svg>

          <svg class="duo-trail-path" viewBox="0 0 360 790" preserveAspectRatio="none" aria-hidden="true">
            <path class="duo-trail-path-shadow"
              d="M162 95 C162 158 259 154 259 237 S162 296 162 379 S79 461 79 521 S180 588 180 664"/>
            <path class="duo-trail-path-road"
              d="M162 95 C162 158 259 154 259 237 S162 296 162 379 S79 461 79 521 S180 588 180 664"/>
            <path class="duo-trail-path-dash"
              d="M162 95 C162 158 259 154 259 237 S162 296 162 379 S79 461 79 521 S180 588 180 664"/>
          </svg>

          <div class="duo-trail-area-label">BOSQUE DA FORÇA <span>· ÁREA {{chapter+1}}</span></div>

          <button v-for="stage in nodes" :key="stage.number" type="button"
            class="duo-trail-node"
            :class="{'is-cleared':stage.completed,'is-active':stage.current,
              'is-future':stage.locked,'is-selected':stage.number===selectedNumber}"
            :style="{left:stage.x+'%',top:stage.y+'%'}"
            :aria-label="'Abrir fase '+stage.number+', '+stage.name+
              (stage.completed?', concluída':stage.current?', fase atual':', próxima missão')"
            :aria-pressed="stage.number===selectedNumber"
            @click="emit('select',stage.number)">
            <span v-if="stage.current" class="duo-now-label">VOCÊ ESTÁ AQUI</span>
            <span class="duo-trail-node-disc">
              <span class="duo-trail-node-face">
                <AppIcon v-if="stage.completed" name="check" :size="28"/>
                <AppIcon v-else-if="stage.locked" name="lock" :size="24"/>
                <span v-else>{{stage.number}}</span>
              </span>
            </span>
            <span class="duo-trail-stage-name">{{stage.number}} · {{stage.name}}</span>
          </button>

          <div v-if="currentPosition" class="duo-trail-characters" :style="currentPosition"
            aria-label="A aventureira e CaraMary no ponto atual">
            <img src="/pixel-hero-girl.svg" alt="A aventureira"/>
            <img src="/pixel-caramary.svg" alt="CaraMary"/>
          </div>
          <div class="duo-trail-end">CONTINUA NA PRÓXIMA ÁREA</div>
        </div>
      </div>
      <slot name="hud"></slot>
      <slot name="navigation"></slot>
    </div>
  </div>
</template>
