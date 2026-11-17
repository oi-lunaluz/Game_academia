<script setup>
import { computed } from 'vue'

const props=defineProps({
  stages:{type:Array,required:true},
  selectedNumber:{type:Number,required:true},
  chapter:{type:Number,required:true}
})
const emit=defineEmits(['select'])
const activeNode=computed(()=>props.stages.find(s=>s.current)||null)
</script>
<template>
  <div class="pixel-map-frame">
    <div class="pixel-map quest-full-map quest-visual-v2" role="group" :aria-label="'Mapa da área '+(chapter+1)+' com cinco fases'">
      <div class="quest-platform-canvas">
        <img class="quest-platform-image" src="/quest-castle-hd.webp"
          alt="" aria-hidden="true" draggable="false"/>

      <button v-for="stage in stages" :key="stage.number" type="button"
        class="pixel-stage" :class="{
          'is-cleared':stage.completed,
          'is-active':stage.current,
          'is-locked':stage.locked,
          'is-selected':stage.number===selectedNumber
        }"
        :style="{left:stage.x+'%',top:stage.y+'%'}"
        :aria-label="'Fase '+stage.number+', '+stage.name+(stage.completed?', concluída':stage.current?', próxima missão':', futura')"
        :aria-pressed="stage.number===selectedNumber"
        @click="emit('select',stage.number)">
        <span class="pixel-stage-circle">{{stage.completed?'✓':stage.number}}</span>
        <span class="pixel-stage-name">{{stage.name}}</span>
      </button>
      <div v-if="activeNode" class="pixel-party"
        :style="{left:activeNode.x+'%',top:activeNode.y+'%'}">
        <img class="pixel-party-girl" src="/pixel-hero-girl.svg" alt="Menina de cabelo castanho avançando no mapa"/>
        <img class="pixel-party-mary" src="/pixel-caramary.svg" alt="CaraMary acompanha a aventureira"/>
      </div>
      </div>
      <slot name="hud"></slot>
      <slot name="navigation"></slot>
    </div>
  </div>
</template>
