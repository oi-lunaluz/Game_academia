<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'

const props=defineProps({
  stages:{type:Array,required:true},
  selectedNumber:{type:Number,required:true},
  chapter:{type:Number,required:true}
})
const emit=defineEmits(['select'])
const viewport=ref(null)
const dimensions=ref({width:360,height:600})
let observer=null
const activeNode=computed(()=>props.stages.find(s=>s.current)||null)
const focusNode=computed(()=>activeNode.value||props.stages[0]||{x:50,y:50})

// The square illustration is a game world, not a tiny centered thumbnail.
// On narrow phones, the camera pans horizontally and keeps the current ledge in view.
const world=computed(()=>{
  const {width,height}=dimensions.value
  const top=height<590?88:108
  const size=Math.max(width,Math.min(height-top-62,width*1.7))
  const focus=focusNode.value.x/100*size
  const left=Math.min(0,Math.max(width-size,width/2-focus))
  return {width:size,height:size,left,top}
})
const worldStyle=computed(()=>({
  width:world.value.width+'px',
  height:world.value.height+'px',
  left:world.value.left+'px',
  top:world.value.top+'px'
}))
function resize(){
  if(!viewport.value)return
  const bounds=viewport.value.getBoundingClientRect()
  dimensions.value={width:bounds.width,height:bounds.height}
}
onMounted(async()=>{
  await nextTick()
  resize()
  if(typeof ResizeObserver!=='undefined'){
    observer=new ResizeObserver(resize)
    observer.observe(viewport.value)
  }
})
onBeforeUnmount(()=>{observer?.disconnect();observer=null})
</script>

<template>
  <div class="pixel-map-frame">
    <div ref="viewport" class="pixel-map quest-full-map quest-world-viewport"
      role="group" :aria-label="'Mapa do castelo, área '+(chapter+1)+' com cinco plataformas de treino'">
      <div class="quest-platform-canvas" :style="worldStyle">
        <img class="quest-platform-image" src="/quest-castle-hd.webp"
          alt="" aria-hidden="true" draggable="false"/>
        <svg class="quest-jump-trail" viewBox="0 0 1000 1000" aria-hidden="true">
          <path d="M160 855 C250 805 380 875 525 855 S615 690 610 663 S825 550 863 318 S740 190 675 160"
            fill="none" stroke="#342c29" stroke-width="11" stroke-dasharray="8 26" stroke-linecap="round" opacity=".72"/>
          <path d="M160 855 C250 805 380 875 525 855 S615 690 610 663 S825 550 863 318 S740 190 675 160"
            fill="none" stroke="#fbe5a5" stroke-width="6" stroke-dasharray="8 26" stroke-linecap="round"/>
        </svg>
        <button v-for="stage in stages" :key="stage.number" type="button"
          class="pixel-stage quest-ledge"
          :class="{
            'is-cleared':stage.completed,
            'is-active':stage.current,
            'is-locked':stage.locked,
            'is-selected':stage.number===selectedNumber
          }"
          :style="{left:stage.x+'%',top:stage.y+'%'}"
          :aria-label="'Abrir fase '+stage.number+', '+stage.name+(stage.completed?', concluída':stage.current?', fase atual':', futura')"
          :aria-pressed="stage.number===selectedNumber"
          @click="emit('select',stage.number)">
          <span class="pixel-stage-circle">{{stage.completed?'✓':stage.number}}</span>
          <span class="pixel-stage-name">{{stage.name}}</span>
        </button>
        <div v-if="activeNode" class="pixel-party quest-adventurers"
          :style="{left:activeNode.x+'%',top:activeNode.y+'%'}">
          <img class="pixel-party-girl" src="/pixel-hero-girl.svg" alt="Menina de cabelo castanho avançando pelas plataformas"/>
          <img class="pixel-party-mary" src="/pixel-caramary.svg" alt="CaraMary acompanha a aventureira"/>
        </div>
      </div>
      <slot name="hud"></slot>
      <slot name="navigation"></slot>
    </div>
  </div>
</template>
